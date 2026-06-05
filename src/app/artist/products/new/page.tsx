import Link from "next/link";
import { ArtistProductForm } from "@/components/ArtistProductForm";

export const metadata = {
  title: "Publish Product",
};

export default function NewArtistProductPage() {
  return (
    <section className="section pastel-wash">
      <div className="grid gap-8 lg:grid-cols-[0.7fr_1fr] lg:items-start">
        <aside className="soft-card rounded-[10px] p-6 sm:p-8">
          <p className="eyebrow">Product Publishing</p>
          <h1 className="display-heading mt-4 text-4xl leading-tight">Add a resin piece.</h1>
          <p className="mt-4 leading-7 text-[#626960]">
            Products from approved artists publish directly. Use clear photos, USD pricing, and the link customers should use to contact or buy from you.
          </p>
          <div className="mt-6 grid gap-3 text-sm leading-6 text-[#626960]">
            <p>Upload 1 to 5 product photos.</p>
            <p>Each photo can be JPG, PNG, or WebP up to 2 MB.</p>
            <p>New products appear publicly after saving.</p>
          </div>
          <Link href="/artist/dashboard" className="quiet-link mt-7 inline-block">
            Back to dashboard
          </Link>
        </aside>

        <ArtistProductForm />
      </div>
    </section>
  );
}
