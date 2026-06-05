import { PuzzleBlock } from "@/components/PuzzleBlock";
import { aboutPageContent, themeConfig } from "@/lib/customization";

export const metadata = {
  title: "About",
};

export default function AboutPage() {
  return (
    <section className="section pastel-wash">
      <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
        <div>
          <p className="eyebrow">{aboutPageContent.eyebrow}</p>
          <h1 className="display-heading mt-4 text-5xl leading-tight">{aboutPageContent.title}</h1>
          <div className="mt-8 flex items-center gap-3 rounded-[12px] border border-[var(--line)] bg-white/70 p-4 text-sm leading-6 text-[var(--muted)]">
            <PuzzleBlock className="h-10 w-10 shrink-0" tone={themeConfig.colors.blueSoft} variant="right" />
            <p>{aboutPageContent.referralNote}</p>
          </div>
          <div className="mt-4 rounded-[12px] border border-[var(--line)] bg-white/70 p-5">
            <div className="flex items-start gap-3">
              <PuzzleBlock className="h-9 w-9 shrink-0" tone={themeConfig.colors.blueSoft} variant="right" />
              <div>
                <h2 className="text-base font-semibold text-[var(--ink)]">{aboutPageContent.platformCard.title}</h2>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  {aboutPageContent.platformCard.body}
                </p>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <IconLink
                href="https://www.instagram.com/resinatewithyou/"
                label="Resinate With You Instagram"
                icon="instagram"
              />
              <IconLink href="mailto:support@resinatewithyou.com" label="Email Resinate With You support" icon="email" />
            </div>
          </div>
          <div className="mt-4 rounded-[12px] border border-[var(--line)] bg-white/70 p-5">
            <div className="flex items-start gap-3">
              <PuzzleBlock className="h-9 w-9 shrink-0" tone={themeConfig.colors.lavenderSoft} variant="top" />
              <div>
                <h2 className="text-base font-semibold text-[var(--ink)]">{aboutPageContent.creatorCard.title}</h2>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  {aboutPageContent.creatorCard.body}
                </p>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <IconLink
                href="https://www.instagram.com/marginmold/"
                label="Margin Mold Instagram"
                icon="instagram"
              />
              <IconLink href="https://marginmold.com/" label="Margin Mold website" icon="website" />
              <IconLink href="mailto:marrrrrgin@gmail.com" label="Email Margin Mold" icon="email" />
            </div>
          </div>
        </div>

        <article className="soft-card rounded-[12px] p-6 sm:p-8">
          <div className="space-y-6 text-base leading-8 text-[var(--muted)]">
            {aboutPageContent.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <p className="mt-8 border-t border-[#d9ddd2] pt-4 text-xs leading-5 text-[#7a827a]">
            Location data from Countries States Cities Database, licensed under ODbL v1.0.
          </p>
        </article>
      </div>
    </section>
  );
}

function IconLink({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: "instagram" | "website" | "email";
}) {
  const isExternal = href.startsWith("http");

  return (
    <a
      href={href}
      aria-label={label}
      title={label}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noreferrer" : undefined}
      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--line)] bg-white text-[var(--ink)] shadow-sm transition hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--line)_55%,var(--ink))] hover:bg-[var(--paper-warm)]"
    >
      <ContactIcon icon={icon} />
    </a>
  );
}

function ContactIcon({ icon }: { icon: "instagram" | "website" | "email" }) {
  if (icon === "instagram") {
    return (
      <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
        <rect height="16" rx="5" stroke="currentColor" strokeWidth="1.8" width="16" x="4" y="4" />
        <circle cx="12" cy="12" r="3.25" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="16.8" cy="7.2" fill="currentColor" r="1" />
      </svg>
    );
  }

  if (icon === "website") {
    return (
      <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
        <path d="M4.5 12h15M12 4.5c2 2.1 3 4.6 3 7.5s-1 5.4-3 7.5c-2-2.1-3-4.6-3-7.5s1-5.4 3-7.5Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <rect height="14" rx="3" stroke="currentColor" strokeWidth="1.8" width="18" x="3" y="5" />
      <path d="m4.5 7 7.5 6 7.5-6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}
