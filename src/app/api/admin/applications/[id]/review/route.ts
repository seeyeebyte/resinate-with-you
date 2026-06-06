import { NextResponse } from "next/server";
import { reviewStatuses } from "@/lib/applications";
import { getRequestAdminToken, hasAdminAccess } from "@/lib/admin-auth";
import { ensureApprovedArtistAccount } from "@/lib/artist-auth";
import { adminReviewResultPage } from "@/lib/admin-review-result";
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

  const { data: existingApplication, error: existingError } = await supabase.from("applications").select("*").eq("id", id).single();

  if (existingError) {
    return NextResponse.json({ error: existingError.message }, { status: 500 });
  }

  const existing = existingApplication as ApplicationRecord;

  if (status === "approved") {
    const applicationForApproval = {
      ...existing,
      status,
      admin_notes: adminNotes,
      updated_at: new Date().toISOString(),
    } as ApplicationRecord;
    const authResult = await ensureApprovedArtistAccount(applicationForApproval, {
      requestUrl: request.url,
    });

    if (authResult.error) {
      return redirectToApplications(request, token, {
        reviewed: "failed",
        artist_error: "1",
        error: authResult.error,
      });
    }

    const { error: updateError } = await supabase
      .from("applications")
      .update({
        status,
        admin_notes: adminNotes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (updateError) {
      return redirectToApplications(request, token, {
        reviewed: "failed",
        error: updateError.message,
      });
    }

    return adminReviewResultPage({
      requestUrl: request.url,
      token,
      title: authResult.setupEmail.error ? "Approval saved, email failed" : "Approval saved",
      message: authResult.setupEmail.error
        ? "The artist account was created and a temporary password was generated, but the email could not be sent."
        : "The artist account is ready. The email includes the approval message, setup link, and temporary password.",
      result: authResult,
    });
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
  const email = await sendApplicantReviewEmail(application, status);

  if (email.skipped) {
    return redirectToApplications(request, token, { reviewed: status, email: "skipped" });
  } else if (email.error) {
    return redirectToApplications(request, token, { reviewed: status, email: "failed" });
  }

  return redirectToApplications(request, token, { reviewed: status, email: "sent" });
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
