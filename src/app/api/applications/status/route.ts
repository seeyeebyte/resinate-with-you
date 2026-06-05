import { NextResponse } from "next/server";
import { isValidEmail, statusLabels } from "@/lib/applications";
import { getSupabaseServiceClient, type ApplicationRecord } from "@/lib/supabase";

export async function GET(request: Request) {
  const supabase = getSupabaseServiceClient();

  if (!supabase) {
    return NextResponse.json({ error: "Supabase service config is missing." }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email")?.trim().toLowerCase();

  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("applications")
    .select("id, brand_name, email, status, admin_notes, created_at, updated_at")
    .eq("email", email)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ application: null });
  }

  const application = data as Pick<ApplicationRecord, "id" | "brand_name" | "email" | "status" | "admin_notes" | "created_at" | "updated_at">;

  return NextResponse.json({
    application: {
      ...application,
      status_label: statusLabels[application.status],
    },
  });
}
