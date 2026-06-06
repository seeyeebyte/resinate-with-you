import { NextResponse } from "next/server";
import { findApprovedArtistForUser } from "@/lib/artist-session";
import { isHttpUrl, isInstagramUrl, isValidEmail, normalizeArtistType, normalizeInstagramInput } from "@/lib/applications";
import { artistAvatarBucket, getSupabaseServiceClient } from "@/lib/supabase";

const maxAvatarSize = 2 * 1024 * 1024;
const allowedAvatarTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function GET(request: Request) {
  const session = await getArtistSession(request);

  if ("response" in session) {
    return session.response;
  }

  const profile = await getArtistProfile(session.artist.id);

  if (!profile) {
    return NextResponse.json({ error: "Artist profile was not found." }, { status: 404 });
  }

  return NextResponse.json({ artist: profile });
}

export async function PATCH(request: Request) {
  const session = await getArtistSession(request);

  if ("response" in session) {
    return session.response;
  }

  const supabase = getSupabaseServiceClient();

  if (!supabase) {
    return NextResponse.json({ error: "Supabase service config is missing." }, { status: 503 });
  }

  const formData = await request.formData();
  const avatar = formData.get("avatar");
  const brandName = normalizeRequiredString(formData.get("brand_name"));
  const contactName = normalizeOptionalString(formData.get("contact_name"));
  const contactEmail = normalizeOptionalString(formData.get("contact_email"));
  const country = normalizeOptionalString(formData.get("country"));
  const city = normalizeOptionalString(formData.get("city"));
  const artistType = normalizeArtistType(formData.get("artist_type"));
  const studioAddress = normalizeOptionalString(formData.get("studio_address"));
  const bio = normalizeOptionalString(formData.get("bio"));
  const instagramUrl = normalizeInstagramInput(formData.get("instagram_url"));
  const websiteUrl = normalizeOptionalString(formData.get("website_url"));
  const contactLinkLabel = normalizeOptionalString(formData.get("contact_link_label"));
  const shopUrl = normalizeOptionalString(formData.get("shop_url"));
  const categories = parseList(formData.get("categories"));
  const acceptsCustom = formData.get("accepts_custom") === "on";
  const shipsInternational = formData.get("ships_international") === "on";

  if (!brandName) {
    return NextResponse.json({ error: "Brand name is required." }, { status: 400 });
  }

  if (contactEmail && !isValidEmail(contactEmail)) {
    return NextResponse.json({ error: "Public contact email must be a valid email address." }, { status: 400 });
  }

  if (instagramUrl && !isInstagramUrl(instagramUrl)) {
    return NextResponse.json({ error: "Instagram username must be valid." }, { status: 400 });
  }

  if (websiteUrl && !isHttpUrl(websiteUrl)) {
    return NextResponse.json({ error: "Website URL must be a valid URL." }, { status: 400 });
  }

  let avatarUrl: string | null = null;

  if (avatar instanceof File && avatar.size > 0) {
    if (!allowedAvatarTypes.has(avatar.type)) {
      return NextResponse.json({ error: "Avatar must be a JPG, PNG, or WebP image." }, { status: 400 });
    }

    if (avatar.size > maxAvatarSize) {
      return NextResponse.json({ error: "Avatar must be 2 MB or smaller." }, { status: 400 });
    }

    const extension = imageExtension(avatar);
    const path = `${session.artist.id}/${Date.now()}.${extension}`;
    const { error: uploadError } = await supabase.storage.from(artistAvatarBucket).upload(path, avatar, {
      contentType: avatar.type,
      upsert: false,
    });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data } = supabase.storage.from(artistAvatarBucket).getPublicUrl(path);
    avatarUrl = data.publicUrl;
  }

  const payload = {
    brand_name: brandName,
    contact_name: contactName,
    contact_email: contactEmail,
    country,
    city,
    artist_type: artistType,
    studio_address: artistType === "offline_studio" ? studioAddress : null,
    bio,
    instagram_url: instagramUrl,
    website_url: websiteUrl,
    contact_link_label: contactLinkLabel,
    shop_url: shopUrl,
    categories,
    accepts_custom: acceptsCustom,
    ships_international: shipsInternational,
    ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
    updated_at: new Date().toISOString(),
  };

  const { data: updatedArtist, error: updateError } = await supabase
    .from("artists")
    .update(payload)
    .eq("id", session.artist.id)
    .select(profileSelect)
    .single();

  if (updateError || !updatedArtist) {
    return NextResponse.json({ error: updateError?.message || "Avatar could not be saved." }, { status: 500 });
  }

  return NextResponse.json({ artist: updatedArtist });
}

const profileSelect = `
  id,
  brand_name,
  contact_name,
  contact_email,
  slug,
  avatar_url,
  bio,
  country,
  city,
  artist_type,
  studio_address,
  instagram_url,
  website_url,
  contact_link_label,
  shop_url,
  categories,
  accepts_custom,
  ships_international
`;

async function getArtistProfile(artistId: string) {
  const supabase = getSupabaseServiceClient();

  if (!supabase) {
    return null;
  }

  const { data } = await supabase.from("artists").select(profileSelect).eq("id", artistId).maybeSingle();
  return data;
}

async function getArtistSession(request: Request) {
  const supabase = getSupabaseServiceClient();

  if (!supabase) {
    return { response: NextResponse.json({ error: "Supabase service config is missing." }, { status: 503 }) };
  }

  const accessToken = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();

  if (!accessToken) {
    return { response: NextResponse.json({ error: "Please sign in first." }, { status: 401 }) };
  }

  const { data: userData, error: userError } = await supabase.auth.getUser(accessToken);
  const user = userData.user;

  if (userError || !user?.email) {
    return { response: NextResponse.json({ error: "Please sign in again." }, { status: 401 }) };
  }

  const artist = await findApprovedArtistForUser(user.email, user.id);

  if (!artist) {
    return { response: NextResponse.json({ error: "Only approved artists can update a profile." }, { status: 403 }) };
  }

  return { artist };
}

function imageExtension(file: File) {
  if (file.type === "image/png") {
    return "png";
  }

  if (file.type === "image/webp") {
    return "webp";
  }

  return "jpg";
}

function normalizeRequiredString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeOptionalString(value: FormDataEntryValue | null) {
  const text = normalizeRequiredString(value);
  return text || null;
}

function parseList(value: FormDataEntryValue | null) {
  return normalizeRequiredString(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 12);
}
