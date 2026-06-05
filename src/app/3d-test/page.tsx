import Link from "next/link";
import { ResinModelShowcase } from "@/components/ResinModelShowcase";

export default function ThreeDTestPage() {
  return (
    <main className="bg-[#fbfbf8]">
      <section className="mx-auto grid min-h-[calc(100vh-76px)] max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[0.78fr_1.22fr] lg:px-8">
        <div>
          <p className="eyebrow">3D test page</p>
          <h1 className="display-heading mt-5 max-w-3xl text-5xl leading-[1.02] sm:text-6xl">
            Love puzzle material preview.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-[#626960]">
            This is a protected test area for the homepage visual block. The model uses a slow resin-like material shift and follows pointer movement without changing the live homepage.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link className="studio-button studio-button-primary" href="/">
              Back home
            </Link>
            <a className="studio-button studio-button-secondary" href="/models/lovepuzzle.glb">
              Open model
            </a>
          </div>
        </div>
        <ResinModelShowcase />
      </section>
    </main>
  );
}
