import { NextResponse } from "next/server";
import { isValidEmail } from "@/lib/applications";
import { getSupabaseServerAuthClient } from "@/lib/supabase";

export async function POST(request: Request) {
  const supabase = getSupabaseServerAuthClient();

  if (!supabase) {
    return NextResponse.json({ error: "Artist login is not configured yet." }, { status: 503 });
  }

  let body: { email?: unknown; password?: unknown };

  try {
    body = (await request.json()) as { email?: unknown; password?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid login request." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  if (!password) {
    return NextResponse.json({ error: "Enter your password." }, { status: 400 });
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.session) {
    return NextResponse.json(
      { error: error?.message || "The email or password is incorrect." },
      { status: error?.status || 401 },
    );
  }

  return NextResponse.json(
    { session: data.session },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
