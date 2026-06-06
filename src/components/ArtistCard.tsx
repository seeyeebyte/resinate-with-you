import Link from "next/link";
import type { CSSProperties } from "react";
import { PlatformLinks } from "@/components/PlatformLinks";
import { PuzzleBlock } from "@/components/PuzzleBlock";
import { themeConfig } from "@/lib/customization";
import type { Artist } from "@/lib/mock-data";

export function ArtistCard({ artist }: { artist: Artist }) {
  const tones = themeConfig.puzzle.artistCardTones;
  const variants = ["top", "right", "bottom", "left"] as const;
  const seed = artist.id.split("").reduce((total, char) => total + char.charCodeAt(0), 0);

  return (
    <article className="group soft-card rounded-[10px] p-5 transition duration-300 hover:-translate-y-1">
      <Link href={`/artists/${artist.slug}`} className="block">
        <div className="flex items-start gap-4">
          <PuzzleBlock className="h-16 w-16 shrink-0" tone={tones[seed % tones.length]} variant={variants[seed % variants.length]} />
          <div>
            <h3 className="display-heading text-xl leading-tight">{artist.brandName}</h3>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {artist.city}, {artist.country}
            </p>
          </div>
        </div>
        <p className="mt-4 line-clamp-3 text-sm leading-6 text-[var(--muted)]">{artist.bio}</p>
        <div className="mt-4">
          <PlatformLinks links={artist.platformLinks} compact />
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {artist.categories.slice(0, 3).map((category, index) => (
            <span
              key={category}
              className="pastel-chip px-3 py-1 text-xs font-semibold"
              style={{ "--chip-bg": themeConfig.puzzle.chipTones[index % themeConfig.puzzle.chipTones.length] } as CSSProperties}
            >
              {category}
            </span>
          ))}
          {artist.acceptsCustom ? (
            <span className="pastel-chip px-3 py-1 text-xs font-semibold" style={{ "--chip-bg": themeConfig.colors.lavender } as CSSProperties}>
              Custom
            </span>
          ) : null}
          {artist.artistType === "offline_studio" ? (
            <span className="pastel-chip px-3 py-1 text-xs font-semibold" style={{ "--chip-bg": "#dff9d9" } as CSSProperties}>
              Offline studio
            </span>
          ) : null}
        </div>
      </Link>
    </article>
  );
}
