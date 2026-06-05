import { NextResponse } from "next/server";
import { getRequestAdminToken, hasAdminAccess } from "@/lib/admin-auth";
import { getFeaturedProductAdminData } from "@/lib/featured-products";
import { getSupabaseServiceClient } from "@/lib/supabase";

export async function GET(request: Request) {
  if (!hasAdminAccess(getRequestAdminToken(request))) {
    return NextResponse.json({ error: "Admin access token is required." }, { status: 401 });
  }

  const data = await getFeaturedProductAdminData();
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const token = String(formData.get("token") || getRequestAdminToken(request) || "");

  if (!hasAdminAccess(token)) {
    return NextResponse.json({ error: "Admin access token is required." }, { status: 401 });
  }

  const supabase = getSupabaseServiceClient();

  if (!supabase) {
    return redirectWithState(request, token, { error: "Supabase service config is missing." });
  }

  const productId = String(formData.get("product_id") || "").trim();
  const sortOrder = parseInteger(formData.get("sort_order"));
  const isActive = formData.get("is_active") === "on";

  if (!productId) {
    return redirectWithState(request, token, { error: "Choose an approved product." });
  }

  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id,status")
    .eq("id", productId)
    .eq("status", "approved")
    .maybeSingle();

  if (productError || !product) {
    return redirectWithState(request, token, { error: productError?.message || "Choose an approved product." });
  }

  const { data: existing } = await supabase.from("featured_products").select("id").eq("product_id", productId).maybeSingle();
  const payload = {
    product_id: productId,
    sort_order: sortOrder,
    is_active: isActive,
    image_override_url: null,
    image_override_alt: null,
    image_position: null,
    updated_at: new Date().toISOString(),
  };

  const result = existing
    ? await supabase.from("featured_products").update(payload).eq("id", existing.id)
    : await supabase.from("featured_products").insert(payload);

  if (result.error) {
    return redirectWithState(request, token, { error: result.error.message });
  }

  return redirectWithState(request, token, { saved: "1" });
}

function redirectWithState(request: Request, token: string, state: Record<string, string>) {
  const redirectUrl = new URL("/admin/featured-products", request.url);
  if (token) {
    redirectUrl.searchParams.set("token", token);
  }
  Object.entries(state).forEach(([key, value]) => redirectUrl.searchParams.set(key, value));
  return NextResponse.redirect(redirectUrl, { status: 303 });
}

function parseInteger(value: FormDataEntryValue | null) {
  const parsed = Number.parseInt(String(value || "0"), 10);
  return Number.isFinite(parsed) ? parsed : 0;
}
