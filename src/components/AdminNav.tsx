import Link from "next/link";

export function AdminNav({ token, active }: { token: string; active: "applications" | "products" | "featured" }) {
  const links = [
    { key: "applications", label: "Applications", href: "/admin/applications" },
    { key: "products", label: "Products", href: "/admin/products" },
    { key: "featured", label: "Featured Finds", href: "/admin/featured-products" },
  ] as const;

  return (
    <nav className="mb-5 flex flex-wrap gap-2" aria-label="Admin sections">
      {links.map((link) => {
        const params = new URLSearchParams();

        if (token) {
          params.set("token", token);
        }

        return (
          <Link
            key={link.key}
            href={`${link.href}${params.toString() ? `?${params.toString()}` : ""}`}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
              active === link.key
                ? "border-[#2d3842] bg-[#2d3842] text-white"
                : "border-[#d9ddd2] bg-white/70 text-[#626960] hover:border-[#9ba69d] hover:text-[#2d3842]"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
