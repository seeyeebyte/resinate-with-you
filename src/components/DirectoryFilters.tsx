"use client";

import { type ReactNode, useMemo, useState } from "react";
import { ArtistPuzzleWall } from "@/components/ArtistPuzzleWall";
import { artists as mockArtists, type Artist } from "@/lib/mock-data";
import { categories } from "@/lib/site";

export function DirectoryFilters({ artists = mockArtists, preview = false }: { artists?: Artist[]; preview?: boolean }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [location, setLocation] = useState("All");
  const [custom, setCustom] = useState("All");

  const filteredArtists = useMemo(() => {
    return artists.filter((artist) => {
      const query = search.trim().toLowerCase();
      const matchesSearch =
        !query ||
        artist.brandName.toLowerCase().includes(query) ||
        artist.bio.toLowerCase().includes(query) ||
        artist.categories.some((item) => item.toLowerCase().includes(query));
      const matchesCategory = category === "All" || artist.categories.includes(category);
      const matchesLocation = location === "All" || artist.country === location;
      const matchesCustom =
        custom === "All" || (custom === "Yes" ? artist.acceptsCustom : !artist.acceptsCustom);

      return matchesSearch && matchesCategory && matchesLocation && matchesCustom;
    });
  }, [artists, category, custom, location, search]);

  const visibleArtists = filteredArtists;
  const categoryOptions = useMemo(() => ["All", ...unique([...categories, ...artists.flatMap((artist) => artist.categories)])], [artists]);
  const locationOptions = useMemo(() => ["All", ...unique(artists.map((artist) => artist.country))], [artists]);

  return (
    <div className="space-y-8">
      <div className="soft-card grid gap-3 rounded-[12px] p-3 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <FilterField label="Search">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search style, artist, or product"
            className="field-control px-4 text-sm"
          />
        </FilterField>
        <FilterField label="Category">
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="field-control px-4 text-sm"
          >
            {categoryOptions.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </FilterField>
        <FilterField label="Country or region">
          <select
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            className="field-control px-4 text-sm"
          >
            {locationOptions.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </FilterField>
        <FilterField label="Custom orders">
          <select
            value={custom}
            onChange={(event) => setCustom(event.target.value)}
            className="field-control px-4 text-sm"
          >
            <option>All</option>
            <option>Yes</option>
            <option>No</option>
          </select>
        </FilterField>
        <div className="flex flex-col gap-2 md:col-span-4 md:flex-row md:items-center md:justify-between">
          <button type="button" onClick={blurActiveElement} className="studio-button studio-button-primary min-h-0 px-5 py-3">
            Apply filters
          </button>
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setCategory("All");
              setLocation("All");
              setCustom("All");
              blurActiveElement();
            }}
            className="quiet-link text-center md:text-left"
          >
            Clear filters
          </button>
        </div>
      </div>

      {visibleArtists.length > 0 ? (
        <ArtistPuzzleWall artists={visibleArtists} preview={preview} />
      ) : (
        <div className="rounded-[10px] border border-dashed border-[var(--sage)] bg-white p-10 text-center text-[var(--muted)]">
          No artists match these filters yet.
        </div>
      )}
    </div>
  );
}

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function blurActiveElement() {
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }
}

function FilterField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-2">
      <span className="px-1 text-xs font-semibold uppercase tracking-[0.12em] text-[color-mix(in_srgb,var(--muted)_78%,var(--ink))]">{label}</span>
      {children}
    </label>
  );
}
