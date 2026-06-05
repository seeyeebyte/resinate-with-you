import { NextResponse } from "next/server";
import { getRequestAdminToken, hasAdminAccess } from "@/lib/admin-auth";
import { getSupabaseServiceClient } from "@/lib/supabase";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
  const formData = await request.formData();
  const methods = formData.getAll("_method").map((value) => String(value).toUpperCase());
  const method = methods.at(-1) || "PATCH";

  if (method === "DELETE") {
    return removeFeaturedProduct(request, context, formData);
  }

  return updateFeaturedProduct(request, context, formData);
}

export async function PATCH(request: Request, context: RouteContext) {
  return updateFeaturedProduct(request, context, await request.formData());
}

export async function DELETE(request: Request, context: RouteContext) {
  return removeFeaturedProduct(request, context);
}

async function updateFeaturedProduct(request: Request, context: RouteContext, formData: FormData) {
  const { id } = await context.params;
  const token = String(formData.get("token") || getRequestAdminToken(request) || "");

  if (!hasAdminAccess(token)) {
    return NextResponse.json({ error: "Admin access token is required." }, { status: 401 });
  }

  const supabase = getSupabaseServiceClient();

  if (!supabase) {
    return redirectWithState(request, token, { error: "Supabase service config is missing." });
  }

  const { data: existing, error: existingError } = await supabase
    .from("featured_products")
    .select("id")
    .eq("id", id)
    .maybeSingle();

  if (existingError || !existing) {
    return redirectWithState(request, token, { error: existingError?.message || "Featured find was not found." });
  }

  const payload = {
    sort_order: parseInteger(formData.get("sort_order")),
    is_active: formData.get("is_active") === "on",
    image_override_url: null,
    image_override_alt: null,
    image_position: null,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from("featured_products").update(payload).eq("id", id);

  if (error) {
    return redirectWithState(request, token, { error: error.message });
  }

  return redirectWithState(request, token, { saved: "1" });
}

async function removeFeaturedProduct(request: Request, context: RouteContext, formData?: FormData) {
  const { id } = await context.params;
  const token = String(formData?.get("token") || getRequestAdminToken(request) || "");

  if (!hasAdminAccess(token)) {
    return NextResponse.json({ error: "Admin access token is required." }, { status: 401 });
  }

  const supabase = getSupabaseServiceClient();

  if (!supabase) {
    return redirectWithState(request, token, { error: "Supabase service config is missing." });
  }

  const { error } = await supabase.from("featured_products").delete().eq("id", id);

  if (error) {
    return redirectWithState(request, token, { error: error.message });
  }

  return redirectWithState(request, token, { deleted: "1" });
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
