import { NextResponse } from "next/server";
import { getRequestAdminToken, hasAdminAccess } from "@/lib/admin-auth";
import { editableAdminProductStatuses, type AdminProductStatus } from "@/lib/admin-products";
import { getSupabaseServiceClient } from "@/lib/supabase";

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
    return redirectWithState(request, token, { error: "Supabase service config is missing." });
  }

  const status = String(formData.get("status") || "") as AdminProductStatus;
  const adminNotes = String(formData.get("admin_notes") || "").trim() || null;

  if (!editableAdminProductStatuses.includes(status)) {
    return redirectWithState(request, token, { error: "Choose a valid product status." });
  }

  const { error } = await supabase
    .from("products")
    .update({
      status,
      admin_notes: adminNotes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return redirectWithState(request, token, { error: error.message });
  }

  if (status !== "approved") {
    const { error: featuredError } = await supabase
      .from("featured_products")
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq("product_id", id);

    if (featuredError) {
      return redirectWithState(request, token, { error: featuredError.message });
    }
  }

  return redirectWithState(request, token, { saved: "1" });
}

function redirectWithState(request: Request, token: string, state: Record<string, string>) {
  const redirectUrl = new URL("/admin/products", request.url);

  if (token) {
    redirectUrl.searchParams.set("token", token);
  }

  for (const [key, value] of Object.entries(state)) {
    redirectUrl.searchParams.set(key, value);
  }

  return NextResponse.redirect(redirectUrl, { status: 303 });
}
