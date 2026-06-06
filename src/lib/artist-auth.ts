import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createArtistSlug, normalizeArtistType } from "@/lib/applications";
import { sendArtistPasswordEmail } from "@/lib/email";
import { siteConfig } from "@/lib/site";
import { getSupabaseServiceClient, type ApplicationRecord } from "@/lib/supabase";

export type ArtistAuthResult = {
  userId: string | null;
  temporaryPassword: string | null;
  setupEmail: {
    sent: boolean;
    skipped: boolean;
    error: string | null;
  };
  error: string | null;
};

export type ApprovedArtistAccountStatus = {
  applicationId: string;
  hasAuthUser: boolean;
  hasArtist: boolean;
  hasProfile: boolean;
  userId: string | null;
  artistId: string | null;
  needsRepair: boolean;
  error: string | null;
};

type EnsureApprovedArtistOptions = {
  requestUrl: string;
};

export async function ensureApprovedArtistAccount(
  application: ApplicationRecord,
  options: EnsureApprovedArtistOptions,
): Promise<ArtistAuthResult> {
  const supabase = getSupabaseServiceClient();

  if (!supabase) {
    return emptyResult("Supabase service config is missing.");
  }

  const email = application.email.trim().toLowerCase();
  const temporaryPassword = createTemporaryPassword();
  const userResult = await ensureAuthUser(supabase, application, email, temporaryPassword);

  if (userResult.error || !userResult.user?.id) {
    return emptyResult(userResult.error || "Artist auth user could not be created.");
  }

  const userId = userResult.user.id;
  const profileResult = await ensureArtistProfile(supabase, userId, email);

  if (profileResult.error) {
    return {
      userId,
      temporaryPassword,
      setupEmail: skippedEmail,
      error: profileResult.error,
    };
  }

  const artistResult = await ensureArtistRecord(supabase, application, userId);

  if (artistResult.error) {
    return {
      userId,
      temporaryPassword,
      setupEmail: skippedEmail,
      error: artistResult.error,
    };
  }

  const passwordLink = await createPasswordSetupLink(supabase, email, options.requestUrl);

  if (passwordLink.error || !passwordLink.url) {
    return {
      userId,
      temporaryPassword,
      setupEmail: skippedEmail,
      error: passwordLink.error || "Password setup link could not be created.",
    };
  }

  return {
    userId,
    temporaryPassword,
    setupEmail: await sendArtistPasswordEmail({
      application,
      url: passwordLink.url,
      mode: "setup",
      temporaryPassword,
    }),
    error: null,
  };
}

export async function getApprovedArtistAccountStatus(application: ApplicationRecord): Promise<ApprovedArtistAccountStatus> {
  const supabase = getSupabaseServiceClient();

  if (!supabase) {
    return accountStatusError(application.id, "Supabase service config is missing.");
  }

  const email = application.email.trim().toLowerCase();
  const userResult = await findAuthUserByEmail(supabase, email);

  if (userResult.error) {
    return accountStatusError(application.id, userResult.error);
  }

  const { data: artistByApplication, error: artistByApplicationError } = await supabase
    .from("artists")
    .select("id,user_id")
    .eq("application_id", application.id)
    .maybeSingle();

  if (artistByApplicationError) {
    return accountStatusError(application.id, artistByApplicationError.message);
  }

  let artist = artistByApplication;

  if (!artist) {
    const { data: artistByEmail, error: artistByEmailError } = await supabase
      .from("artists")
      .select("id,user_id")
      .eq("contact_email", email)
      .maybeSingle();

    if (artistByEmailError) {
      return accountStatusError(application.id, artistByEmailError.message);
    }

    artist = artistByEmail;
  }

  const profileId = artist?.user_id || userResult.user?.id || "";
  let hasProfile = false;

  if (profileId) {
    const { data: profile, error: profileError } = await supabase.from("profiles").select("id").eq("id", profileId).maybeSingle();

    if (profileError) {
      return accountStatusError(application.id, profileError.message);
    }

    hasProfile = Boolean(profile?.id);
  }

  const hasAuthUser = Boolean(userResult.user?.id);
  const hasArtist = Boolean(artist?.id);

  return {
    applicationId: application.id,
    hasAuthUser,
    hasArtist,
    hasProfile,
    userId: userResult.user?.id || artist?.user_id || null,
    artistId: artist?.id || null,
    needsRepair: !hasAuthUser || !hasArtist || !hasProfile,
    error: null,
  };
}

export async function sendApprovedArtistPasswordReset(email: string, requestUrl: string) {
  const supabase = getSupabaseServiceClient();

  if (!supabase) {
    return emptyPasswordResetResult("Supabase service config is missing.");
  }

  const normalizedEmail = email.trim().toLowerCase();
  const application = await findApprovedApplicationByEmail(supabase, normalizedEmail);

  if (application.error) {
    return emptyPasswordResetResult(application.error);
  }

  if (!application.record) {
    return {
      sent: false,
      skipped: false,
      error: null,
      approved: false,
    };
  }

  const user = await findAuthUserByEmail(supabase, normalizedEmail);

  if (user.error) {
    return emptyPasswordResetResult(user.error);
  }

  if (!user.user) {
    const setupResult = await ensureApprovedArtistAccount(application.record, { requestUrl });

    return {
      ...setupResult.setupEmail,
      error: setupResult.error,
      approved: true,
    };
  }

  const passwordLink = await createPasswordSetupLink(supabase, normalizedEmail, requestUrl);

  if (passwordLink.error || !passwordLink.url) {
    return emptyPasswordResetResult(passwordLink.error || "Password reset link could not be created.");
  }

  const emailResult = await sendArtistPasswordEmail({
    application: application.record,
    url: passwordLink.url,
    mode: "reset",
  });

  return {
    ...emailResult,
    approved: true,
  };
}

function accountStatusError(applicationId: string, error: string): ApprovedArtistAccountStatus {
  return {
    applicationId,
    hasAuthUser: false,
    hasArtist: false,
    hasProfile: false,
    userId: null,
    artistId: null,
    needsRepair: true,
    error,
  };
}

function createTemporaryPassword() {
  const bytes = new Uint8Array(18);
  crypto.getRandomValues(bytes);
  const token = Array.from(bytes, (byte) => byte.toString(36).padStart(2, "0")).join("");
  return `Ry-${token.slice(0, 18)}!7`;
}

async function ensureAuthUser(supabase: SupabaseClient, application: ApplicationRecord, email: string, temporaryPassword: string) {
  const existing = await findAuthUserByEmail(supabase, email);

  if (existing.error) {
    return { user: null, error: existing.error };
  }

  if (existing.user) {
    const { data, error } = await supabase.auth.admin.updateUserById(existing.user.id, {
      password: temporaryPassword,
      email_confirm: true,
      user_metadata: {
        role: "artist",
        brand_name: application.brand_name,
        application_id: application.id,
      },
    });

    return { user: data.user ?? null, error: error?.message ?? null };
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: temporaryPassword,
    email_confirm: true,
    user_metadata: {
      role: "artist",
      brand_name: application.brand_name,
      application_id: application.id,
    },
  });

  if (error) {
    const duplicate = await findAuthUserByEmail(supabase, email);

    if (duplicate.user) {
      return { user: duplicate.user, error: null };
    }

    return { user: null, error: error.message };
  }

  return { user: data.user, error: null };
}

async function findAuthUserByEmail(supabase: SupabaseClient, email: string): Promise<{ user: User | null; error: string | null }> {
  for (let page = 1; page <= 10; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 100,
    });

    if (error) {
      return { user: null, error: error.message };
    }

    const user = data.users.find((item) => item.email?.trim().toLowerCase() === email) ?? null;

    if (user) {
      return { user, error: null };
    }

    if (!data.nextPage) {
      break;
    }
  }

  return { user: null, error: null };
}

async function findApprovedApplicationByEmail(supabase: SupabaseClient, email: string) {
  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .eq("email", email)
    .eq("status", "approved")
    .maybeSingle();

  if (error) {
    return { record: null, error: error.message };
  }

  return { record: (data as ApplicationRecord | null) ?? null, error: null };
}

async function ensureArtistRecord(supabase: SupabaseClient, application: ApplicationRecord, userId: string) {
  const { data: existingArtist, error: existingArtistError } = await supabase
    .from("artists")
    .select("id,user_id")
    .eq("application_id", application.id)
    .maybeSingle();

  if (existingArtistError) {
    return { error: existingArtistError.message };
  }

  if (existingArtist?.id) {
    const { error } = await supabase
      .from("artists")
      .update({
        user_id: userId,
        artist_type: normalizeArtistType(application.artist_type),
        studio_address: application.studio_address,
        status: "approved",
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingArtist.id);

    return { error: error?.message ?? null };
  }

  const { error } = await supabase.from("artists").insert({
    user_id: userId,
    application_id: application.id,
    brand_name: application.brand_name,
    contact_name: application.contact_name,
    contact_email: application.email,
    slug: createArtistSlug(application),
    bio: application.bio,
    country: application.country,
    city: application.city,
    artist_type: normalizeArtistType(application.artist_type),
    studio_address: application.studio_address,
    instagram_url: application.instagram_url,
    website_url: application.website_url,
    contact_link_label: application.contact_link_label,
    shop_url: application.shop_url,
    categories: application.categories,
    sample_image_urls: application.sample_image_urls,
    accepts_custom: application.accepts_custom,
    ships_international: application.ships_international,
    status: "approved",
  });

  return { error: error?.message ?? null };
}

async function ensureArtistProfile(supabase: SupabaseClient, userId: string, email: string) {
  const { error } = await supabase.from("profiles").upsert(
    {
      id: userId,
      email,
      role: "artist",
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "id",
    },
  );

  return { error: error?.message ?? null };
}

async function createPasswordSetupLink(supabase: SupabaseClient, email: string, requestUrl: string) {
  const redirectTo = new URL("/artist/set-password", appOrigin(requestUrl)).toString();
  const { data, error } = await supabase.auth.admin.generateLink({
    type: "recovery",
    email,
    options: {
      redirectTo,
    },
  });

  if (error) {
    return { url: null, error: error.message };
  }

  return {
    url: data.properties?.action_link ?? null,
    error: data.properties?.action_link ? null : "Supabase did not return an action link.",
  };
}

function appOrigin(requestUrl: string) {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  if (process.env.VERCEL_ENV === "production") {
    return siteConfig.url;
  }

  return new URL(requestUrl).origin;
}

const skippedEmail = {
  sent: false,
  skipped: true,
  error: null,
};

function emptyResult(error: string): ArtistAuthResult {
  return {
    userId: null,
    temporaryPassword: null,
    setupEmail: skippedEmail,
    error,
  };
}

function emptyPasswordResetResult(error: string) {
  return {
    sent: false,
    skipped: false,
    error,
    approved: true,
  };
}
