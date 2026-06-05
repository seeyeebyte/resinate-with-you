import { ApplicationStatusLookup } from "@/components/ApplicationStatusLookup";

export const metadata = {
  title: "Application Status",
};

export default function ApplicationStatusPage() {
  return (
    <section className="section pastel-wash">
      <div className="max-w-3xl">
        <p className="eyebrow">Application Status</p>
        <h1 className="display-heading mt-4 text-5xl leading-tight">Check your artist application.</h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-[#626960]">
          Enter the email address you used when applying. We will show the latest review status we have for your application.
        </p>
        <div className="mt-8">
          <ApplicationStatusLookup />
        </div>
      </div>
    </section>
  );
}
