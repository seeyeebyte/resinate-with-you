import { ApplicationForm } from "@/components/ApplicationForm";
import { applyPageContent } from "@/lib/customization";

export const metadata = {
  title: "Apply to Join",
};

type ApplyPageProps = {
  searchParams: Promise<{
    submitted?: string;
    submitError?: string;
    statusUrl?: string;
  }>;
};

export default async function ApplyPage({ searchParams }: ApplyPageProps) {
  const params = await searchParams;
  const submitted = params.submitted === "1";
  const submitError = typeof params.submitError === "string" ? params.submitError.slice(0, 500) : "";
  const statusUrl = params.statusUrl === "/artist/application-status" ? params.statusUrl : "";

  return (
    <section className="pastel-wash px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="max-w-3xl">
          <p className="eyebrow">{applyPageContent.eyebrow}</p>
          <h1 className="display-heading mt-3 text-4xl leading-[1.02] sm:text-5xl">{applyPageContent.title}</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted)] sm:text-lg">
            {applyPageContent.body}
          </p>
          <p className="mt-4 text-sm font-semibold text-[#566c71]">{applyPageContent.reviewNote}</p>
        </div>

        <div className="mt-8">
          <ApplicationForm
            initialSubmitted={submitted}
            initialError={submitError}
            initialStatusUrl={statusUrl}
          />
        </div>
      </div>
    </section>
  );
}
