import Link from "next/link";
import { HeaderActions } from "@/components/HeaderActions";
import { HeaderBrandLink } from "@/components/HeaderBrandLink";
import { siteConfig } from "@/lib/site";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-[color-mix(in_srgb,var(--line)_70%,transparent)] bg-white/72 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <HeaderBrandLink />
        <nav className="hidden items-center gap-6 text-sm font-medium text-[var(--muted)] md:flex">
          {siteConfig.nav.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-[var(--ink)]">
              {item.label}
            </Link>
          ))}
        </nav>
        <HeaderActions />
      </div>
    </header>
  );
}
