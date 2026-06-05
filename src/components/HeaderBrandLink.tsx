import Link from "next/link";
import { PuzzleCloverLogo } from "@/components/PuzzleCloverLogo";
import { siteConfig } from "@/lib/site";

export function HeaderBrandLink() {
  return (
    <Link href="/" className="flex items-center gap-3" aria-label={`${siteConfig.name} home`}>
      <PuzzleCloverLogo className="h-10 w-10 shrink-0" />
      <span className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--ink)]">{siteConfig.name}</span>
    </Link>
  );
}
