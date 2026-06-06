import Link from "next/link";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import { PlatformLinks } from "@/components/PlatformLinks";
import { ProductCard } from "@/components/ProductCard";
import { artists } from "@/lib/mock-data";
import { getPublicArtistBySlug, getPublicProductsByArtistSlug } from "@/lib/public-directory";

export function generateStaticParams() {
  return artists.map((artist) => ({ slug: artist.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const artist = await getPublicArtistBySlug(slug);
  return {
    title: artist ? artist.brandName : "Artist",
  };
}

export const dynamic = "force-dynamic";

export default async function ArtistDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const artist = await getPublicArtistBySlug(slug);

  if (!artist) {
    notFound();
  }

  const artistProducts = await getPublicProductsByArtistSlug(artist.slug);

  return (
    <section className="section pastel-wash">
      <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <aside className="soft-card rounded-[12px] p-6">
          {artist.avatarUrl ? (
            <div className="h-24 w-24 overflow-hidden rounded-[28px] border border-[#d9ddd2] bg-[#f5fbff]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={artist.avatarUrl} alt={`${artist.brandName} avatar`} className="h-full w-full object-cover" />
            </div>
          ) : (
            <div className={`h-24 w-24 rounded-[28px] bg-gradient-to-br ${artist.avatarTone} puzzle-corner`} />
          )}
          <p className="eyebrow mt-8">Artist Profile</p>
          <h1 className="display-heading mt-3 text-4xl leading-tight">{artist.brandName}</h1>
          <p className="mt-3 text-[#6d736d]">
            {artist.city}, {artist.country}
          </p>
          <p className="mt-6 leading-7 text-[#626960]">{artist.bio}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {artist.categories.map((category) => (
              <span key={category} className="pastel-chip px-3 py-1 text-xs font-semibold">
                {category}
              </span>
            ))}
            {artist.acceptsCustom ? (
              <span className="pastel-chip px-3 py-1 text-xs font-semibold" style={{ "--chip-bg": "#e5d7f7" } as CSSProperties}>
                Custom orders
              </span>
            ) : null}
          </div>
          <div className="mt-8 grid gap-3">
            {artist.shopUrl ? (
              <a className="studio-button studio-button-primary" href={artist.shopUrl} target="_blank" rel="noreferrer">
                Visit shop
              </a>
            ) : null}
            {artist.websiteUrl ? (
              <a className="studio-button studio-button-secondary" href={artist.websiteUrl} target="_blank" rel="noreferrer">
                Website
              </a>
            ) : null}
            <PlatformLinks links={artist.platformLinks} />
          </div>
        </aside>
        <div>
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Approved Products</p>
              <h2 className="display-heading mt-2 text-3xl">Pieces from this artist</h2>
            </div>
            <Link href="/artists" className="quiet-link">
              Back to directory
            </Link>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {artistProducts.map((product) => (
              <ProductCard key={product.id} artist={artist} product={product} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
