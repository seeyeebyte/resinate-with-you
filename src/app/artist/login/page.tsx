import { ArtistLoginForm } from "@/components/ArtistLoginForm";

export const metadata = {
  title: "Artist Login",
};

export default function ArtistLoginPage() {
  return (
    <section className="section pastel-wash">
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-center">
        <ArtistLoginForm />
        <div className="flat-panel rounded-[10px] p-6">
          <p className="eyebrow">Artist Tools</p>
          <h2 className="display-heading mt-3 text-3xl">Publish pieces after approval.</h2>
          <p className="mt-4 leading-7 text-[#626960]">
            Approved artists can sign in, open the dashboard, and add products that publish directly to the directory.
          </p>
        </div>
      </div>
    </section>
  );
}
