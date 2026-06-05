import { NextResponse } from "next/server";
import { findApprovedArtistForUser } from "@/lib/artist-session";
import { formatProductNotes } from "@/lib/product-notes";
import { getSupabaseServiceClient, productImageBucket } from "@/lib/supabase";

const maxProductImages = 5;
const maxImageSize = 2 * 1024 * 1024;
const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const session = await getArtistSession(request);

  if ("response" in session) {
    return session.response;
  }

  const supabase = getSupabaseServiceClient();

  if (!supabase) {
    return NextResponse.json({ error: "Supabase service config is missing." }, { status: 503 });
  }

  const { id } = await context.params;
  const formData = await request.formData();
  const action = normalizeRequiredString(formData.get("action"));
  const existing = await getOwnProduct(id, session.artist.id);

  if (!existing) {
    return NextResponse.json({ error: "Product was not found." }, { status: 404 });
  }

  if (action === "hide" || action === "show") {
    const { data, error } = await supabase
      .from("products")
      .update({
        status: action === "hide" ? "hidden" : "approved",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("artist_id", session.artist.id)
      .select("id,status")
      .single();

    if (error || !data) {
      return NextResponse.json({ error: error?.message || "Product status could not be updated." }, { status: 500 });
    }

    return NextResponse.json({ product: data });
  }

  if (action === "delete-image") {
    const imageId = normalizeRequiredString(formData.get("image_id"));

    if (!imageId) {
      return NextResponse.json({ error: "Image was not found." }, { status: 400 });
    }

    const { data: currentImages, error: currentImagesError } = await supabase
      .from("product_images")
      .select("id,image_url")
      .eq("product_id", id);

    if (currentImagesError) {
      return NextResponse.json({ error: currentImagesError.message }, { status: 500 });
    }

    const deleting = (currentImages ?? []).find((image) => image.id === imageId);

    if (!deleting) {
      return NextResponse.json({ error: "Image was not found." }, { status: 404 });
    }

    if ((currentImages ?? []).length <= 1) {
      return NextResponse.json({ error: "Each product needs at least 1 image." }, { status: 400 });
    }

    const { error: deleteImageError } = await supabase
      .from("product_images")
      .delete()
      .eq("product_id", id)
      .eq("id", imageId);

    if (deleteImageError) {
      return NextResponse.json({ error: deleteImageError.message }, { status: 500 });
    }

    const filePath = storagePathFromPublicUrl(deleting.image_url);

    if (filePath) {
      await supabase.storage.from(productImageBucket).remove([filePath]);
    }

    return NextResponse.json({ deleted: true });
  }

  const title = normalizeRequiredString(formData.get("title"));
  const category = normalizeRequiredString(formData.get("category"));
  const priceText = normalizeRequiredString(formData.get("price_text"));
  const externalUrl = normalizeRequiredString(formData.get("external_url"));
  const description = normalizeRequiredString(formData.get("description"));
  const tags = normalizeOptionalString(formData.get("tags"));
  const altText = normalizeOptionalString(formData.get("alt_text"));
  const acceptsCustom = formData.get("accepts_custom") === "on";
  const shipsInternational = formData.get("ships_international") === "on";
  const imageIdsToDelete = formData.getAll("delete_image_ids").map(String).filter(Boolean);
  const newImages = formData.getAll("images").filter((item): item is File => item instanceof File && item.size > 0);

  if (!title || !category || !priceText || !externalUrl || !description) {
    return NextResponse.json({ error: "Please fill in all required product fields." }, { status: 400 });
  }

  if (!isValidUrl(externalUrl)) {
    return NextResponse.json({ error: "Product or shop link must be a valid URL." }, { status: 400 });
  }

  const { data: currentImages, error: currentImagesError } = await supabase
    .from("product_images")
    .select("id,image_url,sort_order")
    .eq("product_id", id);

  if (currentImagesError) {
    return NextResponse.json({ error: currentImagesError.message }, { status: 500 });
  }

  const remainingImageCount = (currentImages ?? []).filter((image) => !imageIdsToDelete.includes(image.id)).length;

  if (remainingImageCount + newImages.length === 0) {
    return NextResponse.json({ error: "Each product needs at least 1 image." }, { status: 400 });
  }

  if (remainingImageCount + newImages.length > maxProductImages) {
    return NextResponse.json({ error: `Each product can have no more than ${maxProductImages} images.` }, { status: 400 });
  }

  for (const image of newImages) {
    if (!allowedImageTypes.has(image.type)) {
      return NextResponse.json({ error: "Product photos must be JPG, PNG, or WebP." }, { status: 400 });
    }

    if (image.size > maxImageSize) {
      return NextResponse.json({ error: "Each product photo must be 2 MB or smaller." }, { status: 400 });
    }
  }

  const { data, error } = await supabase
    .from("products")
    .update({
      title,
      category,
      price_text: priceText,
      external_url: externalUrl,
      description,
      admin_notes: formatProductNotes({ tags, acceptsCustom, shipsInternational }) || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("artist_id", session.artist.id)
    .select("id,title,slug,status")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message || "Product could not be updated." }, { status: 500 });
  }

  if (imageIdsToDelete.length) {
    const deleting = (currentImages ?? []).filter((image) => imageIdsToDelete.includes(image.id));
    const { error: deleteImagesError } = await supabase
      .from("product_images")
      .delete()
      .eq("product_id", id)
      .in("id", imageIdsToDelete);

    if (deleteImagesError) {
      return NextResponse.json({ error: deleteImagesError.message }, { status: 500 });
    }

    const filePaths = deleting
      .map((image) => storagePathFromPublicUrl(image.image_url))
      .filter((path): path is string => Boolean(path));

    if (filePaths.length) {
      await supabase.storage.from(productImageBucket).remove(filePaths);
    }
  }

  if (newImages.length) {
    const maxSortOrder = Math.max(-1, ...(currentImages ?? []).map((image) => image.sort_order ?? 0));
    const uploadedImages = [];

    for (const [index, image] of newImages.entries()) {
      const extension = imageExtension(image);
      const path = `${session.artist.id}/${id}/${Date.now()}-${index + 1}.${extension}`;
      const { error: uploadError } = await supabase.storage.from(productImageBucket).upload(path, image, {
        contentType: image.type,
        upsert: false,
      });

      if (uploadError) {
        return NextResponse.json({ error: uploadError.message }, { status: 500 });
      }

      const { data: publicUrlData } = supabase.storage.from(productImageBucket).getPublicUrl(path);
      uploadedImages.push({
        product_id: id,
        image_url: publicUrlData.publicUrl,
        alt_text: altText || title,
        sort_order: maxSortOrder + index + 1,
      });
    }

    const { error: insertImagesError } = await supabase.from("product_images").insert(uploadedImages);

    if (insertImagesError) {
      return NextResponse.json({ error: insertImagesError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ product: data });
}

export async function DELETE(request: Request, context: RouteContext) {
  const session = await getArtistSession(request);

  if ("response" in session) {
    return session.response;
  }

  const supabase = getSupabaseServiceClient();

  if (!supabase) {
    return NextResponse.json({ error: "Supabase service config is missing." }, { status: 503 });
  }

  const { id } = await context.params;
  const existing = await getOwnProduct(id, session.artist.id);

  if (!existing) {
    return NextResponse.json({ error: "Product was not found." }, { status: 404 });
  }

  const { error } = await supabase.from("products").delete().eq("id", id).eq("artist_id", session.artist.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: files } = await supabase.storage.from(productImageBucket).list(`${session.artist.id}/${id}`);
  const filePaths = (files ?? []).map((file) => `${session.artist.id}/${id}/${file.name}`);

  if (filePaths.length) {
    await supabase.storage.from(productImageBucket).remove(filePaths);
  }

  return NextResponse.json({ deleted: true });
}

async function getArtistSession(request: Request) {
  const supabase = getSupabaseServiceClient();

  if (!supabase) {
    return { response: NextResponse.json({ error: "Supabase service config is missing." }, { status: 503 }) };
  }

  const accessToken = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();

  if (!accessToken) {
    return { response: NextResponse.json({ error: "Please sign in first." }, { status: 401 }) };
  }

  const { data: userData, error: userError } = await supabase.auth.getUser(accessToken);
  const user = userData.user;

  if (userError || !user?.email) {
    return { response: NextResponse.json({ error: "Please sign in again." }, { status: 401 }) };
  }

  const artist = await findApprovedArtistForUser(user.email, user.id);

  if (!artist) {
    return { response: NextResponse.json({ error: "Only approved artists can manage products." }, { status: 403 }) };
  }

  return { artist };
}

async function getOwnProduct(productId: string, artistId: string) {
  const supabase = getSupabaseServiceClient();

  if (!supabase) {
    return null;
  }

  const { data } = await supabase.from("products").select("id").eq("id", productId).eq("artist_id", artistId).maybeSingle();
  return data;
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

function storagePathFromPublicUrl(url: string | null | undefined) {
  if (!url) {
    return null;
  }

  const marker = `/object/public/${productImageBucket}/`;
  const [, path] = url.split(marker);
  return path ? decodeURIComponent(path) : null;
}
