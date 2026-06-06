import Link from "next/link";
import { AdminNav } from "@/components/AdminNav";
import { hasAdminAccess } from "@/lib/admin-auth";
import { adminProductStatusLabels, editableAdminProductStatuses, getAdminProducts, type AdminProductStatus } from "@/lib/admin-products";

export const metadata = {
  title: "Product Management",
};

type PageProps = {
  searchParams: Promise<{
    token?: string;
    status?: string;
    saved?: string;
    error?: string;
  }>;
};

export default async function AdminProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const token = params.token || "";
  const selectedStatus = normalizeStatusParam(params.status);

  if (!hasAdminAccess(token)) {
    return (
      <section className="section">
        <div className="max-w-3xl">
          <p className="eyebrow">Admin Products</p>
          <h1 className="display-heading mt-4 text-4xl">Admin access required</h1>
          <p className="mt-4 leading-7 text-[#626960]">
            Add your admin review token to the page URL to manage artist products.
          </p>
        </div>
      </section>
    );
  }

  const data = await getAdminProducts();
  const counts = countProducts(data.products);
  const products = selectedStatus ? data.products.filter((product) => product.status === selectedStatus) : data.products;

  return (
    <section className="section">
      <div>
        <div className="section-heading">
          <div>
            <p className="eyebrow">Admin Products</p>
            <h1>Product management</h1>
          </div>
          <p>Review artist-submitted products, hide unsuitable listings, and keep short moderation notes.</p>
        </div>

        <AdminNav token={token} active="products" />

        <Notice saved={params.saved} error={params.error || data.error} configured={data.configured} />

        <div className="mb-5 flex flex-wrap gap-2">
          <FilterLink token={token} label={`All ${data.products.length}`} active={!selectedStatus} />
          <FilterLink token={token} status="approved" label={`Live ${counts.approved}`} active={selectedStatus === "approved"} />
          <FilterLink token={token} status="hidden" label={`Hidden ${counts.hidden}`} active={selectedStatus === "hidden"} />
          <FilterLink token={token} status="needs_changes" label={`Needs changes ${counts.needs_changes}`} active={selectedStatus === "needs_changes"} />
        </div>

        {!data.configured ? (
          <div className="soft-card rounded-[8px] p-6">
            <h2 className="text-xl font-semibold text-[#2d3842]">Connect Supabase to manage products</h2>
            <p className="mt-2 text-sm leading-6 text-[#626960]">
              Product moderation becomes available after <code>SUPABASE_SERVICE_ROLE_KEY</code> is configured.
            </p>
          </div>
        ) : null}

        {data.configured && products.length === 0 ? (
          <div className="soft-card rounded-[8px] p-6">
            <h2 className="text-xl font-semibold text-[#2d3842]">No products in this view</h2>
            <p className="mt-2 text-sm leading-6 text-[#626960]">Try another status filter or wait for artists to publish products.</p>
          </div>
        ) : null}

        <div className="grid gap-5">
          {products.map((product) => (
            <article key={product.id} className="soft-card rounded-[8px] p-5 sm:p-6">
              <div className="grid gap-5 lg:grid-cols-[11rem_1fr_18rem]">
                <div className="overflow-hidden rounded-[8px] border border-[#d9ddd2] bg-[#f5fbff]">
                  {product.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={product.image.url} alt={product.image.alt} className="aspect-square w-full object-cover" />
                  ) : (
                    <div className="flex aspect-square items-center justify-center px-4 text-center text-sm text-[#626960]">No image</div>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={product.status} />
                    {product.featuredActive ? (
                      <span className="rounded-full bg-[#f5e9c8] px-3 py-1 text-xs font-semibold text-[#6f5520]">Featured</span>
                    ) : null}
                  </div>
                  <h2 className="mt-3 text-2xl font-semibold text-[#2d3842]">{product.title}</h2>
                  <p className="mt-1 text-sm text-[#626960]">
                    {product.artist ? product.artist.brandName : "Unknown artist"} · {product.category} · {product.priceText}
                  </p>
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#626960]">{product.description || "No description provided."}</p>
                  {product.tags.length ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {product.tags.slice(0, 6).map((tag) => (
                        <span key={tag} className="pastel-chip px-3 py-1 text-xs font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  <div className="mt-5 flex flex-wrap gap-3 text-sm font-semibold">
                    <Link href={`/products/${product.slug}`} target="_blank" className="quiet-link">
                      View public page
                    </Link>
                    {product.artist ? (
                      <Link href={`/artists/${product.artist.slug}`} target="_blank" className="quiet-link">
                        View artist
                      </Link>
                    ) : null}
                    {product.externalUrl ? (
                      <Link href={product.externalUrl} target="_blank" rel="noreferrer" className="quiet-link">
                        External link
                      </Link>
                    ) : null}
                  </div>
                </div>

                <form action={`/api/admin/products/${product.id}`} method="post" className="rounded-[8px] border border-[#d9ddd2] bg-white/70 p-4">
                  <input type="hidden" name="_method" value="PATCH" />
                  <input type="hidden" name="token" value={token} />
                  <label className="block">
                    <span className="text-sm font-semibold text-[#2d3842]">Status</span>
                    <select
                      name="status"
                      defaultValue={product.status}
                      className="mt-2 min-h-11 w-full rounded-[6px] border border-[#d9ddd2] bg-white px-3 text-sm outline-none focus:border-teal-700"
                    >
                      {editableAdminProductStatuses.map((status) => (
                        <option key={status} value={status}>
                          {adminProductStatusLabels[status]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="mt-4 block">
                    <span className="text-sm font-semibold text-[#2d3842]">Admin notes</span>
                    <textarea
                      name="admin_notes"
                      rows={5}
                      defaultValue={product.adminNotes}
                      className="mt-2 w-full rounded-[6px] border border-[#d9ddd2] bg-white px-3 py-2 text-sm outline-none focus:border-teal-700"
                      placeholder="Reason for hiding, quality notes, or follow-up."
                    />
                  </label>
                  <button type="submit" className="studio-button studio-button-primary mt-4 w-full">
                    Save product
                  </button>
                  {product.status === "approved" ? (
                    <button
                      type="submit"
                      name="status"
                      value="hidden"
                      className="studio-button studio-button-secondary mt-3 w-full"
                    >
                      Hide now
                    </button>
                  ) : (
                    <button
                      type="submit"
                      name="status"
                      value="approved"
                      className="studio-button studio-button-secondary mt-3 w-full"
                    >
                      Restore live
                    </button>
                  )}
                </form>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Notice({ saved, error, configured }: { saved?: string; error?: string | null; configured: boolean }) {
  if (!saved && !error && configured) {
    return null;
  }

  return (
    <div className="mb-5 grid gap-3">
      {!configured ? (
        <p className="rounded-[8px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          Supabase is not configured. This page cannot save changes yet.
        </p>
      ) : null}
      {saved ? (
        <p className="rounded-[8px] border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-950">Product saved.</p>
      ) : null}
      {error ? (
        <p className="rounded-[8px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-950">{error}</p>
      ) : null}
    </div>
  );
}

function FilterLink({
  token,
  status,
  label,
  active,
}: {
  token: string;
  status?: AdminProductStatus;
  label: string;
  active: boolean;
}) {
  const params = new URLSearchParams({ token });

  if (status) {
    params.set("status", status);
  }

  return (
    <Link
      href={`/admin/products?${params.toString()}`}
      className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
        active
          ? "border-[#2d3842] bg-[#2d3842] text-white"
          : "border-[#d9ddd2] bg-white/70 text-[#626960] hover:border-[#9ba69d] hover:text-[#2d3842]"
      }`}
    >
      {label}
    </Link>
  );
}

function StatusBadge({ status }: { status: AdminProductStatus }) {
  const tone =
    status === "approved"
      ? "bg-teal-50 text-teal-950"
      : status === "hidden"
        ? "bg-red-50 text-red-950"
        : "bg-amber-50 text-amber-950";

  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone}`}>{adminProductStatusLabels[status]}</span>;
}

function countProducts(products: { status: AdminProductStatus }[]) {
  return products.reduce(
    (counts, product) => {
      counts[product.status] += 1;
      return counts;
    },
    {
      approved: 0,
      hidden: 0,
      draft: 0,
      pending: 0,
      needs_changes: 0,
    } as Record<AdminProductStatus, number>,
  );
}

function normalizeStatusParam(value: string | undefined): AdminProductStatus | null {
  if (value === "approved" || value === "hidden" || value === "draft" || value === "pending" || value === "needs_changes") {
    return value;
  }

  return null;
}
