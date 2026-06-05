import { getSupabaseServiceClient } from "@/lib/supabase";

export type ApprovedArtistSession = {
  id: string;
  brand_name: string | null;
  slug: string | null;
  avatar_url?: string | null;
};

export async function findApprovedArtistForUser(email: string, userId: string): Promise<ApprovedArtistSession | null> {
  const supabase = getSupabaseServiceClient();

  if (!supabase) {
    return null;
  }

  const normalizedEmail = email.trim().toLowerCase();

  const { data: directArtist } = await supabase
    .from("artists")
    .select("id,brand_name,slug,avatar_url")
    .eq("status", "approved")
    .eq("user_id", userId)
    .maybeSingle();

  if (directArtist?.id) {
    return directArtist as ApprovedArtistSession;
  }

  const { data: application } = await supabase
    .from("applications")
    .select("id")
    .eq("status", "approved")
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (!application?.id) {
    return null;
  }

  const { data: artist } = await supabase
    .from("artists")
    .select("id,brand_name,slug,avatar_url")
    .eq("status", "approved")
    .eq("application_id", application.id)
    .maybeSingle();

  return (artist as ApprovedArtistSession | null) ?? null;
}
