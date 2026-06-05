import { NextResponse } from "next/server";
import { createArtistSlug, reviewStatuses } from "@/lib/applications";
import { getRequestAdminToken, hasAdminAccess } from "@/lib/admin-auth";
import { sendApplicantReviewEmail } from "@/lib/email";
import { getSupabaseServiceClient, type ApplicationRecord, type ApplicationStatus } from "@/lib/supabase";

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
    return NextResponse.json({ error: "Supabase service config is missing." }, { status: 503 });
  }

  const status = String(formData.get("status") || "") as ApplicationStatus;
  const adminNotes = String(formData.get("admin_notes") || "").trim() || null;

  if (!reviewStatuses.includes(status)) {
    return NextResponse.json({ error: "Choose a valid review status." }, { status: 400 });
  }

  const { data: updatedApplication, error: updateError } = await supabase
    .from("applications")
    .update({
      status,
      admin_notes: adminNotes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  const application = updatedApplication as ApplicationRecord;
  let artistError: string | null = null;

  if (status === "approved") {
    const { data: existingArtist, error: existingArtistError } = await supabase
      .from("artists")
      .select("id")
      .eq("application_id", application.id)
      .maybeSingle();

    if (existingArtistError) {
      artistError = existingArtistError.message;
    } else if (!existingArtist) {
      const { error: createArtistError } = await supabase.from("artists").insert({
        application_id: application.id,
        brand_name: application.brand_name,
        contact_name: application.contact_name,
        slug: createArtistSlug(application),
        bio: application.bio,
        country: application.country,
        city: application.city,
        instagram_url: application.instagram_url,
        website_url: application.website_url,
        contact_link_label: application.contact_link_label,
        shop_url: application.shop_url,
        categories: application.categories,
        sample_image_urls: application.sample_image_urls,
        accepts_custom: application.accepts_custom,
        ships_international: application.ships_international,
        status: "approved",
      });

      artistError = createArtistError?.message ?? null;
    }
  }

  const email = await sendApplicantReviewEmail(application, status);

  const redirectUrl = new URL("/admin/applications", request.url);
  if (token) {
    redirectUrl.searchParams.set("token", token);
  }
  redirectUrl.searchParams.set("reviewed", status);
  if (artistError) {
    redirectUrl.searchParams.set("artist_error", "1");
  }
  if (email.skipped) {
    redirectUrl.searchParams.set("email", "skipped");
  } else if (email.error) {
    redirectUrl.searchParams.set("email", "failed");
  } else {
    redirectUrl.searchParams.set("email", "sent");
  }

  return NextResponse.redirect(redirectUrl, { status: 303 });
}
