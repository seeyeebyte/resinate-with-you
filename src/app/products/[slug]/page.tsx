import Link from "next/link";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import { ProductImageGallery } from "@/components/ProductImageGallery";
import { getArtistForProduct, products } from "@/lib/mock-data";
import { formatDisplayPrice } from "@/lib/price";
import { getPublicArtistBySlug, getPublicProductBySlug } from "@/lib/public-directory";

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getPublicProductBySlug(slug);
  return {
    title: product ? product.title : "Product",
  };
}

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getPublicProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const artist = (product.artistSlug ? await getPublicArtistBySlug(product.artistSlug) : null) ?? getArtistForProduct(product);
  const productImages = product.images?.length
    ? product.images
    : [
        {
          imageUrl: product.imageUrl,
          imageAlt: product.imageAlt,
          sortOrder: 0,
        },
      ];

  return (
    <section className="section pastel-wash">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,640px)_minmax(24rem,1fr)] lg:items-start">
        <ProductImageGallery images={productImages} />
        <div className="soft-card rounded-[12px] p-6 sm:p-8 lg:mt-8">
          <p className="eyebrow">{product.category}</p>
          <h1 className="display-heading mt-4 text-4xl leading-tight sm:text-5xl">{product.title}</h1>
          {artist ? (
            <p className="mt-4 text-[#6d736d]">
              By{" "}
              <Link href={`/artists/${artist.slug}`} className="quiet-link">
                {artist.brandName}
              </Link>{" "}
              in {artist.city}, {artist.country}
            </p>
          ) : null}
          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#566c71]">Price</p>
            <p className="mt-2 text-2xl font-semibold text-[#2d3842]">{formatDisplayPrice(product.priceText)}</p>
          </div>
          <p className="mt-6 leading-8 text-[#626960]">{product.description}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {product.tags.map((tag, index) => (
              <span
                key={tag}
                className="pastel-chip px-3 py-1 text-xs font-semibold"
                style={{ "--chip-bg": index % 2 === 0 ? "#dff9d9" : "#e5d7f7" } as CSSProperties}
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <a className="studio-button studio-button-primary" href={product.externalUrl} target="_blank" rel="noreferrer">
              Visit external shop
            </a>
            {artist ? (
              <Link className="studio-button studio-button-secondary" href={`/artists/${artist.slug}`}>
                View artist
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
