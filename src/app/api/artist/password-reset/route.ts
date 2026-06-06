import { NextResponse } from "next/server";
import { sendApprovedArtistPasswordReset } from "@/lib/artist-auth";
import { isValidEmail } from "@/lib/applications";

export async function POST(request: Request) {
  let body: { email?: unknown };

  try {
    body = (await request.json()) as { email?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid password reset request." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const result = await sendApprovedArtistPasswordReset(email, request.url);

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({
    sent: result.sent,
    skipped: result.skipped,
    approved: result.approved,
    message: result.skipped
      ? "Email sending is not connected yet. Ask the site admin to finish Resend setup or send a temporary password manually."
      : result.approved
        ? "If email is configured, a password reset link has been sent."
        : "If this email belongs to an approved artist account, a password reset link will be sent.",
  });
}
