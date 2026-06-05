import { NextResponse } from "next/server";
import { findApprovedArtistForUser } from "@/lib/artist-session";
import { formatProductNotes, parseProductNotes } from "@/lib/product-notes";
import { getSupabaseServiceClient, productImageBucket } from "@/lib/supabase";

const maxProductImages = 5;
const maxImageSize = 2 * 1024 * 1024;
const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

const productSelect = `
  id,
  title,
  slug,
  category,
  price_text,
  description,
  external_url,
  status,
  admin_notes,
  updated_at,
  product_images (id, image_url, alt_text, sort_order)
`;

type ArtistProductRow = {
  id: string;
  title?: string | null;
  slug?: string | null;
  category?: string | null;
  price_text?: string | null;
  description?: string | null;
  external_url?: string | null;
  status?: string | null;
  admin_notes?: string | null;
  product_images?: {
    id?: string | null;
    image_url?: string | null;
    alt_text?: string | null;
    sort_order?: number | null;
  }[] | null;
};

export async function GET(request: Request) {
  const session = await getArtistSession(request);

  if ("response" in session) {
    return session.response;
  }

  const supabase = getSupabaseServiceClient();

  if (!supabase) {
    return NextResponse.json({ error: "Supabase service config is missing." }, { status: 503 });
  }

  const { data, error } = await supabase
    .from("products")
    .select(productSelect)
    .eq("artist_id", session.artist.id)
    .order("updated_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    limit: 15,
    products: ((data ?? []) as ArtistProductRow[]).map(mapArtistProduct),
  });
}

export async function POST(request: Request) {
  const session = await getArtistSession(request);

  if ("response" in session) {
    return session.response;
  }

  const supabase = getSupabaseServiceClient();

  if (!supabase) {
    return NextResponse.json({ error: "Supabase service config is missing." }, { status: 503 });
  }

  const formData = await request.formData();
  const title = normalizeRequiredString(formData.get("title"));
  const category = normalizeRequiredString(formData.get("category"));
  const priceText = normalizeRequiredString(formData.get("price_text"));
  const externalUrl = normalizeRequiredString(formData.get("external_url"));
  const description = normalizeRequiredString(formData.get("description"));
  const tags = normalizeOptionalString(formData.get("tags"));
  const altText = normalizeOptionalString(formData.get("alt_text"));
  const acceptsCustom = formData.get("accepts_custom") === "on";
  const shipsInternational = formData.get("ships_international") === "on";
  const images = formData.getAll("images").filter((item): item is File => item instanceof File && item.size > 0);

  if (!title || !category || !priceText || !externalUrl || !description) {
    return NextResponse.json({ error: "Please fill in all required product fields." }, { status: 400 });
  }

  if (!isValidUrl(externalUrl)) {
    return NextResponse.json({ error: "Product or shop link must be a valid URL." }, { status: 400 });
  }

  if (images.length === 0) {
    return NextResponse.json({ error: "Please upload at least 1 product photo." }, { status: 400 });
  }

  if (images.length > maxProductImages) {
    return NextResponse.json({ error: `Please upload no more than ${maxProductImages} product photos.` }, { status: 400 });
  }

  for (const image of images) {
    if (!allowedImageTypes.has(image.type)) {
      return NextResponse.json({ error: "Product photos must be JPG, PNG, or WebP." }, { status: 400 });
    }

    if (image.size > maxImageSize) {
      return NextResponse.json({ error: "Each product photo must be 2 MB or smaller." }, { status: 400 });
    }
  }

  const slug = await createUniqueProductSlug(title);
  const productNotes = formatProductNotes({ tags, acceptsCustom, shipsInternational });
  const { data: product, error: productError } = await supabase
    .from("products")
    .insert({
      artist_id: session.artist.id,
      title,
      slug,
      description,
      category,
      price_text: priceText,
      external_url: externalUrl,
      status: "approved",
      is_featured: false,
      admin_notes: productNotes || null,
    })
    .select("id,title,slug")
    .single();

  if (productError || !product) {
    return NextResponse.json({ error: productError?.message || "Product could not be created." }, { status: 500 });
  }

  const uploadedImages: { image_url: string; alt_text: string | null; sort_order: number }[] = [];

  for (const [index, image] of images.entries()) {
    const extension = imageExtension(image);
    const path = `${session.artist.id}/${product.id}/${index + 1}-${Date.now()}.${extension}`;
    const { error: uploadError } = await supabase.storage.from(productImageBucket).upload(path, image, {
      contentType: image.type,
      upsert: false,
    });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data } = supabase.storage.from(productImageBucket).getPublicUrl(path);
    uploadedImages.push({
      image_url: data.publicUrl,
      alt_text: altText || title,
      sort_order: index,
    });
  }

  const { error: imageInsertError } = await supabase.from("product_images").insert(
    uploadedImages.map((image) => ({
      product_id: product.id,
      ...image,
    })),
  );

  if (imageInsertError) {
    return NextResponse.json({ error: imageInsertError.message }, { status: 500 });
  }

  return NextResponse.json({
    product,
    artist: session.artist,
  });
}

async function getArtistSession(request: Request) {
  const supabase = getSupabaseServiceClient();

  if (!supabase) {
    return { response: NextResponse.json({ error: "Supabase service config is missing." }, { status: 503 }) };
  }

  const accessToken = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();

  if (!accessToken) {
    return { response: NextResponse.json({ error: "Please sign in before publishing a product." }, { status: 401 }) };
  }

  const { data: userData, error: userError } = await supabase.auth.getUser(accessToken);
  const user = userData.user;

  if (userError || !user?.email) {
    return { response: NextResponse.json({ error: "Please sign in again before publishing a product." }, { status: 401 }) };
  }

  const artist = await findApprovedArtistForUser(user.email, user.id);

  if (!artist) {
    return { response: NextResponse.json({ error: "Only approved artists can publish products." }, { status: 403 }) };
  }

  return { artist };
}

function mapArtistProduct(row: ArtistProductRow) {
  const notes = parseProductNotes(row.admin_notes);
  const image = [...(row.product_images ?? [])].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))[0];

  return {
    id: row.id,
    title: row.title || "",
    slug: row.slug || row.id,
    category: row.category || "",
    priceText: row.price_text || "",
    description: row.description || "",
    externalUrl: row.external_url || "",
    status: row.status || "approved",
    tags: notes.tags,
    tagsText: notes.tags.join(", "),
    acceptsCustom: notes.acceptsCustom,
    shipsInternational: notes.shipsInternational,
    images: [...(row.product_images ?? [])]
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
      .filter((image) => Boolean(image.id && image.image_url))
      .map((image, index) => ({
        id: image.id || "",
        imageUrl: image.image_url || "",
        imageAlt: image.alt_text || row.title || "Product image",
        sortOrder: image.sort_order ?? index,
      })),
    imageUrl: image?.image_url || "",
    imageAlt: image?.alt_text || row.title || "Product image",
  };
}

async function createUniqueProductSlug(title: string) {
  const supabase = getSupabaseServiceClient();
  const base = slugify(title) || "product";

  if (!supabase) {
    return `${base}-${crypto.randomUUID().slice(0, 8)}`;
  }

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const suffix = attempt === 0 ? "" : `-${crypto.randomUUID().slice(0, 6)}`;
    const slug = `${base}${suffix}`;
    const { data } = await supabase.from("products").select("id").eq("slug", slug).maybeSingle();

    if (!data) {
      return slug;
    }
  }

  return `${base}-${crypto.randomUUID().slice(0, 8)}`;
}

function normalizeRequiredString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeOptionalString(value: FormDataEntryValue | null) {
  const text = normalizeRequiredString(value);
  return text || null;
}

function isValidUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function imageExtension(file: File) {
  if (file.type === "image/png") {
    return "png";
  }

  if (file.type === "image/webp") {
    return "webp";
  }

  return "jpg";
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
}
