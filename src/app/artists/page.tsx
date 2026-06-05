import { DirectoryFilters } from "@/components/DirectoryFilters";
import { getPublicArtists } from "@/lib/public-directory";

export const metadata = {
  title: "Artist Directory",
};

export const dynamic = "force-dynamic";

export default async function ArtistsPage() {
  const artists = await getPublicArtists();

  return (
    <section className="section pastel-wash">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Artist Directory</p>
          <h1>Find independent resin artists by style, place, and custom availability.</h1>
        </div>
        <p>Browse approved artist profiles from the live directory.</p>
      </div>
      <DirectoryFilters artists={artists} />
    </section>
  );
}
