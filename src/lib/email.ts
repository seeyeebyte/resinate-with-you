import type { ApplicationRecord, ApplicationStatus } from "@/lib/supabase";
import { artistTypeLabels, normalizeArtistType } from "@/lib/applications";

type EmailResult = {
  sent: boolean;
  skipped: boolean;
  error: string | null;
};

const resultSkipped: EmailResult = {
  sent: false,
  skipped: true,
  error: null,
};

export async function sendAdminApplicationEmail(application: ApplicationRecord): Promise<EmailResult> {
  const to = process.env.ADMIN_NOTIFICATION_EMAIL;

  if (!to) {
    return resultSkipped;
  }

  return sendEmail({
    to,
    subject: `New artist application: ${application.brand_name}`,
    text: [
      "A new artist application was submitted.",
      "",
      `Brand: ${application.brand_name}`,
      `Contact: ${application.contact_name || "Not provided"}`,
      `Email: ${application.email}`,
      `Location: ${[application.city, application.country].filter(Boolean).join(", ") || "Not provided"}`,
      `Artist type: ${artistTypeLabels[normalizeArtistType(application.artist_type)]}`,
      `Studio address: ${application.studio_address || "Not provided"}`,
      `Categories: ${application.categories?.join(", ") || "Not provided"}`,
      `Sample photos: ${application.sample_image_urls?.join(", ") || "Not provided"}`,
      `Instagram: ${application.instagram_url || "Not provided"}`,
      `Website: ${application.website_url || "Not provided"}`,
      `Contact or link name: ${application.contact_link_label || "Not provided"}`,
      `Actual account or link: ${application.shop_url || "Not provided"}`,
      "",
      "Open the admin review page to approve, request more information, or reject this application.",
    ].join("\n"),
  });
}

export async function sendApplicantReviewEmail(application: ApplicationRecord, status: ApplicationStatus): Promise<EmailResult> {
  if (!["approved", "needs_info", "rejected"].includes(status)) {
    return resultSkipped;
  }

  const name = application.contact_name || application.brand_name;
  const note = application.admin_notes ? `\n\nReview note:\n${application.admin_notes}` : "";
  const contentByStatus = {
    approved: {
      subject: "Your Resinate With You artist application was approved",
      body: [
        `Hi ${name},`,
        "",
        "Thank you for applying to Resinate With You. Your artist application has been approved.",
        "",
        "You can now prepare your artist profile and submit up to 15 products for review. Once your products are approved, they will appear in the directory and link directly to your own contact or shop page.",
        "",
        "Welcome to the early directory.",
      ].join("\n"),
    },
    needs_info: {
      subject: "We need a little more information for your Resinate With You application",
      body: [
        `Hi ${name},`,
        "",
        "Thank you for applying to Resinate With You. We would love to continue reviewing your application, but we need a little more information first.",
        "",
        "Please reply with any missing details, clearer links, or more information about your resin work.",
      ].join("\n"),
    },
    rejected: {
      subject: "Update on your Resinate With You application",
      body: [
        `Hi ${name},`,
        "",
        "Thank you for applying to Resinate With You. After review, we are not able to approve your application at this stage.",
        "",
        "This may be because the submitted work does not match our current directory focus, the product information was incomplete, or we could not verify the submitted links.",
        "",
        "You are welcome to apply again in the future with updated information.",
      ].join("\n"),
    },
  }[status as "approved" | "needs_info" | "rejected"];

  return sendEmail({
    to: application.email,
    subject: contentByStatus.subject,
    text: `${contentByStatus.body}${note}`,
  });
}

export async function sendArtistPasswordEmail({
  application,
  url,
  mode,
  temporaryPassword,
}: {
  application: ApplicationRecord;
  url: string;
  mode: "setup" | "reset";
  temporaryPassword?: string | null;
}): Promise<EmailResult> {
  const name = application.contact_name || application.brand_name;
  const isSetup = mode === "setup";

  return sendEmail({
    to: application.email,
    subject: isSetup ? "Set your Resinate With You artist password" : "Reset your Resinate With You artist password",
    text: [
      `Hi ${name},`,
      "",
      isSetup
        ? "Your Resinate With You artist application has been approved. Use the link below to set your own password and open your artist dashboard."
        : "We received a request to reset the password for your Resinate With You artist account. Use the link below to choose a new password.",
      "",
      url,
      "",
      temporaryPassword
        ? `Temporary password: ${temporaryPassword}`
        : "This link is connected to your approved artist email. If it expires, request a new password email from the artist login page.",
      temporaryPassword ? "You can also sign in with this temporary password, then change it from the password setup or reset flow." : "",
      "",
      "After setting your password, you can sign in to edit your profile and manage products.",
    ].filter(Boolean).join("\n"),
  });
}

async function sendEmail({ to, subject, text }: { to: string; subject: string; text: string }): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    return resultSkipped;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to,
        subject,
        text,
      }),
    });

    if (!response.ok) {
      return {
        sent: false,
        skipped: false,
        error: await response.text(),
      };
    }

    return {
      sent: true,
      skipped: false,
      error: null,
    };
  } catch (error) {
    return {
      sent: false,
      skipped: false,
      error: error instanceof Error ? error.message : "Unknown email error",
    };
  }
}
