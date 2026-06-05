import { NextResponse } from "next/server";
import { getRequestAdminToken, hasAdminAccess } from "@/lib/admin-auth";
import { getSupabaseServiceClient } from "@/lib/supabase";

export async function GET(request: Request) {
  if (!hasAdminAccess(getRequestAdminToken(request))) {
    return NextResponse.json({ error: "Admin access token is required." }, { status: 401 });
  }

  const supabase = getSupabaseServiceClient();

  if (!supabase) {
    return NextResponse.json({ error: "Supabase service config is missing." }, { status: 503 });
  }

  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .in("status", ["submitted", "reviewing", "needs_info"])
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ applications: data ?? [] });
}
