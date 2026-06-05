import Link from "next/link";
import { DirectoryFilters } from "@/components/DirectoryFilters";
import { ProductCard } from "@/components/ProductCard";
import { PuzzleBlock } from "@/components/PuzzleBlock";
import { ResinModelShowcase } from "@/components/ResinModelShowcase";
import { homepageContent } from "@/lib/customization";
import { getHomepageFeaturedProducts } from "@/lib/featured-products";
import { getPublicArtists } from "@/lib/public-directory";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [featuredProducts, artists] = await Promise.all([getHomepageFeaturedProducts(), getPublicArtists()]);
  const { sections, hero, featuredFinds, directoryPreview, processCards, applyBand } = homepageContent;

  return (
    <>
      {sections.hero ? (
        <section className="pastel-wash relative overflow-hidden">
          <div className="mx-auto grid min-h-[calc(100vh-76px)] max-w-7xl items-center gap-14 px-4 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
            <div className="relative z-10 max-w-3xl">
              <p className="eyebrow">{hero.eyebrow}</p>
              <h1 className="display-heading mt-5 max-w-4xl text-5xl leading-[0.98] sm:text-6xl lg:text-7xl">
                {hero.title}
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)]">
                {hero.body}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link className="studio-button studio-button-primary" href={hero.primaryCta.href}>
                  {hero.primaryCta.label}
                </Link>
                <Link className="quiet-link text-center sm:text-left" href={hero.secondaryCta.href}>
                  {hero.secondaryCta.label}
                </Link>
              </div>
            </div>
            {hero.showShowcase ? (
              <ResinModelShowcase
                className="z-10 min-h-[min(76vw,430px)] lg:min-h-[min(66vw,560px)]"
                framed={false}
                showCaption={false}
              />
            ) : null}
          </div>
        </section>
      ) : null}

      {sections.featuredFinds ? (
        <section id={featuredFinds.id} className="section bg-white">
          <div className="section-heading">
            <div>
              <p className="eyebrow">{featuredFinds.eyebrow}</p>
              <h2>{featuredFinds.title}</h2>
            </div>
            <p>{featuredFinds.body}</p>
          </div>
          <div className="puzzle-tile-grid">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} featured />
            ))}
          </div>
        </section>
      ) : null}

      {sections.directoryPreview ? (
        <section className="section bg-white">
          <div className="section-heading">
            <div>
              <p className="eyebrow">{directoryPreview.eyebrow}</p>
              <h2>{directoryPreview.title}</h2>
            </div>
            <p>{directoryPreview.body}</p>
          </div>
          <DirectoryFilters artists={artists} preview />
          <div className="mt-8 text-center">
            <Link className="studio-button studio-button-primary" href={directoryPreview.cta.href}>
              {directoryPreview.cta.label}
            </Link>
          </div>
        </section>
      ) : null}

      {sections.processCards ? (
        <section className="section bg-white">
          <div className="grid gap-5 lg:grid-cols-3">
            {processCards.map((card) => (
              <div key={card.title} className="soft-card rounded-[10px] p-6">
                <PuzzleBlock className="mb-5 h-12 w-12" tone={card.tone} variant={card.puzzleVariant} />
                <h3 className="display-heading text-2xl">{card.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{card.body}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {sections.applyBand ? (
        <section className="section bg-white">
          <div className="flat-panel relative grid items-center gap-8 overflow-hidden rounded-[28px] px-8 py-10 md:grid-cols-[0.85fr_0.7fr_1.25fr_0.8fr] md:px-12">
            <div className="absolute inset-0 -z-0 bg-[radial-gradient(circle_at_8%_12%,rgba(232,221,250,0.8),transparent_30%),radial-gradient(circle_at_92%_16%,rgba(226,250,223,0.78),transparent_28%),linear-gradient(90deg,rgba(255,255,255,0.78),rgba(245,251,255,0.72))]" />
            <div className="relative z-10">
              <p className="eyebrow">{applyBand.eyebrow}</p>
              <h2 className="display-heading mt-3 text-4xl leading-tight">{applyBand.title}</h2>
            </div>
            <div className="relative z-10 hidden justify-center md:flex">
              <div className="grid h-28 w-28 place-items-center rounded-full border border-dashed border-[color-mix(in_srgb,var(--blue)_78%,#ffffff)] text-center text-[0.68rem] font-bold uppercase tracking-[0.26em] text-[color-mix(in_srgb,var(--ink)_62%,var(--blue))]">
                {applyBand.stampLines.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </div>
            </div>
            <p className="relative z-10 text-lg leading-8 text-[var(--muted)]">{applyBand.body}</p>
            <div className="relative z-10 md:text-right">
              <Link className="studio-button bg-[var(--lavender)] px-8 text-[var(--ink)] hover:bg-[color-mix(in_srgb,var(--lavender)_82%,var(--ink))]" href={applyBand.cta.href}>
                {applyBand.cta.label}
                <span className="ml-4">→</span>
              </Link>
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
