import { createClient, type Session, type SupabaseClient } from "@supabase/supabase-js";

export type ApplicationStatus = "submitted" | "reviewing" | "needs_info" | "approved" | "rejected";
export type ArtistType = "individual" | "offline_studio";

export type ApplicationInsert = {
  brand_name: string;
  contact_name: string | null;
  email: string;
  country: string | null;
  city: string | null;
  artist_type: ArtistType;
  studio_address: string | null;
  instagram_url: string | null;
  website_url: string | null;
  contact_link_label: string | null;
  shop_url: string | null;
  categories: string[];
  sample_image_urls: string[];
  accepts_custom: boolean;
  ships_international: boolean;
  price_range: string | null;
  bio: string | null;
  authorization_accepted: boolean;
  status: ApplicationStatus;
};

export type ArtistProfileRecord = {
  id: string;
  brand_name: string;
  contact_name: string | null;
  contact_link_label: string | null;
};

export type ApplicationRecord = ApplicationInsert & {
  id: string;
  admin_notes: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export const productImageBucket = process.env.SUPABASE_PRODUCT_IMAGES_BUCKET || "product-images";
export const artistAvatarBucket = process.env.SUPABASE_ARTIST_AVATARS_BUCKET || "artist-avatars";
let browserClient: SupabaseClient | null = null;

export function hasSupabaseConfig() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function getSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return null;
  }

  if (!browserClient) {
    browserClient = createClient(url, anonKey);
  }

  return browserClient;
}

export function getSupabaseServerAuthClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return null;
  }

  return createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

export function persistSupabaseBrowserSession(session: Session) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!url || typeof window === "undefined") {
    return false;
  }

  try {
    const projectRef = new URL(url).hostname.split(".")[0];
    window.localStorage.setItem(`sb-${projectRef}-auth-token`, JSON.stringify(session));
    return true;
  } catch {
    return false;
  }
}

export function getSupabaseServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    return null;
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
