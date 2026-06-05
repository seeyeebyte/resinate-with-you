import Link from "next/link";
import { footerContent, navigationContent } from "@/lib/customization";
import { siteConfig } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--line)] bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-[var(--muted)] sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <Link href="/" className="font-medium text-[var(--ink)] hover:text-[color-mix(in_srgb,var(--ink)_78%,var(--muted))]" aria-label={`${siteConfig.name} home`}>
            {siteConfig.name}
          </Link>
          <div className="flex gap-4">
            {navigationContent.footer.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-[var(--ink)]">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <p>{footerContent.note}</p>
      </div>
    </footer>
  );
}
