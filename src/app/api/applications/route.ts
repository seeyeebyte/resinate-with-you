import { NextResponse } from "next/server";
import {
  applicationPhotoContentType,
  applicationPhotoMaxSize,
  isAllowedApplicationPhoto,
  isValidEmail,
  normalizeApplicationPayload,
  requiredSampleImageCount,
  validateApplication,
  type ApplicationPayload,
} from "@/lib/applications";
import { sendAdminApplicationEmail } from "@/lib/email";
import { getSupabaseServiceClient, type ApplicationRecord } from "@/lib/supabase";

const applicationPhotoBucket = process.env.SUPABASE_APPLICATION_PHOTOS_BUCKET || "application-photos";
const duplicateEmailMessage = "This email already has an application. Please check your application status instead.";

export async function POST(request: Request) {
  const supabase = getSupabaseServiceClient();

  if (!supabase) {
    return applicationErrorResponse(request, "Supabase service config is missing.", 503);
  }

  let payload: ApplicationPayload;
  let photos: File[] = [];

  try {
    const formData = await request.formData();
    photos = formData.getAll("sample_images").filter((item): item is File => item instanceof File && item.size > 0);
    const contactPlatform = optionalFormValue(formData, "contact_platform");
    const otherContactPlatform = optionalFormValue(formData, "other_contact_platform");

    payload = {
      brand_name: String(formData.get("brand_name") || ""),
      contact_name: String(formData.get("contact_name") || ""),
      email: String(formData.get("email") || ""),
      country: optionalFormValue(formData, "country"),
      city: optionalFormValue(formData, "city"),
      artist_type: optionalFormValue(formData, "artist_type"),
      studio_address: optionalFormValue(formData, "studio_address"),
      instagram_url: optionalFormValue(formData, "instagram_url"),
      website_url: optionalFormValue(formData, "website_url"),
      contact_link_label:
        optionalFormValue(formData, "contact_link_label") ||
        resolveContactPlatformLabel(contactPlatform, otherContactPlatform),
      shop_url: optionalFormValue(formData, "shop_url"),
      categories: formData.getAll("categories").map((item) => String(item)),
      other_category: optionalFormValue(formData, "other_category"),
      accepts_custom: formData.get("accepts_custom") === "true",
      ships_international: formData.get("ships_international") === "true",
      price_range: optionalFormValue(formData, "price_range"),
      bio: optionalFormValue(formData, "bio"),
      authorization_accepted: formData.get("authorization_accepted") === "true",
    };
  } catch {
    return applicationErrorResponse(request, "Invalid application payload.", 400);
  }

  const normalizedEmail = String(payload.email || "").trim().toLowerCase();

  if (!isValidEmail(normalizedEmail)) {
    return applicationErrorResponse(request, "A valid email is required.", 400);
  }

  const { data: existingApplication, error: existingApplicationError } = await supabase
    .from("applications")
    .select("id")
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (existingApplicationError) {
    return applicationErrorResponse(request, existingApplicationError.message, 500);
  }

  if (existingApplication) {
    return applicationErrorResponse(request, duplicateEmailMessage, 409, "/artist/application-status");
  }

  const preflightApplication = normalizeApplicationPayload({
    ...payload,
    email: normalizedEmail,
    sample_image_urls: Array.from({ length: requiredSampleImageCount }, (_, index) => `pending-photo-${index + 1}`),
  });
  const preflightValidationError = validateApplication(preflightApplication);

  if (preflightValidationError) {
    return applicationErrorResponse(request, preflightValidationError, 400);
  }

  if (photos.length !== requiredSampleImageCount) {
    return applicationErrorResponse(request, "Please upload 3 different product photos.", 400);
  }

  for (const photo of photos) {
    if (!isAllowedApplicationPhoto(photo)) {
      return applicationErrorResponse(request, "Photos must be JPG, PNG, or WebP files.", 400);
    }

    if (photo.size > applicationPhotoMaxSize) {
      return applicationErrorResponse(request, "Each photo must be 5 MB or smaller.", 400);
    }
  }

  const photoUrls: string[] = [];
  const safeEmail = String(payload.email || "unknown").toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const uploadGroup = crypto.randomUUID();

  for (const [index, photo] of photos.entries()) {
    const contentType = applicationPhotoContentType(photo);
    const extension = fileExtension(contentType);
    const path = `${safeEmail}/${uploadGroup}/sample-${index + 1}.${extension}`;
    const { error: uploadError } = await supabase.storage.from(applicationPhotoBucket).upload(path, photo, {
      contentType,
      upsert: false,
    });

    if (uploadError) {
      return applicationErrorResponse(request, uploadError.message, 500);
    }

    const { data } = supabase.storage.from(applicationPhotoBucket).getPublicUrl(path);
    photoUrls.push(data.publicUrl);
  }

  const application = normalizeApplicationPayload({
    ...payload,
    email: normalizedEmail,
    sample_image_urls: photoUrls,
  });
  const validationError = validateApplication(application);

  if (validationError) {
    return applicationErrorResponse(request, validationError, 400);
  }

  const { data, error } = await supabase.from("applications").insert(application).select("*").single();

  if (error) {
    if (error.code === "23505") {
      return applicationErrorResponse(request, duplicateEmailMessage, 409, "/artist/application-status");
    }

    return applicationErrorResponse(request, error.message, 500);
  }

  const email = await sendAdminApplicationEmail(data as ApplicationRecord);

  return applicationSuccessResponse(request, {
    application: data,
    email,
  });
}

function applicationErrorResponse(request: Request, error: string, status: number, statusUrl?: string) {
  if (acceptsJson(request)) {
    return NextResponse.json({ error, statusUrl }, { status });
  }

  const redirectParams = new URLSearchParams({
    submitError: error,
  });

  if (statusUrl) {
    redirectParams.set("statusUrl", statusUrl);
  }

  return relativeRedirect(`/apply?${redirectParams.toString()}`);
}

function applicationSuccessResponse(
  request: Request,
  result: {
    application: unknown;
    email: unknown;
  },
) {
  if (acceptsJson(request)) {
    return NextResponse.json(result);
  }

  return relativeRedirect("/apply?submitted=1");
}

function acceptsJson(request: Request) {
  return request.headers.get("accept")?.includes("application/json") ?? false;
}

function relativeRedirect(location: string) {
  return new Response(null, {
    status: 303,
    headers: {
      Location: location,
    },
  });
}

function resolveContactPlatformLabel(platform?: string, otherPlatform?: string) {
  if (platform === "other") {
    return otherPlatform;
  }

  const labels: Record<string, string> = {
    wechat: "WeChat",
    xiaohongshu: "Xiaohongshu",
    line: "LINE",
    shopee: "Shopee",
    naver: "Naver",
    kakaotalk: "KakaoTalk",
    etsy: "Etsy",
  };

  return platform ? labels[platform] : undefined;
}

function optionalFormValue(formData: FormData, key: string) {
  const value = String(formData.get(key) || "").trim();
  return value.length > 0 ? value : undefined;
}

function fileExtension(contentType: string) {
  const extensionByType: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };

  return extensionByType[contentType] || "jpg";
}
