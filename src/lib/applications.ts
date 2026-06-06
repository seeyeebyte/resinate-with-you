import { categories } from "@/lib/site";
import type { ApplicationInsert, ApplicationRecord, ApplicationStatus, ArtistType } from "@/lib/supabase";

export const reviewStatuses: ApplicationStatus[] = ["approved", "needs_info", "rejected"];
export const artistTypes: ArtistType[] = ["individual", "offline_studio"];
export const artistTypeLabels: Record<ArtistType, string> = {
  individual: "Individual",
  offline_studio: "Offline studio",
};
export const requiredSampleImageCount = 3;
export const maxBioLength = 500;
export const instagramUsernamePattern = "^@?[A-Za-z0-9._]{1,30}$";
export const applicationPhotoMaxSize = 5 * 1024 * 1024;
export const allowedApplicationPhotoTypes = ["image/jpeg", "image/png", "image/webp"];
const allowedApplicationPhotoExtensions = [".jpg", ".jpeg", ".png", ".webp"];

export function isAllowedApplicationPhoto(file: { name: string; type: string }) {
  const normalizedType = file.type.toLowerCase();

  if (allowedApplicationPhotoTypes.includes(normalizedType) || normalizedType === "image/jpg") {
    return true;
  }

  const normalizedName = file.name.toLowerCase();
  return !normalizedType && allowedApplicationPhotoExtensions.some((extension) => normalizedName.endsWith(extension));
}

export function applicationPhotoContentType(file: { name: string; type: string }) {
  const normalizedType = file.type.toLowerCase();

  if (normalizedType === "image/jpg") {
    return "image/jpeg";
  }

  if (allowedApplicationPhotoTypes.includes(normalizedType)) {
    return normalizedType;
  }

  const normalizedName = file.name.toLowerCase();

  if (normalizedName.endsWith(".png")) {
    return "image/png";
  }

  if (normalizedName.endsWith(".webp")) {
    return "image/webp";
  }

  return "image/jpeg";
}

export const statusLabels: Record<ApplicationStatus, string> = {
  submitted: "Submitted",
  reviewing: "In review",
  needs_info: "More information needed",
  approved: "Approved",
  rejected: "Not approved",
};

export type ApplicationPayload = {
  brand_name: string;
  contact_name: string;
  email: string;
  country?: string;
  city?: string;
  artist_type?: string;
  studio_address?: string;
  instagram_url?: string;
  website_url?: string;
  contact_link_label?: string;
  shop_url?: string;
  categories: string[];
  sample_image_urls?: string[];
  other_category?: string;
  accepts_custom: boolean;
  ships_international: boolean;
  price_range?: string;
  bio?: string;
  authorization_accepted: boolean;
};

export function normalizeApplicationPayload(input: ApplicationPayload): ApplicationInsert {
  const selectedCategories = Array.isArray(input.categories) ? input.categories : [];
  const otherCategory = normalizeOptionalString(input.other_category);
  const normalizedCategories = selectedCategories
    .filter((category) => category !== "Other" && categories.includes(category))
    .concat(otherCategory ? [otherCategory] : []);

  return {
    brand_name: normalizeRequiredString(input.brand_name),
    contact_name: normalizeRequiredString(input.contact_name),
    email: normalizeRequiredString(input.email).toLowerCase(),
    country: normalizeOptionalString(input.country),
    city: normalizeOptionalString(input.city),
    artist_type: normalizeArtistType(input.artist_type),
    studio_address: normalizeOptionalString(input.studio_address),
    instagram_url: normalizeInstagramInput(input.instagram_url),
    website_url: normalizeOptionalString(input.website_url),
    contact_link_label: normalizeOptionalString(input.contact_link_label),
    shop_url: normalizeOptionalString(input.shop_url),
    categories: Array.from(new Set(normalizedCategories)),
    sample_image_urls: Array.isArray(input.sample_image_urls) ? input.sample_image_urls : [],
    accepts_custom: Boolean(input.accepts_custom),
    ships_international: Boolean(input.ships_international),
    price_range: normalizeOptionalString(input.price_range),
    bio: normalizeOptionalString(input.bio),
    authorization_accepted: Boolean(input.authorization_accepted),
    status: "submitted",
  };
}

export function validateApplication(application: ApplicationInsert) {
  if (!application.brand_name) {
    return "Brand name is required.";
  }

  if (!application.contact_name) {
    return "Contact name is required.";
  }

  if (!isValidEmail(application.email)) {
    return "A valid email is required.";
  }

  if (application.instagram_url && !isInstagramUrl(application.instagram_url)) {
    return "Instagram username must be valid.";
  }

  if (application.website_url && !isHttpUrl(application.website_url)) {
    return "Website URL must be a valid URL.";
  }

  if (application.categories.length === 0) {
    return "Choose at least one product category or add an other category.";
  }

  if (application.sample_image_urls.length !== requiredSampleImageCount) {
    return "Please upload 3 different product photos.";
  }

  if (application.bio && application.bio.length > maxBioLength) {
    return `Short bio must be ${maxBioLength} characters or less.`;
  }

  if (!application.authorization_accepted) {
    return "Please accept the display authorization before submitting.";
  }

  return null;
}

export function createArtistSlug(application: Pick<ApplicationRecord, "brand_name" | "id">) {
  const base = application.brand_name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

  return `${base || "artist"}-${application.id.slice(0, 8)}`;
}

export function normalizeArtistType(value: unknown): ArtistType {
  const normalized = String(value || "").trim();
  return artistTypes.includes(normalized as ArtistType) ? (normalized as ArtistType) : "individual";
}

function normalizeRequiredString(value: unknown) {
  return String(value || "").trim();
}

function normalizeOptionalString(value: unknown) {
  const text = String(value || "").trim();
  return text.length > 0 ? text : null;
}

export function isInstagramUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && ["instagram.com", "www.instagram.com"].includes(url.hostname.toLowerCase()) && url.pathname.length > 1;
  } catch {
    return false;
  }
}

export function normalizeInstagramInput(value: unknown) {
  const text = normalizeOptionalString(value);

  if (!text) {
    return null;
  }

  const username = instagramUsernameFromInput(text);
  return username ? `https://www.instagram.com/${username}` : text;
}

export function instagramUsernameFromInput(value: unknown) {
  const text = String(value || "").trim();

  if (!text) {
    return "";
  }

  const maybeUrl = text.startsWith("http://") || text.startsWith("https://") ? instagramUsernameFromUrl(text) : "";
  const username = maybeUrl || text.replace(/^@+/, "").trim();

  return isInstagramUsername(username) ? username : "";
}

export function instagramUsernameFromUrl(value: string) {
  try {
    const url = new URL(value);

    if (!["instagram.com", "www.instagram.com"].includes(url.hostname.toLowerCase())) {
      return "";
    }

    const username = url.pathname.split("/").filter(Boolean)[0] || "";
    return isInstagramUsername(username) ? username : "";
  } catch {
    return "";
  }
}

export function isInstagramUsername(value: string) {
  return /^[A-Za-z0-9._]{1,30}$/.test(value.trim());
}

export function isValidEmail(value: string) {
  const normalizedValue = value.trim();

  if (normalizedValue.length > 254) {
    return false;
  }

  return /^[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?(?:\.[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?)+$/i.test(
    normalizedValue,
  );
}

export function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}
