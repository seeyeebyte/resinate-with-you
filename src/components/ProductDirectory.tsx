"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { ProductCard } from "@/components/ProductCard";
import { artists as mockArtists, type Artist, type Product } from "@/lib/mock-data";
import { categories } from "@/lib/site";

type ProductDirectoryProps = {
  artists?: Artist[];
  products: Product[];
};

const priceRanges = [
  { label: "All prices", value: "all" },
  { label: "Under $25", value: "under-25" },
  { label: "$25 - $50", value: "25-50" },
  { label: "$50 - $100", value: "50-100" },
  { label: "$100+", value: "100-plus" },
];

export function ProductDirectory({ artists = mockArtists, products }: ProductDirectoryProps) {
  const [search, setSearch] = useState("");
  const [artistSlug, setArtistSlug] = useState("all");
  const [category, setCategory] = useState("all");
  const [country, setCountry] = useState("all");
  const [custom, setCustom] = useState("all");
  const [shipping, setShipping] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [style, setStyle] = useState("all");

  const artistBySlug = useMemo(() => new Map(artists.map((artist) => [artist.slug, artist])), [artists]);
  const countries = useMemo(() => unique(artists.map((artist) => artist.country)), [artists]);
  const productStyles = useMemo(() => unique(products.flatMap((product) => product.tags)).sort(), [products]);

  const filteredProducts = products.filter((product) => {
    const artist = artistBySlug.get(product.artistSlug);
    const haystack = [product.title, product.description, product.category, product.tags.join(" "), artist?.brandName, artist?.country, artist?.city]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    if (search.trim() && !haystack.includes(search.trim().toLowerCase())) {
      return false;
    }

    if (artistSlug !== "all" && product.artistSlug !== artistSlug) {
      return false;
    }

    if (category !== "all" && product.category !== category) {
      return false;
    }

    if (country !== "all" && artist?.country !== country) {
      return false;
    }

    if (custom !== "all" && artist?.acceptsCustom !== (custom === "yes")) {
      return false;
    }

    if (shipping !== "all" && artist?.shipsInternational !== (shipping === "yes")) {
      return false;
    }

    if (style !== "all" && !product.tags.includes(style)) {
      return false;
    }

    return matchesPriceRange(product.priceText, priceRange);
  });

  return (
    <div>
      <div className="soft-card rounded-[8px] p-4">
        <div className="grid gap-3 lg:grid-cols-[1.2fr_repeat(3,0.8fr)]">
          <FilterField label="Search">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search style, artist, or product"
              className="field-control w-full px-4"
            />
          </FilterField>
          <FilterField label="Artist">
            <Select value={artistSlug} onChange={setArtistSlug}>
              <option value="all">All artists</option>
              {artists.map((artist) => (
                <option key={artist.slug} value={artist.slug}>
                  {artist.brandName}
                </option>
              ))}
            </Select>
          </FilterField>
          <FilterField label="Category">
            <Select value={category} onChange={setCategory}>
              <option value="all">All categories</option>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </Select>
          </FilterField>
          <FilterField label="Country or region">
            <Select value={country} onChange={setCountry}>
              <option value="all">All locations</option>
              {countries.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </Select>
          </FilterField>
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-4">
          <FilterField label="Custom orders">
            <Select value={custom} onChange={setCustom}>
              <option value="all">Any</option>
              <option value="yes">Accepts custom</option>
              <option value="no">No custom orders</option>
            </Select>
          </FilterField>
          <FilterField label="Worldwide shipping">
            <Select value={shipping} onChange={setShipping}>
              <option value="all">Any</option>
              <option value="yes">Ships worldwide</option>
              <option value="no">Local only</option>
            </Select>
          </FilterField>
          <FilterField label="Price range">
            <Select value={priceRange} onChange={setPriceRange}>
              {priceRanges.map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </Select>
          </FilterField>
          <FilterField label="Style">
            <Select value={style} onChange={setStyle}>
              <option value="all">All styles</option>
              {productStyles.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </Select>
          </FilterField>
        </div>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <button type="button" onClick={blurActiveElement} className="studio-button studio-button-primary min-h-0 px-5 py-3">
            Apply filters
          </button>
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setArtistSlug("all");
              setCategory("all");
              setCountry("all");
              setCustom("all");
              setShipping("all");
              setPriceRange("all");
              setStyle("all");
              blurActiveElement();
            }}
            className="quiet-link text-center sm:text-left"
          >
            Clear filters
          </button>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-4">
        <p className="text-sm font-semibold text-[color-mix(in_srgb,var(--muted)_78%,var(--ink))]">{filteredProducts.length} products</p>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} artist={artistBySlug.get(product.artistSlug)} product={product} />
        ))}
      </div>

      {filteredProducts.length === 0 ? (
        <div className="soft-card mt-6 rounded-[8px] p-6">
          <h2 className="text-xl font-semibold text-[var(--ink)]">No products match these filters</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Try a broader search, category, or price range.</p>
        </div>
      ) : null}
    </div>
  );
}

function FilterField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-[color-mix(in_srgb,var(--muted)_78%,var(--ink))]">{label}</span>
      {children}
    </label>
  );
}

function blurActiveElement() {
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }
}

function Select({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <select value={value} onChange={(event) => onChange(event.target.value)} className="field-control w-full px-4">
      {children}
    </select>
  );
}

function matchesPriceRange(priceText: string, range: string) {
  if (range === "all") {
    return true;
  }

  const prices = priceText.match(/\d+(?:\.\d+)?/g)?.map(Number) ?? [];
  const low = prices.length ? Math.min(...prices) : 0;
  const high = prices.length ? Math.max(...prices) : low;

  if (range === "under-25") {
    return low < 25;
  }

  if (range === "25-50") {
    return high >= 25 && low <= 50;
  }

  if (range === "50-100") {
    return high >= 50 && low <= 100;
  }

  return high >= 100;
}

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}
