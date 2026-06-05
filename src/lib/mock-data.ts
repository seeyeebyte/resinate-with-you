import { categories } from "./site";
import type { PlatformLink } from "@/components/PlatformLinks";

export type ProductStatus = "approved" | "pending" | "needs_changes" | "hidden";

export type ProductImage = {
  imageUrl: string;
  imageAlt: string;
  sortOrder: number;
};

export type Artist = {
  id: string;
  slug: string;
  brandName: string;
  city: string;
  country: string;
  bio: string;
  categories: string[];
  acceptsCustom: boolean;
  shipsInternational: boolean;
  instagramUrl: string;
  websiteUrl: string;
  shopUrl: string;
  contactEmail?: string;
  platformLinks?: PlatformLink[];
  avatarUrl?: string;
  avatarTone: string;
};

export type Product = {
  id: string;
  slug: string;
  artistSlug: string;
  artistName?: string;
  artistCity?: string;
  artistCountry?: string;
  title: string;
  category: string;
  priceText: string;
  description: string;
  externalUrl: string;
  imageUrl: string;
  imageAlt: string;
  imagePosition: string;
  images?: ProductImage[];
  tags: string[];
  isFeatured: boolean;
  status: ProductStatus;
};

export const artists: Artist[] = [
  {
    id: "artist-luna-cast",
    slug: "luna-cast-studio",
    brandName: "Luna Cast Studio",
    city: "Los Angeles",
    country: "United States",
    bio: "Soft floral resin charms, name pieces, and small keepsakes made in gentle translucent palettes.",
    categories: ["Keychains", "Custom Gifts", "Keepsakes"],
    acceptsCustom: true,
    shipsInternational: true,
    instagramUrl: "https://www.instagram.com/",
    websiteUrl: "https://example.com",
    shopUrl: "https://example.com/shop",
    avatarTone: "from-rose-200 to-amber-100",
  },
  {
    id: "artist-tide-garden",
    slug: "tide-garden-resin",
    brandName: "Tide Garden Resin",
    city: "Vancouver",
    country: "Canada",
    bio: "Ocean trays and botanical home pieces with layered waves, shells, and pressed garden details.",
    categories: ["Home Decos", "Art Objects"],
    acceptsCustom: false,
    shipsInternational: true,
    instagramUrl: "https://www.instagram.com/",
    websiteUrl: "https://example.com",
    shopUrl: "https://example.com/shop",
    avatarTone: "from-cyan-100 to-emerald-100",
  },
  {
    id: "artist-mica-bloom",
    slug: "mica-bloom",
    brandName: "Mica Bloom",
    city: "London",
    country: "United Kingdom",
    bio: "Pressed flower jewelry and petite gift pieces with shimmer, gold flakes, and vintage color notes.",
    categories: ["Accessories", "Keepsakes"],
    acceptsCustom: true,
    shipsInternational: true,
    instagramUrl: "https://www.instagram.com/",
    websiteUrl: "https://example.com",
    shopUrl: "https://example.com/shop",
    avatarTone: "from-violet-100 to-pink-100",
  },
  {
    id: "artist-clear-days",
    slug: "clear-days-atelier",
    brandName: "Clear Days Atelier",
    city: "Melbourne",
    country: "Australia",
    bio: "Minimal resin objects for desks, vanities, and shelves, made with clean shapes and quiet color.",
    categories: ["Home Decos", "Art Objects"],
    acceptsCustom: false,
    shipsInternational: false,
    instagramUrl: "https://www.instagram.com/",
    websiteUrl: "https://example.com",
    shopUrl: "https://example.com/shop",
    avatarTone: "from-slate-100 to-stone-100",
  },
  {
    id: "artist-petal-key",
    slug: "petal-key-co",
    brandName: "Petal Key Co.",
    city: "Seattle",
    country: "United States",
    bio: "Bright custom keychains, initials, bag charms, and school gifts with playful but polished details.",
    categories: ["Keychains", "Custom Gifts"],
    acceptsCustom: true,
    shipsInternational: false,
    instagramUrl: "https://www.instagram.com/",
    websiteUrl: "https://example.com",
    shopUrl: "https://example.com/shop",
    avatarTone: "from-yellow-100 to-sky-100",
  },
  {
    id: "artist-small-moon",
    slug: "small-moon-objects",
    brandName: "Small Moon Objects",
    city: "Tokyo",
    country: "Japan",
    bio: "Small sculptural resin objects and jewelry pieces inspired by moon phases, mineral colors, and tiny rituals.",
    categories: ["Accessories", "Art Objects"],
    acceptsCustom: true,
    shipsInternational: true,
    instagramUrl: "https://www.instagram.com/",
    websiteUrl: "https://example.com",
    shopUrl: "https://example.com/shop",
    avatarTone: "from-indigo-100 to-lime-100",
  },
  {
    id: "artist-haru-gloss-lab",
    slug: "haru-gloss-lab",
    brandName: "Haru Gloss Lab",
    city: "Seoul",
    country: "South Korea",
    bio: "Playful resin photocard cases, phone griptoks, tiny containers, and character-inspired charms in glossy candy colors.",
    categories: ["Photocard Cases", "Phone Griptoks", "Containers", "Accessories"],
    acceptsCustom: true,
    shipsInternational: true,
    instagramUrl: "",
    websiteUrl: "",
    shopUrl: "https://www.etsy.com/",
    platformLinks: [
      { platform: "wechat", value: "harugloss" },
      { platform: "xiaohongshu", value: "Haru Gloss Lab", href: "https://www.xiaohongshu.com/" },
      { platform: "line", value: "@harugloss", href: "https://line.me/" },
      { platform: "shopee", value: "haruglosslab", href: "https://shopee.com/" },
      { platform: "naver", value: "haruglosslab", href: "https://smartstore.naver.com/" },
      { platform: "kakaotalk", value: "harugloss", href: "https://pf.kakao.com/" },
      { platform: "etsy", value: "Haru Gloss Lab", href: "https://www.etsy.com/" },
    ],
    avatarTone: "from-pink-100 to-sky-100",
  },
];

export const products: Product[] = [
  {
    id: "product-initial-charm",
    slug: "pressed-flower-initial-charm",
    artistSlug: "luna-cast-studio",
    title: "Pressed Flower Initial Charm",
    category: "Keychains",
    priceText: "$18 - $26",
    description:
      "A translucent initial charm with pressed petals, tiny gold details, and color options for custom gifts.",
    externalUrl: "https://example.com/shop/pressed-flower-initial-charm",
    imageUrl: "/assets/resin-collection.png",
    imageAlt: "Pressed flower resin keychain",
    imagePosition: "30% 48%",
    tags: ["Handmade", "Custom"],
    isFeatured: true,
    status: "approved",
  },
  {
    id: "product-ocean-tray",
    slug: "ocean-edge-resin-tray",
    artistSlug: "tide-garden-resin",
    title: "Ocean Edge Resin Tray",
    category: "Home Decos",
    priceText: "$42",
    description:
      "A small ocean-inspired tray with layered wave texture and a glossy finish for keys, jewelry, or display.",
    externalUrl: "https://example.com/shop/ocean-edge-resin-tray",
    imageUrl: "/assets/resin-collection.png",
    imageAlt: "Ocean resin tray",
    imagePosition: "80% 46%",
    tags: ["Gift Ready", "Best Seller"],
    isFeatured: true,
    status: "approved",
  },
  {
    id: "product-botanical-pendant",
    slug: "botanical-round-pendant",
    artistSlug: "mica-bloom",
    title: "Botanical Round Pendant",
    category: "Accessories",
    priceText: "$24",
    description:
      "A round pendant with preserved flowers suspended in clear resin and a soft shimmer finish.",
    externalUrl: "https://example.com/shop/botanical-round-pendant",
    imageUrl: "/assets/resin-collection.png",
    imageAlt: "Pressed flower pendant",
    imagePosition: "52% 53%",
    tags: ["Floral", "Custom"],
    isFeatured: true,
    status: "approved",
  },
  {
    id: "product-coaster-set",
    slug: "pressed-flower-coaster-set",
    artistSlug: "clear-days-atelier",
    title: "Pressed Flower Coaster Set",
    category: "Home Decos",
    priceText: "$36",
    description:
      "A set of glossy floral coasters made for everyday use, with fine gold flake details.",
    externalUrl: "https://example.com/shop/pressed-flower-coaster-set",
    imageUrl: "/assets/resin-collection.png",
    imageAlt: "Floral resin coasters",
    imagePosition: "58% 38%",
    tags: ["Set of 4", "Gold Flake"],
    isFeatured: true,
    status: "approved",
  },
  {
    id: "product-name-charm",
    slug: "personal-name-charm",
    artistSlug: "petal-key-co",
    title: "Personal Name Charm",
    category: "Custom Gifts",
    priceText: "$22 - $32",
    description:
      "A custom name charm for bags, keys, or gifting, made with color and flake options.",
    externalUrl: "https://example.com/shop/personal-name-charm",
    imageUrl: "/assets/resin-collection.png",
    imageAlt: "Custom resin name charm",
    imagePosition: "42% 70%",
    tags: ["Name", "Color Choice"],
    isFeatured: true,
    status: "approved",
  },
  {
    id: "product-memory-piece",
    slug: "mini-floral-memory-piece",
    artistSlug: "small-moon-objects",
    title: "Mini Floral Memory Piece",
    category: "Keepsakes",
    priceText: "$28",
    description:
      "A petite memory piece for preserving small flowers, petals, or tiny meaningful fragments.",
    externalUrl: "https://example.com/shop/mini-floral-memory-piece",
    imageUrl: "/assets/resin-collection.png",
    imageAlt: "Small floral resin keepsake",
    imagePosition: "70% 72%",
    tags: ["Memorial", "Made to Order"],
    isFeatured: true,
    status: "approved",
  },
];

export function getArtistBySlug(slug: string) {
  return artists.find((artist) => artist.slug === slug);
}

export function getProductBySlug(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function getProductsByArtist(artistSlug: string) {
  return products.filter((product) => product.artistSlug === artistSlug && product.status === "approved");
}

export function getArtistForProduct(product: Product) {
  return artists.find((artist) => artist.slug === product.artistSlug);
}

export const categoryOptions = ["All", ...categories];
