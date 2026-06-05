"use client";

import { useState } from "react";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { ProductStyleTagPicker } from "@/components/ProductStyleTagPicker";

const productCategories = [
  "Accessories",
  "Keychains",
  "Photocard Cases",
  "Phone Griptoks",
  "Containers",
  "Home Decos",
  "Custom Gifts",
  "Keepsakes",
  "Art Objects",
  "Other",
];

type SubmitState = "idle" | "submitting" | "success" | "error";

type CreatedProduct = {
  title: string;
  slug: string;
};

export function ArtistProductForm() {
  const supabase = getSupabaseBrowserClient();
  const [state, setState] = useState<SubmitState>("idle");
  const [message, setMessage] = useState("");
  const [createdProduct, setCreatedProduct] = useState<CreatedProduct | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("submitting");
    setMessage("");
    setCreatedProduct(null);

    if (!supabase) {
      setState("error");
      setMessage("Supabase is not configured yet.");
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);
    const files = formData.getAll("images").filter((item): item is File => item instanceof File && item.size > 0);

    if (files.length === 0) {
      setState("error");
      setMessage("Please upload at least 1 product photo.");
      return;
    }

    if (files.length > 5) {
      setState("error");
      setMessage("Please upload no more than 5 product photos.");
      return;
    }

    const { data } = await supabase.auth.getSession();
    const accessToken = data.session?.access_token;

    if (!accessToken) {
      setState("error");
      setMessage("Please sign in again before publishing a product.");
      return;
    }

    const response = await fetch("/api/artist/products", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    });
    const payload = await response.json();

    if (!response.ok) {
      setState("error");
      setMessage(payload.error || "Product could not be published.");
      return;
    }

    setState("success");
    setCreatedProduct(payload.product);
    form.reset();
  }

  return (
    <form onSubmit={handleSubmit} className="soft-card space-y-7 rounded-[10px] p-6 sm:p-8">
      <div className="grid gap-5 lg:grid-cols-2">
        <Label title="Product title *">
          <input name="title" required maxLength={120} className="field-control mt-2 w-full px-3" placeholder="Pearl heart keychain" />
        </Label>

        <Label title="Category *">
          <select name="category" required className="field-control mt-2 w-full px-3">
            <option value="">Choose category</option>
            {productCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </Label>

        <Label title="Price range in USD *">
          <input name="price_text" required maxLength={80} className="field-control mt-2 w-full px-3" placeholder="$20 - $50" />
          <p className="mt-2 text-sm leading-6 text-[#626960]">Use US dollars so visitors can compare products consistently.</p>
        </Label>

        <Label title="Product or shop link *">
          <input
            name="external_url"
            required
            type="url"
            className="field-control mt-2 w-full px-3"
            placeholder="https://your-shop-or-contact-link.com"
          />
          <p className="mt-2 text-sm leading-6 text-[#626960]">Visitors will use this link to contact you or buy directly from you.</p>
        </Label>
      </div>

      <Label title="Description *">
        <textarea
          name="description"
          required
          maxLength={900}
          className="field-control mt-2 min-h-40 w-full px-3 py-3"
          placeholder="Describe the materials, style, size, and custom options."
        />
        <p className="mt-2 text-sm leading-6 text-[#626960]">
          English is recommended. If another language is used, we may translate it for display and the wording may change slightly.
        </p>
      </Label>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="lg:col-span-2">
          <p className="text-sm font-semibold text-[#2d3842]">Style tags</p>
          <ProductStyleTagPicker />
        </div>

        <Label title="Image alt text">
          <input name="alt_text" maxLength={160} className="field-control mt-2 w-full px-3" placeholder="Short description of the product photos" />
          <p className="mt-2 text-sm leading-6 text-[#626960]">Optional, but helpful for accessibility and search.</p>
        </Label>
      </div>

      <Label title="Product photos *">
        <input name="images" required type="file" accept="image/png,image/jpeg,image/webp" multiple className="field-control mt-2 w-full px-3 py-3" />
        <p className="mt-2 text-sm leading-6 text-[#626960]">Upload 1 to 5 JPG, PNG, or WebP images. Max 2 MB each.</p>
      </Label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flat-panel flex items-center gap-3 rounded-[8px] px-4 py-4 text-[#626960]">
          <input name="accepts_custom" type="checkbox" className="h-5 w-5" />
          <span>Accepts custom orders</span>
        </label>
        <label className="flat-panel flex items-center gap-3 rounded-[8px] px-4 py-4 text-[#626960]">
          <input name="ships_international" type="checkbox" className="h-5 w-5" />
          <span>Ships internationally</span>
        </label>
      </div>

      <button type="submit" disabled={state === "submitting"} className="studio-button studio-button-primary w-full disabled:opacity-60">
        {state === "submitting" ? "Publishing..." : "Publish product"}
      </button>

      {state === "error" && message ? <Status tone="error">{message}</Status> : null}

      {state === "success" && createdProduct ? (
        <Status tone="success">
          Product published.{" "}
          <Link className="font-semibold underline underline-offset-4" href={`/products/${createdProduct.slug}`}>
            View {createdProduct.title}
          </Link>
        </Status>
      ) : null}
    </form>
  );
}

function Label({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-[#2d3842]">{title}</span>
      {children}
    </label>
  );
}

function Status({ tone, children }: { tone: "success" | "error"; children: React.ReactNode }) {
  const className =
    tone === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-950"
      : "border-red-200 bg-red-50 text-red-950";

  return <p className={`rounded-[8px] border px-4 py-3 text-sm ${className}`}>{children}</p>;
}
