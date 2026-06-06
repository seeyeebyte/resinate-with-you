import type { ArtistAuthResult } from "@/lib/artist-auth";

export function adminReviewResultPage({
  requestUrl,
  token,
  title,
  message,
  result,
}: {
  requestUrl: string;
  token: string;
  title: string;
  message: string;
  result: ArtistAuthResult;
}) {
  const backUrl = new URL("/admin/applications", requestUrl);

  if (token) {
    backUrl.searchParams.set("token", token);
  }

  const emailStatus = result.setupEmail.skipped
    ? "Email skipped because email config is missing."
    : result.setupEmail.error
      ? "Email could not be sent. Copy the temporary password and share it manually."
      : "Email sent with the approval message, setup link, and temporary password.";

  return new Response(
    `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <style>
      body { margin: 0; font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #fbfbf8; color: #2d3842; }
      main { min-height: 100vh; display: grid; place-items: center; padding: 32px; }
      article { width: min(720px, 100%); border: 1px solid #d9ddd2; border-radius: 12px; background: #fff; padding: 32px; box-shadow: 0 24px 80px rgba(45,56,66,.12); }
      .eyebrow { margin: 0 0 12px; font-size: 12px; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; color: #626960; }
      h1 { margin: 0; font-family: Georgia, "Times New Roman", serif; font-size: clamp(36px, 7vw, 72px); line-height: .98; }
      p { color: #626960; font-size: 16px; line-height: 1.7; }
      code { display: block; margin-top: 12px; overflow-wrap: anywhere; border: 1px solid #d9ddd2; border-radius: 8px; background: #f5fbff; padding: 16px; color: #2d3842; font-size: 22px; font-weight: 800; }
      a { display: inline-flex; margin-top: 24px; border-radius: 999px; background: #2d3842; color: white; padding: 14px 22px; text-decoration: none; font-weight: 800; }
      .warn { border-color: #f0c5bf; background: #fff7f5; color: #8c2c27; }
    </style>
  </head>
  <body>
    <main>
      <article>
        <p class="eyebrow">Admin review</p>
        <h1>${escapeHtml(title)}</h1>
        <p>${escapeHtml(message)}</p>
        <p>${escapeHtml(emailStatus)}</p>
        ${
          result.temporaryPassword
            ? `<p><strong>One-time visible temporary password</strong></p><code>${escapeHtml(result.temporaryPassword)}</code><p>Copy this now if you may need to send it through another channel. Repair/resend will generate a new one.</p>`
            : `<p class="warn">No temporary password was generated because account setup did not finish.</p>`
        }
        ${result.error ? `<p class="warn">${escapeHtml(result.error)}</p>` : ""}
        <a href="${escapeHtml(backUrl.toString())}">Back to applications</a>
      </article>
    </main>
  </body>
</html>`,
    {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    },
  );
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
