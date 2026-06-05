import Link from "next/link";
import { hasAdminAccess } from "@/lib/admin-auth";
import { statusLabels } from "@/lib/applications";
import { getSupabaseServiceClient, type ApplicationRecord } from "@/lib/supabase";

export const metadata = {
  title: "Application Review",
};

type PageProps = {
  searchParams: Promise<{
    token?: string;
    reviewed?: string;
    email?: string;
    artist_error?: string;
  }>;
};

export default async function AdminApplicationsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const token = params.token || "";

  if (!hasAdminAccess(token)) {
    return (
      <section className="section">
        <div className="max-w-3xl">
          <p className="eyebrow">Admin Review</p>
          <h1 className="display-heading mt-4 text-4xl">Admin access required</h1>
          <p className="mt-4 leading-7 text-[#626960]">
            Add your admin review token to the page URL to review artist applications.
          </p>
        </div>
      </section>
    );
  }

  const supabase = getSupabaseServiceClient();

  if (!supabase) {
    return (
      <section className="section">
        <div className="max-w-3xl">
          <p className="eyebrow">Admin Review</p>
          <h1 className="display-heading mt-4 text-4xl">Supabase service config is missing</h1>
          <p className="mt-4 leading-7 text-[#626960]">
            Add <code>SUPABASE_SERVICE_ROLE_KEY</code> to load and review applications.
          </p>
        </div>
      </section>
    );
  }

  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .in("status", ["submitted", "reviewing", "needs_info"])
    .order("created_at", { ascending: false });

  const applications = (data ?? []) as ApplicationRecord[];

  return (
    <section className="section">
      <div>
        <div className="section-heading">
          <div>
            <p className="eyebrow">Admin Review</p>
            <h1>Artist applications</h1>
          </div>
          <p>
            Review new artist applications, save notes, and send a clear decision email to each applicant.
          </p>
        </div>

        <ReviewNotice reviewed={params.reviewed} email={params.email} artistError={params.artist_error === "1"} />

        {!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM ? (
          <p className="mb-5 rounded-[8px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            Email is not fully configured. Reviews will still save, but result emails may be skipped.
          </p>
        ) : null}

        {error ? (
          <p className="rounded-[8px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-950">
            {error.message}
          </p>
        ) : null}

        {!error && applications.length === 0 ? (
          <div className="soft-card rounded-[8px] p-6">
            <h2 className="text-xl font-semibold text-[#2d3842]">No applications waiting for review</h2>
            <p className="mt-2 text-sm leading-6 text-[#626960]">
              New submissions will appear here after artists apply.
            </p>
          </div>
        ) : null}

        <div className="grid gap-5">
          {applications.map((application) => (
            <ApplicationReviewCard key={application.id} application={application} token={token} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ReviewNotice({
  reviewed,
  email,
  artistError,
}: {
  reviewed?: string;
  email?: string;
  artistError: boolean;
}) {
  if (!reviewed && !email && !artistError) {
    return null;
  }

  const emailMessage = {
    sent: "Email sent.",
    skipped: "Email skipped because email config is missing.",
    failed: "Email could not be sent. The review was still saved.",
  }[email || ""];

  return (
    <div className="mb-5 rounded-[8px] border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-950">
      {reviewed ? <span>Review saved as {reviewed.replace("_", " ")}. </span> : null}
      {emailMessage ? <span>{emailMessage} </span> : null}
      {artistError ? <span>The artist record could not be created. Check the database schema.</span> : null}
    </div>
  );
}

function ApplicationReviewCard({ application, token }: { application: ApplicationRecord; token: string }) {
  const submittedAt = application.created_at ? new Date(application.created_at).toLocaleString("en") : "Unknown";
  const location = [application.city, application.country].filter(Boolean).join(", ") || "Not provided";

  return (
    <article className="soft-card rounded-[8px] p-5 sm:p-6">
      <div className="grid gap-5 lg:grid-cols-[1fr_22rem]">
        <div>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#566c71]">
                {statusLabels[application.status]}
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-[#2d3842]">{application.brand_name}</h2>
              <p className="mt-1 text-sm text-[#626960]">Submitted {submittedAt}</p>
            </div>
          </div>

          <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
            <Info label="Contact name" value={application.contact_name || "Not provided"} />
            <Info label="Email" value={application.email} />
            <Info label="Location" value={location} />
            <Info label="Price range" value={application.price_range || "Not provided"} />
            <Info label="Categories" value={application.categories?.join(", ") || "Not provided"} />
            <Info label="Custom orders" value={application.accepts_custom ? "Yes" : "No"} />
            <Info label="Ships internationally" value={application.ships_international ? "Yes" : "No"} />
            <Info label="Authorized display" value={application.authorization_accepted ? "Yes" : "No"} />
          </dl>

          <div className="mt-5 grid gap-3 text-sm text-[#626960]">
            <ExternalValue label="Instagram" value={application.instagram_url} />
            <ExternalValue label="Website" value={application.website_url} />
            <Info label="Contact or shop link name" value={application.contact_link_label || "Not provided"} />
            <ExternalValue label="Actual account or shop link" value={application.shop_url} />
          </div>

          {application.sample_image_urls?.length ? (
            <div className="mt-5">
              <p className="text-sm font-semibold text-[#2d3842]">Product photos</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {application.sample_image_urls.map((url, index) => (
                  <a
                    key={url}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="group overflow-hidden rounded-[8px] border border-[#d9ddd2] bg-white"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={`Submitted product sample ${index + 1}`}
                      className="aspect-square w-full object-cover transition group-hover:scale-105"
                    />
                  </a>
                ))}
              </div>
            </div>
          ) : null}

          {application.bio ? (
            <div className="mt-5 rounded-[8px] bg-[#f5fbff] p-4">
              <p className="text-sm font-semibold text-[#2d3842]">Short bio</p>
              <p className="mt-2 text-sm leading-6 text-[#626960]">{application.bio}</p>
            </div>
          ) : null}
        </div>

        <form action={`/api/admin/applications/${application.id}/review`} method="post" className="rounded-[8px] border border-[#d9ddd2] bg-white/70 p-4">
          <input type="hidden" name="token" value={token} />
          <label className="block">
            <span className="text-sm font-semibold text-[#2d3842]">Decision</span>
            <select
              name="status"
              className="mt-2 min-h-11 w-full rounded-[6px] border border-[#d9ddd2] bg-white px-3 text-sm outline-none focus:border-teal-700"
              defaultValue="approved"
            >
              <option value="approved">Approve</option>
              <option value="needs_info">Need more information</option>
              <option value="rejected">Reject</option>
            </select>
          </label>
          <label className="mt-4 block">
            <span className="text-sm font-semibold text-[#2d3842]">Admin notes</span>
            <textarea
              name="admin_notes"
              rows={5}
              defaultValue={application.admin_notes || ""}
              className="mt-2 w-full rounded-[6px] border border-[#d9ddd2] bg-white px-3 py-2 text-sm outline-none focus:border-teal-700"
              placeholder="Add a short note for the artist or for your records."
            />
          </label>
          <button type="submit" className="studio-button studio-button-primary mt-4 w-full">
            Save review
          </button>
        </form>
      </div>
    </article>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-semibold text-[#2d3842]">{label}</dt>
      <dd className="mt-1 text-[#626960]">{value}</dd>
    </div>
  );
}

function ExternalValue({ label, value }: { label: string; value: string | null }) {
  if (!value) {
    return (
      <p>
        <span className="font-semibold text-[#2d3842]">{label}:</span> Not provided
      </p>
    );
  }

  const isUrl = /^https?:\/\//i.test(value);

  return (
    <p>
      <span className="font-semibold text-[#2d3842]">{label}:</span>{" "}
      {isUrl ? (
        <Link href={value} target="_blank" rel="noreferrer" className="quiet-link">
          {value}
        </Link>
      ) : (
        value
      )}
    </p>
  );
}
