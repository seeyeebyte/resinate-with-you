import type { Artist, Product, ProductImage, ProductStatus } from "@/lib/mock-data";
import { artists as mockArtists, products as mockProducts } from "@/lib/mock-data";
import { parseProductNotes } from "@/lib/product-notes";
import { getSupabaseServiceClient } from "@/lib/supabase";
import type { PlatformKey } from "@/components/PlatformLinks";

type SupabaseArtistRow = {
  id: string;
  slug?: string | null;
  brand_name?: string | null;
  contact_name?: string | null;
  contact_email?: string | null;
  contact_link_label?: string | null;
  bio?: string | null;
  country?: string | null;
  city?: string | null;
  artist_type?: "individual" | "offline_studio" | null;
  studio_address?: string | null;
  instagram_url?: string | null;
  website_url?: string | null;
  shop_url?: string | null;
  avatar_url?: string | null;
  categories?: string[] | null;
  sample_image_urls?: string[] | null;
  accepts_custom?: boolean | null;
  ships_international?: boolean | null;
  status?: string | null;
};

type SupabaseImageRow = {
  image_url?: string | null;
  alt_text?: string | null;
  sort_order?: number | null;
};

type SupabaseProductRow = {
  id: string;
  slug?: string | null;
  artist_id?: string | null;
  title?: string | null;
  category?: string | null;
  price_text?: string | null;
  description?: string | null;
  external_url?: string | null;
  status?: ProductStatus | string | null;
  is_featured?: boolean | null;
  admin_notes?: string | null;
  artists?: SupabaseArtistRow | SupabaseArtistRow[] | null;
  product_images?: SupabaseImageRow[] | null;
};

const artistSelect = `
  id,
  slug,
  brand_name,
  contact_name,
  contact_email,
  contact_link_label,
  bio,
  country,
  city,
  artist_type,
  studio_address,
  instagram_url,
  website_url,
  shop_url,
  avatar_url,
  categories,
  sample_image_urls,
  accepts_custom,
  ships_international,
  status
`;

const productSelect = `
  id,
  slug,
  artist_id,
  title,
  category,
  price_text,
  description,
  external_url,
  status,
  is_featured,
  admin_notes,
  artists (${artistSelect}),
  product_images (image_url, alt_text, sort_order)
`;

export async function getPublicArtists() {
  const supabase = getSupabaseServiceClient();

  if (!supabase) {
    return mockArtists;
  }

  const { data, error } = await supabase
    .from("artists")
    .select(artistSelect)
    .eq("status", "approved")
    .order("updated_at", { ascending: false });

  if (error || !data?.length) {
    return mockArtists;
  }

  return (data as SupabaseArtistRow[]).map(mapArtistRow).filter((artist): artist is Artist => Boolean(artist));
}

export async function getPublicProducts() {
  const supabase = getSupabaseServiceClient();

  if (!supabase) {
    return mockProducts.filter((product) => product.status === "approved");
  }

  const { data, error } = await supabase
    .from("products")
    .select(productSelect)
    .eq("status", "approved")
    .order("updated_at", { ascending: false });

  if (error || !data?.length) {
    return mockProducts.filter((product) => product.status === "approved");
  }

  return (data as SupabaseProductRow[]).map(mapProductRow).filter((product): product is Product => Boolean(product));
}

export async function getPublicArtistBySlug(slug: string) {
  const supabase = getSupabaseServiceClient();

  if (!supabase) {
    return mockArtists.find((artist) => artist.slug === slug) ?? null;
  }

  const { data, error } = await supabase
    .from("artists")
    .select(artistSelect)
    .eq("status", "approved")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) {
    return mockArtists.find((artist) => artist.slug === slug) ?? null;
  }

  return mapArtistRow(data as SupabaseArtistRow);
}

export async function getPublicProductBySlug(slug: string) {
  const supabase = getSupabaseServiceClient();

  if (!supabase) {
    return mockProducts.find((product) => product.slug === slug && product.status === "approved") ?? null;
  }

  const { data, error } = await supabase
    .from("products")
    .select(productSelect)
    .eq("status", "approved")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) {
    return mockProducts.find((product) => product.slug === slug && product.status === "approved") ?? null;
  }

  return mapProductRow(data as SupabaseProductRow);
}

export async function getPublicProductsByArtistSlug(artistSlug: string) {
  const products = await getPublicProducts();
  return products.filter((product) => product.artistSlug === artistSlug);
}

function mapArtistRow(row: SupabaseArtistRow | null | undefined): Artist | null {
  if (!row?.id || row.status !== "approved") {
    return null;
  }

  return {
    id: row.id,
    slug: row.slug || row.id,
    brandName: row.brand_name || "Untitled artist",
    city: row.city || "Online",
    country: row.country || "Worldwide",
    artistType: row.artist_type === "offline_studio" ? "offline_studio" : "individual",
    studioAddress: row.studio_address || undefined,
    bio: row.bio || "Independent resin artist.",
    categories: row.categories?.length ? row.categories : ["Resin Art"],
    acceptsCustom: Boolean(row.accepts_custom),
    shipsInternational: Boolean(row.ships_international),
    instagramUrl: row.instagram_url || "",
    websiteUrl: row.website_url || "",
    shopUrl: row.shop_url || "",
    contactEmail: row.contact_email || undefined,
    platformLinks: platformLinksFromArtist(row),
    avatarUrl: row.avatar_url || undefined,
    avatarTone: avatarTone(row.id),
  };
}

function platformKeyFromLabel(label: string | null | undefined): PlatformKey {
  const normalized = label?.trim().toLowerCase();
  const map: Record<string, PlatformKey> = {
    wechat: "wechat",
    xiaohongshu: "xiaohongshu",
    line: "line",
    shopee: "shopee",
    naver: "naver",
    kakaotalk: "kakaotalk",
    etsy: "etsy",
  };

  return normalized && map[normalized] ? map[normalized] : "other";
}

function platformLinksFromArtist(row: SupabaseArtistRow) {
  const links = [];

  if (row.instagram_url) {
    links.push({
      platform: "instagram" as const,
      value: "Instagram",
      href: row.instagram_url,
    });
  }

  if (row.contact_link_label && row.shop_url) {
    links.push({
      platform: platformKeyFromLabel(row.contact_link_label),
      value: row.contact_link_label,
      href: hrefFromContactValue(row.shop_url),
    });
  }

  if (row.contact_email) {
    links.push({
      platform: "email" as const,
      value: row.contact_email,
      href: `mailto:${row.contact_email}`,
    });
  }

  return links.length ? links : undefined;
}

function hrefFromContactValue(value: string | null | undefined) {
  if (!value) {
    return undefined;
  }

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? value : undefined;
  } catch {
    return undefined;
  }
}

function mapProductRow(row: SupabaseProductRow | null | undefined): Product | null {
  if (!row?.id || row.status !== "approved") {
    return null;
  }

  const artist = Array.isArray(row.artists) ? row.artists[0] : row.artists;
  const images = mapProductImages(row.product_images, row.title || "Resin product");
  const notes = parseProductNotes(row.admin_notes);
  const fallbackImage = artist?.sample_image_urls?.[0] || "/assets/resin-collection.png";
  const firstImage = images[0];

  return {
    id: row.id,
    slug: row.slug || row.id,
    artistSlug: artist?.slug || row.artist_id || "",
    artistName: artist?.brand_name || undefined,
    artistCity: artist?.city || undefined,
    artistCountry: artist?.country || undefined,
    title: row.title || "Untitled product",
    category: row.category || "Resin Art",
    priceText: row.price_text || "Price on request",
    description: row.description || "",
    externalUrl: row.external_url || "#",
    imageUrl: firstImage?.imageUrl || fallbackImage,
    imageAlt: firstImage?.imageAlt || row.title || "Resin product",
    imagePosition: "50% 50%",
    images: images.length
      ? images
      : [
          {
            imageUrl: fallbackImage,
            imageAlt: row.title || "Resin product",
            sortOrder: 0,
          },
        ],
    tags: notes.tags,
    isFeatured: Boolean(row.is_featured),
    status: "approved",
  };
}

function mapProductImages(rows: SupabaseImageRow[] | null | undefined, fallbackAlt: string): ProductImage[] {
  return [...(rows ?? [])]
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .filter((image) => Boolean(image.image_url))
    .map((image, index) => ({
      imageUrl: image.image_url || "",
      imageAlt: image.alt_text || fallbackAlt,
      sortOrder: image.sort_order ?? index,
    }));
}

function avatarTone(seed: string) {
  const tones = [
    "from-rose-200 to-amber-100",
    "from-cyan-100 to-emerald-100",
    "from-violet-100 to-pink-100",
    "from-slate-100 to-stone-100",
    "from-yellow-100 to-sky-100",
  ];
  const index = seed.split("").reduce((total, char) => total + char.charCodeAt(0), 0) % tones.length;
  return tones[index];
}
