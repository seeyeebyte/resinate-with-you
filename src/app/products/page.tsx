import { ProductDirectory } from "@/components/ProductDirectory";
import { getPublicArtists, getPublicProducts } from "@/lib/public-directory";

export const metadata = {
  title: "Products",
};

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const [artists, approvedProducts] = await Promise.all([getPublicArtists(), getPublicProducts()]);

  return (
    <section className="section bg-white">
      <div>
        <div className="section-heading">
          <div>
            <p className="eyebrow">Product Directory</p>
            <h1>Browse resin pieces across artists.</h1>
          </div>
          <p>
            Filter by artist, product category, location, custom availability, worldwide shipping, price range, and style.
          </p>
        </div>
        <ProductDirectory artists={artists} products={approvedProducts} />
      </div>
    </section>
  );
}
