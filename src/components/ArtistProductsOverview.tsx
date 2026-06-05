"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { InputHTMLAttributes } from "react";
import Link from "next/link";
import { formatDisplayPrice } from "@/lib/price";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { categories as productCategories } from "@/lib/site";
import { ProductStyleTagPicker } from "@/components/ProductStyleTagPicker";

type ArtistProduct = {
  id: string;
  title: string;
  slug: string;
  category: string;
  priceText: string;
  description: string;
  externalUrl: string;
  status: string;
  tagsText: string;
  acceptsCustom: boolean;
  shipsInternational: boolean;
  images: {
    id: string;
    imageUrl: string;
    imageAlt: string;
    sortOrder: number;
  }[];
  imageUrl: string;
  imageAlt: string;
};

export function ArtistProductsOverview() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [products, setProducts] = useState<ArtistProduct[]>([]);
  const [limit, setLimit] = useState(15);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");
  const [editingId, setEditingId] = useState("");

  const getAccessToken = useCallback(async () => {
    if (!supabase) {
      return "";
    }

    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || "";
  }, [supabase]);

  const loadProducts = useCallback(async () => {
    const token = await getAccessToken();

    if (!token) {
      setLoading(false);
      return;
    }

    const response = await fetch("/api/artist/products", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data.error || "Products could not be loaded.");
      return;
    }

    setProducts(data.products || []);
    setLimit(data.limit || 15);
  }, [getAccessToken]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      loadProducts();
    }, 0);

    return () => window.clearTimeout(id);
  }, [loadProducts]);

  async function saveProduct(productId: string, form: HTMLFormElement) {
    setMessage("");
    setError("");
    setBusyId(productId);

    const token = await getAccessToken();

    if (!token) {
      setError("Please sign in again before editing products.");
      setBusyId("");
      return;
    }

    const response = await fetch(`/api/artist/products/${productId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: new FormData(form),
    });
    const data = await response.json();
    setBusyId("");

    if (!response.ok) {
      setError(data.error || "Product could not be saved.");
      return;
    }

    setMessage("Product saved.");
    setEditingId("");
    await loadProducts();
  }

  async function toggleProduct(product: ArtistProduct) {
    const action = product.status === "hidden" ? "show" : "hide";
    const formData = new FormData();
    formData.append("action", action);
    await runProductAction(product.id, "PATCH", formData, action === "hide" ? "Product hidden." : "Product is public again.");
  }

  async function deleteProductImage(product: ArtistProduct, image: ArtistProduct["images"][number]) {
    const confirmed = window.confirm(`Delete this image from "${product.title}"? This cannot be recovered.`);

    if (!confirmed) {
      return;
    }

    const formData = new FormData();
    formData.append("action", "delete-image");
    formData.append("image_id", image.id);
    await runProductAction(product.id, "PATCH", formData, "Image deleted.");
  }

  async function deleteProduct(product: ArtistProduct) {
    const confirmed = window.confirm(`Delete "${product.title}" permanently? This cannot be recovered.`);

    if (!confirmed) {
      return;
    }

    await runProductAction(product.id, "DELETE", undefined, "Product deleted.");
  }

  async function runProductAction(productId: string, method: "PATCH" | "DELETE", body: FormData | undefined, successMessage: string) {
    setMessage("");
    setError("");
    setBusyId(productId);

    const token = await getAccessToken();

    if (!token) {
      setError("Please sign in again before managing products.");
      setBusyId("");
      return;
    }

    const response = await fetch(`/api/artist/products/${productId}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body,
    });
    const data = await response.json();
    setBusyId("");

    if (!response.ok) {
      setError(data.error || "Product could not be updated.");
      return;
    }

    setMessage(successMessage);
    await loadProducts();
  }

  return (
    <div className="soft-card rounded-[10px] p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#566c71]">Your products</p>
          <h2 className="mt-2 text-2xl font-semibold text-[#2d3842]">
            {products.length} / {limit} uploaded
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#626960]">Hidden products still count toward the 15-product limit.</p>
        </div>
        <Link href="/artist/products/new" className="studio-button studio-button-primary">
          Add product
        </Link>
      </div>

      {error ? <p className="mt-4 rounded-[8px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-950">{error}</p> : null}
      {message ? <p className="mt-4 rounded-[8px] border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-950">{message}</p> : null}

      {loading ? <p className="mt-5 text-sm text-[#626960]">Loading products...</p> : null}

      {!loading && products.length === 0 ? (
        <div className="mt-5 rounded-[8px] border border-[#d9ddd2] bg-[#f8faf5] p-4">
          <p className="text-sm leading-6 text-[#626960]">No products yet. Add your first public product when you are ready.</p>
        </div>
      ) : null}

      <div className="mt-5 grid gap-4">
        {products.map((product) => {
          const editing = editingId === product.id;

          return (
          <article key={product.id} className="rounded-[8px] border border-[#d9ddd2] bg-white/72 p-4">
            <div className="grid gap-4 lg:grid-cols-[6rem_1fr]">
              <div className="aspect-square overflow-hidden rounded-[8px] border border-[#d9ddd2] bg-[#f5fbff]">
                {product.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={product.imageUrl} alt={product.imageAlt} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs font-semibold uppercase tracking-[0.12em] text-[#566c71]">
                    No image
                  </div>
                )}
              </div>
              <div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#566c71]">
                      {product.status === "hidden" ? "Hidden" : "Public"} · {formatDisplayPrice(product.priceText)} · {product.category}
                    </p>
                    <Link href={`/products/${product.slug}`} className="mt-1 inline-block max-w-full truncate text-xl font-semibold text-[#2d3842] underline-offset-4 hover:underline">
                      {product.title}
                    </Link>
                    <p className="mt-1 line-clamp-1 text-sm text-[#626960]">{product.description}</p>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingId(editing ? "" : product.id)}
                      className="studio-button studio-button-secondary min-h-0 px-4 py-2"
                    >
                      {editing ? "Close" : "Edit"}
                    </button>
                    <button type="button" onClick={() => toggleProduct(product)} disabled={busyId === product.id} className="studio-button studio-button-secondary min-h-0 px-4 py-2">
                      {product.status === "hidden" ? "Show" : "Hide"}
                    </button>
                    <button type="button" onClick={() => deleteProduct(product)} disabled={busyId === product.id} className="studio-button studio-button-secondary min-h-0 px-4 py-2">
                      Delete
                    </button>
                  </div>
                </div>

                {editing ? (
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  saveProduct(product.id, event.currentTarget);
                }}
                className="mt-5 grid gap-4 rounded-[8px] border border-[#d9ddd2] bg-[#f8faf5] p-4"
              >
                <div className="grid gap-3 lg:grid-cols-2">
                  <Field label="Title" name="title" defaultValue={product.title} required />
                  <label className="block">
                    <span className="text-sm font-semibold text-[#2d3842]">Category</span>
                    <select name="category" defaultValue={product.category} required className="field-control mt-2 w-full px-3">
                      {productCategories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </label>
                  <Field label="Price in USD" name="price_text" defaultValue={product.priceText} required />
                  <Field label="Product or shop link" name="external_url" defaultValue={product.externalUrl} required type="url" />
                  <div className="lg:col-span-2">
                    <p className="text-sm font-semibold text-[#2d3842]">Style tags</p>
                    <ProductStyleTagPicker defaultValue={product.tagsText} />
                  </div>
                  <Field label="Image alt text for new uploads" name="alt_text" defaultValue={product.imageAlt} />
                </div>

                <label className="block">
                  <span className="text-sm font-semibold text-[#2d3842]">Description</span>
                  <textarea name="description" required defaultValue={product.description} className="field-control mt-2 min-h-28 w-full px-3 py-3" />
                </label>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="flat-panel flex items-center gap-3 rounded-[8px] px-4 py-4 text-[#626960]">
                    <input name="accepts_custom" type="checkbox" defaultChecked={product.acceptsCustom} className="h-5 w-5" />
                    <span>Accepts custom orders</span>
                  </label>
                  <label className="flat-panel flex items-center gap-3 rounded-[8px] px-4 py-4 text-[#626960]">
                    <input name="ships_international" type="checkbox" defaultChecked={product.shipsInternational} className="h-5 w-5" />
                    <span>Ships internationally</span>
                  </label>
                </div>

                <div>
                  <p className="text-sm font-semibold text-[#2d3842]">Product images</p>
                  <p className="mt-1 text-xs leading-5 text-[#626960]">Keep 1 to 5 images. Use Delete to remove one image, or upload more JPG, PNG, or WebP files, max 2 MB each.</p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
                    {product.images.map((image) => (
                      <div key={image.id} className="rounded-[8px] border border-[#d9ddd2] bg-white p-2 text-xs text-[#626960]">
                        <span className="block aspect-square overflow-hidden rounded-[6px] bg-[#f5fbff]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={image.imageUrl} alt={image.imageAlt} className="h-full w-full object-cover" />
                        </span>
                        <button
                          type="button"
                          onClick={() => deleteProductImage(product, image)}
                          disabled={busyId === product.id}
                          className="mt-2 inline-flex w-full items-center justify-center rounded-full border border-[#d9ddd2] px-3 py-2 text-sm font-semibold text-[#2d3842] transition hover:bg-[#f5fbff] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                  <input name="images" type="file" accept="image/png,image/jpeg,image/webp" multiple className="field-control mt-3 w-full px-3 py-3" />
                </div>

                <button type="submit" disabled={busyId === product.id} className="studio-button studio-button-primary">
                  {busyId === product.id ? "Saving..." : "Save product"}
                </button>
              </form>
                ) : null}
              </div>
            </div>
          </article>
          );
        })}
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  ...props
}: {
  label: string;
  name: string;
} & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-[#2d3842]">{label}</span>
      <input name={name} className="field-control mt-2 w-full px-3" {...props} />
    </label>
  );
}
