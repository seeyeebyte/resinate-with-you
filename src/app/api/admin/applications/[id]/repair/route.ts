import { NextResponse } from "next/server";
import { getRequestAdminToken, hasAdminAccess } from "@/lib/admin-auth";
import { adminReviewResultPage } from "@/lib/admin-review-result";
import { ensureApprovedArtistAccount } from "@/lib/artist-auth";
import { getSupabaseServiceClient, type ApplicationRecord } from "@/lib/supabase";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const formData = await request.formData();
  const token = String(formData.get("token") || getRequestAdminToken(request) || "");

  if (!hasAdminAccess(token)) {
    return NextResponse.json({ error: "Admin access token is required." }, { status: 401 });
  }

  const supabase = getSupabaseServiceClient();

  if (!supabase) {
    return redirectToApplications(request, token, { repair: "failed", error: "Supabase service config is missing." });
  }

  const { data, error } = await supabase.from("applications").select("*").eq("id", id).eq("status", "approved").single();

  if (error) {
    return redirectToApplications(request, token, { repair: "failed", error: error.message });
  }

  const result = await ensureApprovedArtistAccount(data as ApplicationRecord, {
    requestUrl: request.url,
  });

  if (result.error) {
    return redirectToApplications(request, token, { repair: "failed", artist_error: "1", error: result.error });
  }

  return adminReviewResultPage({
    requestUrl: request.url,
    token,
    title: result.setupEmail.error ? "Account repaired, email failed" : "Account repaired",
    message: result.setupEmail.error
      ? "The artist account was repaired and a new temporary password was generated, but the email could not be sent."
      : "The artist account was repaired. The email includes the approval message, setup link, and new temporary password.",
    result,
  });
}

function redirectToApplications(request: Request, token: string, state: Record<string, string>) {
  const redirectUrl = new URL("/admin/applications", request.url);

  if (token) {
    redirectUrl.searchParams.set("token", token);
  }

  for (const [key, value] of Object.entries(state)) {
    redirectUrl.searchParams.set(key, value);
  }

  return NextResponse.redirect(redirectUrl, { status: 303 });
}
