// Quick customization entrypoint.
// Edit this file first when you want to change site wording, homepage sections,
// navigation labels, theme colors, or puzzle accent colors.

export const themeConfig = {
  colors: {
    background: "#fbfbf8",
    foreground: "#2d3842",
    ink: "#2d3842",
    muted: "#6d736d",
    line: "#d9ddd2",
    paper: "#ffffff",
    paperWarm: "#f5fbff",
    blue: "#bfe8f7",
    blueSoft: "#cdebfa",
    lavender: "#e5d7f7",
    lavenderSoft: "#e8ddfa",
    sage: "#cfd2ca",
    mint: "#dff9d9",
    mintSoft: "#e2fadf",
    clay: "#b68b73",
  },
  puzzle: {
    cloverLogoTones: ["#cdebfa", "#e8ddfa", "#d1d1d1", "#e2fadf"],
    artistWallTones: ["#cdebfa", "#e8ddfa", "#e2fadf", "#cfd2ca"],
    productBadgeTones: ["#cdebfa", "#e8ddfa", "#e2fadf", "#d1d1d1"],
    artistCardTones: ["#cdebfa", "#e8ddfa", "#e2fadf", "#d1d1d1"],
    chipTones: ["#dff9d9", "#e5d7f7", "#bfe8f7"],
  },
} as const;

export const productStyleTagOptions = [
  "Elegant",
  "Cool",
  "Retro",
  "Angelcore",
  "Polkadots",
  "Clover",
  "Kawaii",
  "Pastel",
  "Glitter",
  "Floral",
  "Ocean",
  "Botanical",
  "Minimal",
  "Dreamy",
  "Fairycore",
  "Gothic",
  "Y2K",
  "Coquette",
  "Pearl",
  "Gold Flake",
  "Transparent",
  "Colorful",
] as const;

export const maxProductStyleTags = 24;

export const siteIdentity = {
  name: "Resinate With You",
  tagline: "Discover resin artists. Create pieces together.",
  description:
    "Discover handmade resin artists, find pieces that feel personal, and co-create custom work through each artist's own shop or contact link.",
} as const;

export const navigationContent = {
  primary: [
    { label: "Finds", href: "/#finds" },
    { label: "Products", href: "/products" },
    { label: "Artists", href: "/artists" },
    { label: "About", href: "/about" },
    { label: "Apply", href: "/apply" },
  ],
  footer: [
    { label: "Artists", href: "/artists" },
    { label: "About", href: "/about" },
    { label: "Apply", href: "/apply" },
    { label: "Application Status", href: "/artist/application-status" },
  ],
} as const;

export const headerContent = {
  loginLabel: "Artist Login",
  primaryCtaLabel: "Join as Artist",
} as const;

export const footerContent = {
  note: "Discovery and traffic referral only. Purchases and custom requests happen through each artist's own contact or shop link.",
} as const;

export const homepageContent = {
  sections: {
    hero: true,
    featuredFinds: true,
    directoryPreview: true,
    processCards: true,
    applyBand: true,
  },
  hero: {
    eyebrow: "Handmade resin directory",
    title: "Find the resin piece that fits.",
    body: "A soft directory for independent resin artists, personal keepsakes, and custom pieces made outside the usual marketplace rush.",
    primaryCta: { label: "Find a Piece", href: "#finds" },
    secondaryCta: { label: "Explore Artists", href: "/artists" },
    showShowcase: true,
  },
  featuredFinds: {
    id: "finds",
    eyebrow: "Favorite Finds This Week",
    title: "Tiny resin pieces, chosen with care.",
    body: "See something you like? Go straight to the artist's shop, Instagram, or contact page to ask, buy, or commission.",
  },
  directoryPreview: {
    eyebrow: "The Directory",
    title: "Search the pieces of a scattered resin world.",
    body: "Filter by style, location, and custom availability. The same artist collection is available on the full directory page.",
    cta: { label: "Open artist directory", href: "/artists" },
  },
  processCards: [
    {
      title: "Discover",
      body: "Browse selected handmade resin products and independent creators in one calm place.",
      tone: themeConfig.colors.blue,
      puzzleVariant: "top",
    },
    {
      title: "Visit Artist Shop",
      body: "Open the artist's Shopify, Etsy, Instagram, or website from the product or artist page.",
      tone: themeConfig.colors.lavender,
      puzzleVariant: "right",
    },
    {
      title: "Create Together",
      body: "Complete purchases, custom requests, and conversations with the artist outside the platform.",
      tone: themeConfig.colors.mint,
      puzzleVariant: "bottom",
    },
  ],
  applyBand: {
    eyebrow: "Join our creative community",
    title: "Apply to showcase your work.",
    stampLines: ["Join our", "creative", "community"],
    body: "Get your work in front of people who love resin art. Share your pieces, connect with art lovers, and grow your creative journey.",
    cta: { label: "Apply now", href: "/apply" },
  },
} as const;

export const aboutPageContent = {
  eyebrow: "About",
  title: "What This Site Is For",
  referralNote: "Discovery and traffic referral only. Purchases happen directly with each artist.",
  platformCard: {
    title: "Resinate With You",
    body: "Follow the platform or contact us for support.",
  },
  creatorCard: {
    title: "Created by Margin Mold",
    body: "Resinate With You is created and maintained by Margin Mold.",
  },
  paragraphs: [
    "This site was created to help more people discover resin artists, and to help independent creators be seen, recognized, and supported as they grow.",
    "We are not a direct seller, and we do not manage transactions. Instead, we gather and present works from different independent creators, making it easier for visitors to browse styles, learn about artists, and find official ways to follow or contact them.",
    "Resin art is highly personal. Some artists focus on delicate accessories, some on fantasy-inspired pieces, some on character goods, charms, trays, decor, or experimental materials. This site brings those different creative directions together, so visitors can explore the variety of resin work beyond a single shop or platform.",
    "For artists, we hope this space can become more than a listing. It is a way to build visibility, share a clearer creative identity, and reach people who are genuinely interested in their work. As the site grows, we also hope to create more opportunities for selected active artists through features, recommendations, feedback sharing, and future cooperation.",
    "If you are interested in a piece or an artist, please follow the links provided on the artist's profile and contact the artist directly. Availability, pricing, shipping, commissions, and custom requests are decided by each creator.",
    "Our role is simple: to make good resin work easier to find, to help artists be seen, and to support a healthier, more connected resin art community.",
  ],
} as const;

export const applyPageContent = {
  eyebrow: "Join the directory",
  title: "Apply as an artist.",
  body: "Share your work for review. Approved artists can manage their profile and publish products.",
  reviewNote: "Reviewed before publishing · Up to 15 products",
} as const;
