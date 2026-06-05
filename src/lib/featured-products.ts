import { products, type Product } from "@/lib/mock-data";
import { parseProductNotes } from "@/lib/product-notes";
import { getSupabaseServiceClient } from "@/lib/supabase";

export const featuredProductLimit = 6;

export type FeaturedProductRecord = {
  id: string;
  productId: string;
  product: Product;
  sortOrder: number;
  isActive: boolean;
  imageOverrideUrl: string | null;
  imageOverrideAlt: string | null;
  imagePosition: string | null;
};

export type FeaturedProductAdminData = {
  configured: boolean;
  warning: string | null;
  featuredProducts: FeaturedProductRecord[];
  approvedProducts: Product[];
};

type SupabaseArtistRow = {
  slug?: string | null;
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
  status?: string | null;
  is_featured?: boolean | null;
  admin_notes?: string | null;
  artists?: SupabaseArtistRow | SupabaseArtistRow[] | null;
  product_images?: SupabaseImageRow[] | null;
};

type SupabaseFeaturedRow = {
  id: string;
  product_id: string;
  sort_order?: number | null;
  is_active?: boolean | null;
  starts_at?: string | null;
  ends_at?: string | null;
  image_override_url?: string | null;
  image_override_alt?: string | null;
  image_position?: string | null;
  products?: SupabaseProductRow | SupabaseProductRow[] | null;
};

const featuredSelect = `
  id,
  product_id,
  sort_order,
  is_active,
  starts_at,
  ends_at,
  image_override_url,
  image_override_alt,
  image_position,
  products (
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
    artists ( slug ),
    product_images ( image_url, alt_text, sort_order )
  )
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
  artists ( slug ),
  product_images ( image_url, alt_text, sort_order )
`;

export async function getHomepageFeaturedProducts() {
  const supabase = getSupabaseServiceClient();

  if (!supabase) {
    return getMockFeaturedProducts();
  }

  const { data, error } = await supabase
    .from("featured_products")
    .select(featuredSelect)
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .limit(featuredProductLimit);

  if (error || !data?.length) {
    return getMockFeaturedProducts();
  }

  const now = Date.now();
  const featured = (data as SupabaseFeaturedRow[])
    .filter((item) => isWithinFeaturedWindow(item, now))
    .map(mapFeaturedRow)
    .filter((item): item is FeaturedProductRecord => Boolean(item))
    .slice(0, featuredProductLimit);

  return featured.length ? featured.map((item) => item.product) : getMockFeaturedProducts();
}

export async function getFeaturedProductAdminData(): Promise<FeaturedProductAdminData> {
  const supabase = getSupabaseServiceClient();

  if (!supabase) {
    return {
      configured: false,
      warning: "Supabase service config is missing. You can preview this page, but saved changes need Supabase.",
      featuredProducts: getMockFeaturedProducts().map((product, index) => ({
        id: `mock-featured-${product.id}`,
        productId: product.id,
        product,
        sortOrder: index,
        isActive: true,
        imageOverrideUrl: null,
        imageOverrideAlt: null,
        imagePosition: product.imagePosition,
      })),
      approvedProducts: products.filter((product) => product.status === "approved"),
    };
  }

  const [featuredResult, productsResult] = await Promise.all([
    supabase.from("featured_products").select(featuredSelect).order("sort_order", { ascending: true }),
    supabase.from("products").select(productSelect).eq("status", "approved").order("updated_at", { ascending: false }),
  ]);

  const warning = featuredResult.error?.message || productsResult.error?.message || null;

  return {
    configured: true,
    warning,
    featuredProducts: ((featuredResult.data ?? []) as SupabaseFeaturedRow[])
      .map(mapFeaturedRow)
      .filter((item): item is FeaturedProductRecord => Boolean(item)),
    approvedProducts: ((productsResult.data ?? []) as SupabaseProductRow[])
      .map((product) => mapProductRow(product))
      .filter((product): product is Product => Boolean(product)),
  };
}

export function getMockFeaturedProducts() {
  return products.filter((product) => product.isFeatured && product.status === "approved").slice(0, featuredProductLimit);
}

function mapFeaturedRow(row: SupabaseFeaturedRow): FeaturedProductRecord | null {
  const productRow = Array.isArray(row.products) ? row.products[0] : row.products;
  const product = mapProductRow(productRow, row);

  if (!product) {
    return null;
  }

  return {
    id: row.id,
    productId: row.product_id,
    product,
    sortOrder: row.sort_order ?? 0,
    isActive: row.is_active ?? true,
    imageOverrideUrl: row.image_override_url ?? null,
    imageOverrideAlt: row.image_override_alt ?? null,
    imagePosition: row.image_position ?? product.imagePosition,
  };
}

function mapProductRow(row: SupabaseProductRow | null | undefined, featured?: SupabaseFeaturedRow): Product | null {
  if (!row?.id || row.status !== "approved") {
    return null;
  }

  const artist = Array.isArray(row.artists) ? row.artists[0] : row.artists;
  const firstImage = [...(row.product_images ?? [])].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))[0];
  const notes = parseProductNotes(row.admin_notes);
  const imageUrl = firstImage?.image_url || "/assets/resin-collection.png";
  const imageAlt = firstImage?.alt_text || row.title || "Resin product";

  return {
    id: row.id,
    slug: row.slug || row.id,
    artistSlug: artist?.slug || row.artist_id || "",
    title: row.title || "Untitled product",
    category: row.category || "Resin Art",
    priceText: row.price_text || "Price on request",
    description: row.description || "",
    externalUrl: row.external_url || "#",
    imageUrl,
    imageAlt,
    imagePosition: "50% 50%",
    tags: notes.tags,
    isFeatured: row.is_featured ?? Boolean(featured),
    status: "approved",
  };
}

function isWithinFeaturedWindow(item: SupabaseFeaturedRow, now: number) {
  const startsAt = item.starts_at ? Date.parse(item.starts_at) : null;
  const endsAt = item.ends_at ? Date.parse(item.ends_at) : null;

  if (startsAt && startsAt > now) {
    return false;
  }

  if (endsAt && endsAt < now) {
    return false;
  }

  return true;
}
