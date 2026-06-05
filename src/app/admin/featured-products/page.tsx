import type { InputHTMLAttributes } from "react";
import { hasAdminAccess } from "@/lib/admin-auth";
import { getFeaturedProductAdminData } from "@/lib/featured-products";

export const metadata = {
  title: "Featured Finds Manager",
};

type PageProps = {
  searchParams: Promise<{
    token?: string;
    saved?: string;
    deleted?: string;
    error?: string;
  }>;
};

export default async function AdminFeaturedProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const token = params.token || "";

  if (!hasAdminAccess(token)) {
    return (
      <section className="section">
        <div className="max-w-3xl">
          <p className="eyebrow">Admin Featured Finds</p>
          <h1 className="display-heading mt-4 text-4xl">Admin access required</h1>
          <p className="mt-4 leading-7 text-[#626960]">
            Add your admin review token to the page URL to manage homepage finds.
          </p>
        </div>
      </section>
    );
  }

  const data = await getFeaturedProductAdminData();
  const availableProducts = data.approvedProducts.filter(
    (product) => !data.featuredProducts.some((featured) => featured.productId === product.id),
  );

  return (
    <section className="section">
      <div>
        <div className="section-heading">
          <div>
            <p className="eyebrow">Admin Featured Finds</p>
            <h1>Favorite Finds This Week</h1>
          </div>
          <p>Choose approved products for the homepage. Homepage cards use the product&apos;s first photo.</p>
        </div>

        <Notice saved={params.saved} deleted={params.deleted} error={params.error} warning={data.warning} configured={data.configured} />

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <form
            action="/api/admin/featured-products"
            method="post"
            encType="multipart/form-data"
            className="soft-card self-start rounded-[8px] p-5"
          >
            <input type="hidden" name="token" value={token} />
            <h2 className="text-xl font-semibold text-[#2d3842]">Add homepage find</h2>
            <p className="mt-2 text-sm leading-6 text-[#626960]">
              Pick an approved product from the thumbnails. The homepage card will use that product&apos;s first photo.
            </p>
            <div className="mt-5">
              <p className="text-sm font-semibold text-[#2d3842]">Approved product</p>
              {availableProducts.length ? (
                <div className="mt-3 grid max-h-[30rem] gap-3 overflow-auto pr-1 sm:grid-cols-2">
                  {availableProducts.map((product) => (
                    <label key={product.id} className="group cursor-pointer">
                      <input name="product_id" type="radio" value={product.id} required className="peer sr-only" />
                      <span className="grid gap-3 rounded-[8px] border border-[#d9ddd2] bg-white/82 p-3 transition peer-checked:border-[#8fb9c5] peer-checked:bg-[#f5fbff] peer-checked:shadow-[0_0_0_4px_rgb(191_232_247_/_0.35)] group-hover:border-[#9ba69d]">
                        <span className="block aspect-square overflow-hidden rounded-[7px] bg-[#f5fbff]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={product.imageUrl} alt={product.imageAlt} className="h-full w-full object-cover" />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold text-[#2d3842]">{product.title}</span>
                          <span className="mt-1 block truncate text-xs text-[#626960]">{product.category}</span>
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="mt-3 rounded-[8px] border border-[#d9ddd2] bg-[#f8faf5] px-4 py-3 text-sm text-[#626960]">
                  No unfeatured approved products are available.
                </p>
              )}
            </div>
            <div className="mt-4">
              <Field label="Sort order" name="sort_order" type="number" defaultValue="0" />
            </div>
            <label className="mt-4 flex items-center gap-3 text-sm font-semibold text-[#2d3842]">
              <input name="is_active" type="checkbox" defaultChecked className="h-4 w-4" />
              Active on homepage
            </label>
            <button type="submit" className="studio-button studio-button-primary mt-5 w-full">
              Add featured find
            </button>
          </form>

          <div className="grid gap-4">
            {data.featuredProducts.length === 0 ? (
              <div className="soft-card rounded-[8px] p-5">
                <h2 className="text-xl font-semibold text-[#2d3842]">No featured finds yet</h2>
                <p className="mt-2 text-sm leading-6 text-[#626960]">Add approved products to control the homepage list.</p>
              </div>
            ) : null}

            {data.featuredProducts.map((featured) => (
              <article key={featured.id} className="soft-card rounded-[8px] p-5">
                <div className="grid gap-5 md:grid-cols-[10rem_1fr]">
                  <div className="overflow-hidden rounded-[8px] border border-[#d9ddd2] bg-[#f5fbff]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={featured.product.imageUrl}
                      alt={featured.product.imageAlt}
                      className="aspect-square w-full object-cover"
                      style={{ objectPosition: featured.product.imagePosition }}
                    />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#566c71]">
                          {featured.isActive ? "Active" : "Inactive"} · Order {featured.sortOrder}
                        </p>
                        <h2 className="mt-2 text-2xl font-semibold text-[#2d3842]">{featured.product.title}</h2>
                        <p className="mt-1 text-sm text-[#626960]">{featured.product.category}</p>
                        <p className="mt-2 text-xs leading-5 text-[#626960]">
                          Homepage uses this product&apos;s first product photo.
                        </p>
                      </div>
                    </div>
                    <form
                      action={`/api/admin/featured-products/${featured.id}`}
                      method="post"
                      encType="multipart/form-data"
                      className="mt-5 grid gap-4"
                    >
                      <input type="hidden" name="_method" value="PATCH" />
                      <input type="hidden" name="token" value={token} />
                      <div className="grid gap-4">
                        <Field label="Sort order" name="sort_order" type="number" defaultValue={String(featured.sortOrder)} />
                      </div>
                      <label className="flex items-center gap-3 text-sm font-semibold text-[#2d3842]">
                        <input name="is_active" type="checkbox" defaultChecked={featured.isActive} className="h-4 w-4" />
                        Active on homepage
                      </label>
                      <div className="flex flex-wrap gap-3">
                        <button type="submit" className="studio-button studio-button-primary">
                          Save changes
                        </button>
                        <button
                          formAction={`/api/admin/featured-products/${featured.id}`}
                          name="_method"
                          value="DELETE"
                          className="studio-button studio-button-secondary"
                        >
                          Remove
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Notice({
  saved,
  deleted,
  error,
  warning,
  configured,
}: {
  saved?: string;
  deleted?: string;
  error?: string;
  warning: string | null;
  configured: boolean;
}) {
  if (!saved && !deleted && !error && !warning && configured) {
    return null;
  }

  return (
    <div className="mb-5 grid gap-3">
      {!configured ? (
        <p className="rounded-[8px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          Supabase is not configured. This page is showing fallback products and cannot save changes yet.
        </p>
      ) : null}
      {warning ? (
        <p className="rounded-[8px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">{warning}</p>
      ) : null}
      {saved ? (
        <p className="rounded-[8px] border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-950">Featured find saved.</p>
      ) : null}
      {deleted ? (
        <p className="rounded-[8px] border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-950">Featured find removed.</p>
      ) : null}
      {error ? (
        <p className="rounded-[8px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-950">{error}</p>
      ) : null}
    </div>
  );
}

function Field({
  label,
  name,
  className = "",
  ...props
}: {
  label: string;
  name: string;
  className?: string;
} & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={`block ${className}`}>
      <span className="text-sm font-semibold text-[#2d3842]">{label}</span>
      <input name={name} className="field-control mt-2 w-full px-3" {...props} />
    </label>
  );
}
