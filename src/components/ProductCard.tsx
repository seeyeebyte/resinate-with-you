import Link from "next/link";
import Image from "next/image";
import type { CSSProperties } from "react";
import { getArtistForProduct, type Product } from "@/lib/mock-data";
import { PuzzleBlock } from "@/components/PuzzleBlock";
import type { PuzzleVariant } from "@/components/PuzzleImage";
import { themeConfig } from "@/lib/customization";
import { formatDisplayPrice } from "@/lib/price";

type ProductCardProps = {
  product: Product;
  artist?: ReturnType<typeof getArtistForProduct>;
  featured?: boolean;
};

export function ProductCard({ product, artist: providedArtist, featured = false }: ProductCardProps) {
  const artist = providedArtist ?? getArtistForProduct(product);
  const variants: PuzzleVariant[] = ["calm", "left", "right", "top", "bottom", "minimal"];
  const tones = themeConfig.puzzle.productBadgeTones;
  const seed = product.id.split("").reduce((total, char) => total + char.charCodeAt(0), 0);
  const variant = variants[seed % variants.length];
  const tone = tones[seed % tones.length];
  const badgeRotation = [-5, 3, -2, 5, -4, 2][seed % 6];

  return (
    <article
      className={`group transition duration-300 hover:-translate-y-1 ${
        featured ? "puzzle-product-card" : "soft-card overflow-hidden rounded-[10px]"
      }`}
    >
      <Link href={`/products/${product.slug}`} className="block">
        <div className={featured ? "product-image-frame featured" : "product-image-frame compact"}>
          {isRemoteImage(product.imageUrl) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt={product.imageAlt}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.035]"
              src={product.imageUrl}
              style={{ objectPosition: product.imagePosition }}
            />
          ) : (
            <Image
              alt={product.imageAlt}
              className="object-cover transition duration-500 group-hover:scale-[1.035]"
              fill
              sizes={featured ? "(min-width: 1024px) 31vw, (min-width: 640px) 46vw, 100vw" : "(min-width: 1024px) 28vw, 100vw"}
              src={product.imageUrl}
              style={{ objectPosition: product.imagePosition }}
            />
          )}
          <div
            className="product-price-badge"
            style={
              {
                "--badge-rotate": `${badgeRotation}deg`,
              } as CSSProperties
            }
          >
            <PuzzleBlock className="product-price-badge-shape" tone={tone} variant={variant} />
            <span>{formatDisplayPrice(product.priceText)}</span>
          </div>
        </div>
      </Link>
      <div className={featured ? "product-copy space-y-4" : "space-y-4 p-5 pt-2"}>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color-mix(in_srgb,var(--muted)_78%,var(--ink))]">{product.category}</p>
          <Link href={`/products/${product.slug}`} className="mt-2 block">
            <h3 className="display-heading text-[1.45rem] leading-tight">{product.title}</h3>
          </Link>
          {artist ? (
            <p className="mt-2 text-sm text-[var(--muted)]">
              {artist.brandName} · {artist.city}, {artist.country}
            </p>
          ) : product.artistName ? (
            <p className="mt-2 text-sm text-[var(--muted)]">
              {product.artistName}
              {product.artistCity || product.artistCountry ? ` · ${[product.artistCity, product.artistCountry].filter(Boolean).join(", ")}` : ""}
            </p>
          ) : null}
        </div>
        <div className="flex items-center justify-end gap-4">
          <div className="flex flex-wrap justify-end gap-2">
            {product.tags.slice(0, 2).map((tag, index) => (
              <span
                key={tag}
                className="pastel-chip px-3 py-1 text-xs font-medium"
                style={{ "--chip-bg": themeConfig.puzzle.chipTones[index % themeConfig.puzzle.chipTones.length] } as CSSProperties}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}

function isRemoteImage(src: string) {
  return /^https?:\/\//i.test(src);
}
