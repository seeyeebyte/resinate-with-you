import { Suspense } from "react";
import { ArtistSetPasswordForm } from "@/components/ArtistSetPasswordForm";

export const metadata = {
  title: "Set Artist Password",
};

export default function ArtistSetPasswordPage() {
  return (
    <section className="section pastel-wash">
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-center">
        <Suspense fallback={<div className="soft-card rounded-[10px] p-6">Loading password setup...</div>}>
          <ArtistSetPasswordForm />
        </Suspense>
        <div className="flat-panel rounded-[10px] p-6">
          <p className="eyebrow">Secure Access</p>
          <h2 className="display-heading mt-3 text-3xl">One link, one approved artist email.</h2>
          <p className="mt-4 leading-7 text-[#626960]">
            Password setup and password recovery both start from the artist email connected to an approved application.
          </p>
        </div>
      </div>
    </section>
  );
}
