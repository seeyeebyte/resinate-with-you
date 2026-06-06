import { parseProductNotes } from "@/lib/product-notes";
import { getSupabaseServiceClient } from "@/lib/supabase";

export type AdminProductStatus = "approved" | "hidden" | "draft" | "pending" | "needs_changes";

export type AdminProduct = {
  id: string;
  title: string;
  slug: string;
  category: string;
  priceText: string;
  description: string;
  externalUrl: string;
  status: AdminProductStatus;
  adminNotes: string;
  tags: string[];
  updatedAt: string | null;
  artist: {
    id: string;
    brandName: string;
    slug: string;
    status: string;
  } | null;
  image: {
    url: string;
    alt: string;
  } | null;
  featuredActive: boolean;
};

type ProductRow = {
  id: string;
  title?: string | null;
  slug?: string | null;
  category?: string | null;
  price_text?: string | null;
  description?: string | null;
  external_url?: string | null;
  status?: AdminProductStatus | string | null;
  admin_notes?: string | null;
  updated_at?: string | null;
  artists?:
    | {
        id?: string | null;
        brand_name?: string | null;
        slug?: string | null;
        status?: string | null;
      }
    | {
        id?: string | null;
        brand_name?: string | null;
        slug?: string | null;
        status?: string | null;
      }[]
    | null;
  product_images?:
    | {
        image_url?: string | null;
        alt_text?: string | null;
        sort_order?: number | null;
      }[]
    | null;
  featured_products?:
    | {
        is_active?: boolean | null;
      }[]
    | {
        is_active?: boolean | null;
      }
    | null;
};

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
  artists ( id, brand_name, slug, status ),
  product_images ( image_url, alt_text, sort_order ),
  featured_products ( is_active )
`;

export async function getAdminProducts(): Promise<{ configured: boolean; error: string | null; products: AdminProduct[] }> {
  const supabase = getSupabaseServiceClient();

  if (!supabase) {
    return {
      configured: false,
      error: "Supabase service config is missing.",
      products: [],
    };
  }

  const { data, error } = await supabase.from("products").select(productSelect).order("updated_at", { ascending: false });

  if (error) {
    return {
      configured: true,
      error: error.message,
      products: [],
    };
  }

  return {
    configured: true,
    error: null,
    products: ((data ?? []) as ProductRow[]).map(mapProductRow),
  };
}

export const adminProductStatusLabels: Record<AdminProductStatus, string> = {
  approved: "Live",
  hidden: "Hidden",
  draft: "Draft",
  pending: "Pending",
  needs_changes: "Needs changes",
};

export const editableAdminProductStatuses: AdminProductStatus[] = ["approved", "hidden", "needs_changes"];

function mapProductRow(row: ProductRow): AdminProduct {
  const artist = Array.isArray(row.artists) ? row.artists[0] : row.artists;
  const image = [...(row.product_images ?? [])].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))[0] ?? null;
  const notes = parseProductNotes(row.admin_notes);
  const status = normalizeStatus(row.status);

  return {
    id: row.id,
    title: row.title || "Untitled product",
    slug: row.slug || row.id,
    category: row.category || "Resin Art",
    priceText: row.price_text || "Price on request",
    description: row.description || "",
    externalUrl: row.external_url || "",
    status,
    adminNotes: row.admin_notes || "",
    tags: notes.tags,
    updatedAt: row.updated_at || null,
    artist: artist?.id
      ? {
          id: artist.id,
          brandName: artist.brand_name || "Untitled artist",
          slug: artist.slug || artist.id,
          status: artist.status || "unknown",
        }
      : null,
    image: image?.image_url
      ? {
          url: image.image_url,
          alt: image.alt_text || row.title || "Product image",
        }
      : null,
    featuredActive: normalizeFeaturedProducts(row.featured_products).some((featured) => Boolean(featured.is_active)),
  };
}

function normalizeFeaturedProducts(
  featuredProducts: ProductRow["featured_products"],
): {
  is_active?: boolean | null;
}[] {
  if (!featuredProducts) {
    return [];
  }

  return Array.isArray(featuredProducts) ? featuredProducts : [featuredProducts];
}

function normalizeStatus(value: string | null | undefined): AdminProductStatus {
  if (value === "approved" || value === "hidden" || value === "draft" || value === "pending" || value === "needs_changes") {
    return value;
  }

  return "approved";
}
