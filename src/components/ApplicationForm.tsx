"use client";

import NextImage from "next/image";
import { FormEvent, useEffect, useRef, useState } from "react";
import {
  isAllowedApplicationPhoto,
  instagramUsernamePattern,
  isHttpUrl,
  isInstagramUrl,
  isValidEmail,
  normalizeInstagramInput,
  maxBioLength,
} from "@/lib/applications";
import { CountrySelectField } from "@/components/CountrySelectField";
import { contactPlatformOptions } from "@/components/PlatformLinks";
import { ProvinceStateField } from "@/components/ProvinceStateField";
import { countryOptions } from "@/lib/country-options";
import { regionOptionsByCountryCode } from "@/lib/region-options-by-country";
import { categories } from "@/lib/site";

type SubmitState = "idle" | "submitting" | "success" | "error";
type EmailCheckState = "idle" | "checking" | "available" | "exists" | "error";

const applicationDraftKey = "resinate-artist-application-draft-v2";
const applicationOriginalPhotoMaxSize = 20 * 1024 * 1024;
const applicationPreparedPhotoMaxSize = 950 * 1024;
const applicationPhotoMaxDimension = 1800;
const emptyFormFields = {
  brandName: "",
  contactName: "",
  instagramUrl: "",
  websiteUrl: "",
  shopUrl: "",
  priceRange: "",
  bio: "",
  artistType: "individual",
  studioAddress: "",
  acceptsCustom: false,
  shipsInternational: false,
};

type ApplicationFormProps = {
  initialSubmitted?: boolean;
  initialError?: string;
  initialStatusUrl?: string;
};

type ApplicationDraft = {
  formFields: typeof emptyFormFields;
  selectedCategories: string[];
  otherCategory: string;
  email: string;
  country: string;
  provinceOrState: string;
  contactPlatform: string;
  otherContactPlatform: string;
  authorizationAccepted: boolean;
};

export function ApplicationForm({
  initialSubmitted = false,
  initialError = "",
  initialStatusUrl = "",
}: ApplicationFormProps) {
  const formRef = useRef<HTMLFormElement | null>(null);
  const photoPreviewUrlsRef = useRef(["", "", ""]);
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const photoSlotInputRefs = useRef<Array<HTMLInputElement | null>>([null, null, null]);
  const photoFilesRef = useRef<Array<File | null>>([null, null, null]);
  const [formFields, setFormFields] = useState(emptyFormFields);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [otherCategory, setOtherCategory] = useState("");
  const [email, setEmail] = useState("");
  const [emailCheckState, setEmailCheckState] = useState<EmailCheckState>("idle");
  const [country, setCountry] = useState("");
  const [provinceOrState, setProvinceOrState] = useState("");
  const [contactPlatform, setContactPlatform] = useState("");
  const [otherContactPlatform, setOtherContactPlatform] = useState("");
  const [photoNames, setPhotoNames] = useState(["", "", ""]);
  const [photoErrors, setPhotoErrors] = useState(["", "", ""]);
  const [photoPreviews, setPhotoPreviews] = useState(["", "", ""]);
  const [photoPreparing, setPhotoPreparing] = useState([false, false, false]);
  const [authorizationAccepted, setAuthorizationAccepted] = useState(false);
  const [submitState, setSubmitState] = useState<SubmitState>(
    initialSubmitted ? "success" : initialError ? "error" : "idle",
  );
  const [errorMessage, setErrorMessage] = useState(initialError);
  const [statusUrl, setStatusUrl] = useState(initialStatusUrl);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [formLoadTimedOut, setFormLoadTimedOut] = useState(false);

  useEffect(() => {
    return () => {
      photoPreviewUrlsRef.current.forEach(revokeObjectUrl);
    };
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      if (initialSubmitted) {
        window.localStorage.removeItem(applicationDraftKey);
        setDraftLoaded(true);
        return;
      }

      try {
        const savedDraft = window.localStorage.getItem(applicationDraftKey);

        if (!savedDraft) {
          return;
        }

        const draft = JSON.parse(savedDraft) as Partial<{
          formFields: typeof emptyFormFields;
          selectedCategories: string[];
          otherCategory: string;
          email: string;
          country: string;
          provinceOrState: string;
          contactPlatform: string;
          otherContactPlatform: string;
          authorizationAccepted: boolean;
        }>;

        setFormFields({ ...emptyFormFields, ...(draft.formFields || {}) });
        setSelectedCategories(Array.isArray(draft.selectedCategories) ? draft.selectedCategories : []);
        setOtherCategory(String(draft.otherCategory || ""));
        setEmail(String(draft.email || ""));
        setCountry(String(draft.country || ""));
        setProvinceOrState(String(draft.provinceOrState || ""));
        setContactPlatform(String(draft.contactPlatform || ""));
        setOtherContactPlatform(String(draft.otherContactPlatform || ""));
        setAuthorizationAccepted(Boolean(draft.authorizationAccepted));
      } catch {
        window.localStorage.removeItem(applicationDraftKey);
      } finally {
        setDraftLoaded(true);
      }
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [initialSubmitted]);

  useEffect(() => {
    if (draftLoaded) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setFormLoadTimedOut(true);
    }, 6000);

    return () => window.clearTimeout(timeout);
  }, [draftLoaded]);

  useEffect(() => {
    if (submitState !== "success") {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeSuccessDialog();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [submitState]);

  useEffect(() => {
    if (!draftLoaded || submitState === "success") {
      return;
    }

    saveApplicationDraft({
      formFields,
      selectedCategories,
      otherCategory,
      email,
      country,
      provinceOrState,
      contactPlatform,
      otherContactPlatform,
      authorizationAccepted,
    });
  }, [
    authorizationAccepted,
    contactPlatform,
    country,
    draftLoaded,
    email,
    formFields,
    otherCategory,
    otherContactPlatform,
    provinceOrState,
    selectedCategories,
    submitState,
  ]);

  useEffect(() => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !isValidEmail(normalizedEmail)) {
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      setEmailCheckState("checking");
      fetch(`/api/applications/status?email=${encodeURIComponent(normalizedEmail)}`, {
        signal: controller.signal,
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Email check failed.");
          }

          return response.json();
        })
        .then((result) => {
          setEmailCheckState(result.application ? "exists" : "available");
        })
        .catch((error) => {
          if (error.name !== "AbortError") {
            setEmailCheckState("error");
          }
        });
    }, 450);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [email]);

  function handleCountryChange(value: string) {
    setCountry(value);
    setProvinceOrState("");
  }

  function handleEmailChange(value: string) {
    setEmail(value);
    setStatusUrl("");
    setEmailCheckState("idle");
  }

  function showSubmitError(message: string) {
    setSubmitState("error");
    setErrorMessage(message);

    window.setTimeout(() => {
      document.getElementById("application-form-status-top")?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 0);
  }

  function showPhotoSubmitError(message: string, firstProblemIndex: number) {
    setSubmitState("error");
    setErrorMessage(message);

    window.setTimeout(() => {
      document.getElementById(`application-photo-card-${firstProblemIndex}`)?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 0);
  }

  function closeSuccessDialog() {
    setSubmitState("idle");
    if (window.location.search.includes("submitted=1")) {
      window.history.replaceState({}, "", "/apply");
    }
  }

  function toggleCategory(category: string) {
    setSelectedCategories((current) =>
      current.includes(category) ? current.filter((item) => item !== category) : [...current, category],
    );
  }

  async function handlePhotoSelection(input: HTMLInputElement) {
    const selectedFiles = Array.from(input.files || []);

    if (selectedFiles.length === 0) {
      return;
    }

    if (selectedFiles.length > 3) {
      setPhotoErrors(["Please choose exactly 3 photos.", "", ""]);
      showPhotoSubmitError("Please choose exactly 3 product photos.", 0);
      input.value = "";
      return;
    }

    clearPhotoPreviews();
    photoFilesRef.current = [null, null, null];
    setPhotoNames(["", "", ""]);
    setPhotoErrors(["", "", ""]);
    setPhotoPreparing([false, false, false]);

    for (let index = 0; index < 3; index += 1) {
      const file = selectedFiles[index] || null;
      await preparePhotoSlot(index, file);
    }

    input.value = "";
  }

  async function handleSinglePhotoSelection(index: number, input: HTMLInputElement) {
    const file = input.files?.[0] || null;

    if (!file) {
      return;
    }

    setPhotoErrors((current) => replaceAt(current, index, ""));
    await preparePhotoSlot(index, file);
    input.value = "";
  }

  function replacePhoto(index: number) {
    photoSlotInputRefs.current[index]?.click();
  }

  function removePhoto(index: number) {
    setPhotoNames((current) => replaceAt(current, index, ""));
    setPhotoErrors((current) => replaceAt(current, index, ""));
    updatePhotoFile(index, null);
    setPhotoPreparing((current) => replaceAt(current, index, false));
    updatePhotoPreview(index, null);

    const slotInput = photoSlotInputRefs.current[index];

    if (slotInput) {
      slotInput.value = "";
    }
  }

  async function preparePhotoSlot(index: number, file: File | null) {
    if (!file) {
      setPhotoNames((current) => replaceAt(current, index, ""));
      setPhotoErrors((current) => replaceAt(current, index, `Please choose Photo ${index + 1}.`));
      updatePhotoFile(index, null);
      setPhotoPreparing((current) => replaceAt(current, index, false));
      updatePhotoPreview(index, null);
      return;
    }

    if (file.size > applicationOriginalPhotoMaxSize) {
      setPhotoNames((current) => replaceAt(current, index, ""));
      setPhotoErrors((current) =>
        replaceAt(current, index, "This photo is very large. Please choose a photo under 20 MB."),
      );
      updatePhotoFile(index, null);
      setPhotoPreparing((current) => replaceAt(current, index, false));
      updatePhotoPreview(index, null);
      return;
    }

    let preparedFile = file;
    setPhotoPreparing((current) => replaceAt(current, index, true));

    if (isHeicPhoto(file)) {
      setPhotoNames((current) => replaceAt(current, index, "Preparing iPhone photo..."));
      setPhotoErrors((current) => replaceAt(current, index, ""));
      updatePhotoPreview(index, null);

      try {
        preparedFile = await optimizePhotoForUpload(file);
      } catch {
        setPhotoNames((current) => replaceAt(current, index, ""));
        setPhotoErrors((current) =>
          replaceAt(
            current,
            index,
            "This iPhone photo could not be converted. Please choose a screenshot of it, or export it as JPEG.",
          ),
        );
        updatePhotoFile(index, null);
        setPhotoPreparing((current) => replaceAt(current, index, false));
        updatePhotoPreview(index, null);
        return;
      }
    } else {
      setPhotoNames((current) => replaceAt(current, index, "Preparing photo..."));
      setPhotoErrors((current) => replaceAt(current, index, ""));
      updatePhotoPreview(index, null);
    }

    if (!isAllowedApplicationPhoto(preparedFile)) {
      setPhotoNames((current) => replaceAt(current, index, ""));
      setPhotoErrors((current) =>
        replaceAt(
          current,
          index,
          "This photo format is not supported. Please choose a JPG, PNG, or WebP image. For an iPhone HEIC photo, use a screenshot or export it as JPEG.",
        ),
      );
      updatePhotoFile(index, null);
      setPhotoPreparing((current) => replaceAt(current, index, false));
      updatePhotoPreview(index, null);
      return;
    }

    try {
      preparedFile = await optimizePhotoForUpload(preparedFile);
    } catch {
      setPhotoNames((current) => replaceAt(current, index, ""));
      setPhotoErrors((current) =>
        replaceAt(current, index, "This photo could not be optimized. Please choose another JPG, PNG, or WebP image."),
      );
      updatePhotoFile(index, null);
      setPhotoPreparing((current) => replaceAt(current, index, false));
      updatePhotoPreview(index, null);
      return;
    }

    if (preparedFile.size > applicationPreparedPhotoMaxSize) {
      setPhotoNames((current) => replaceAt(current, index, ""));
      setPhotoErrors((current) =>
        replaceAt(current, index, "This photo is still too large after optimization. Please choose a smaller image."),
      );
      updatePhotoFile(index, null);
      setPhotoPreparing((current) => replaceAt(current, index, false));
      updatePhotoPreview(index, null);
      return;
    }

    setPhotoNames((current) => replaceAt(current, index, preparedFile.name || `Photo ${index + 1} selected`));
    setPhotoErrors((current) => replaceAt(current, index, ""));
    updatePhotoFile(index, preparedFile);
    setPhotoPreparing((current) => replaceAt(current, index, false));
    updatePhotoPreview(index, preparedFile);
  }

  function updatePhotoFile(index: number, file: File | null) {
    photoFilesRef.current = replaceAt(photoFilesRef.current, index, file);
  }

  function updatePhotoPreview(index: number, file: File | null) {
    const currentUrl = photoPreviewUrlsRef.current[index];
    revokeObjectUrl(currentUrl);
    const nextUrl = file ? URL.createObjectURL(file) : "";
    photoPreviewUrlsRef.current = replaceAt(photoPreviewUrlsRef.current, index, nextUrl);
    setPhotoPreviews((current) => replaceAt(current, index, nextUrl));
  }

  function clearPhotoPreviews() {
    photoPreviewUrlsRef.current.forEach(revokeObjectUrl);
    photoPreviewUrlsRef.current = ["", "", ""];
    setPhotoPreviews(["", "", ""]);
  }

  function getSelectedPhotoSlots() {
    return photoFilesRef.current;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submitApplication(event.currentTarget);
  }

  async function submitApplication(form: HTMLFormElement) {
    setSubmitState("idle");
    setErrorMessage("");
    setStatusUrl("");

    const formData = new FormData(form);
    const photosBySlot = getSelectedPhotoSlots();
    const photos = photosBySlot.filter((photo): photo is File => photo instanceof File && photo.size > 0);
    const brandName = formFields.brandName.trim();
    const contactName = formFields.contactName.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const instagramUrl = normalizeInstagramInput(formFields.instagramUrl);
    const websiteUrl = formFields.websiteUrl.trim();

    if (!brandName) {
      showSubmitError("Brand name is required.");
      return;
    }

    if (!contactName) {
      showSubmitError("Contact name is required.");
      return;
    }

    if (!isValidEmail(normalizedEmail)) {
      showSubmitError("Email format is not valid. Please use an email like hello@example.com.");
      return;
    }

    if (emailCheckState === "exists") {
      setStatusUrl("/artist/application-status");
      showSubmitError("This email already has an application. Please check your application status instead.");
      return;
    }

    if (formFields.instagramUrl.trim() && (!instagramUrl || !isInstagramUrl(instagramUrl))) {
      showSubmitError("Instagram username must use letters, numbers, periods, or underscores only.");
      return;
    }

    if (websiteUrl && !isHttpUrl(websiteUrl)) {
      showSubmitError("Website URL must start with http:// or https://.");
      return;
    }

    if (photoPreparing.some(Boolean)) {
      showPhotoSubmitError("Please wait for the selected iPhone photo to finish preparing.", firstPhotoPreparingIndex(photoPreparing));
      return;
    }

    const missingPhotoIndex = photosBySlot.findIndex((photo) => !(photo instanceof File) || photo.size === 0);

    if (missingPhotoIndex >= 0) {
      setPhotoErrors((current) =>
        current.map((error, index) => {
          if (photosBySlot[index] instanceof File && photosBySlot[index]?.size) {
            return "";
          }

          return error || `Please choose Photo ${index + 1}.`;
        }),
      );
      showPhotoSubmitError("Please choose all 3 product photos before submitting.", missingPhotoIndex);
      return;
    }

    for (const photo of photos) {
      if (!(photo instanceof File)) {
        continue;
      }

      if (!isAllowedApplicationPhoto(photo)) {
        const invalidIndex = photosBySlot.findIndex((item) => item === photo);
        setPhotoErrors((current) =>
          replaceAt(current, invalidIndex >= 0 ? invalidIndex : 0, "This photo must be JPG, PNG, or WebP."),
        );
        showPhotoSubmitError("Photos must be JPG, PNG, or WebP files.", invalidIndex >= 0 ? invalidIndex : 0);
        return;
      }

      if (photo.size > applicationPreparedPhotoMaxSize) {
        const oversizedIndex = photosBySlot.findIndex((item) => item === photo);
        setPhotoErrors((current) =>
          replaceAt(current, oversizedIndex >= 0 ? oversizedIndex : 0, "This photo is still too large after optimization."),
        );
        showPhotoSubmitError("Please replace the photo that is still too large after optimization.", oversizedIndex >= 0 ? oversizedIndex : 0);
        return;
      }
    }

    if (!authorizationAccepted) {
      showSubmitError("Please accept the display authorization before submitting.");
      return;
    }

    const cleanOtherCategory = otherCategory.trim();
    const selectedContactLabel =
      contactPlatform === "other"
        ? otherContactPlatform.trim()
        : contactPlatformOptions.find((option) => option.value === contactPlatform)?.label || "";

    const hasPresetCategory = selectedCategories.some((category) => category !== "Other");

    if (!hasPresetCategory && cleanOtherCategory.length === 0) {
      showSubmitError("Choose at least one product category or add an other category.");
      return;
    }

    formData.set("brand_name", brandName);
    formData.set("contact_name", contactName);
    formData.set("email", normalizedEmail);
    formData.set("instagram_url", instagramUrl || "");
    formData.set("website_url", websiteUrl);
    formData.set("shop_url", formFields.shopUrl.trim());
    formData.set("price_range", formFields.priceRange.trim());
    formData.set("bio", formFields.bio.trim());
    formData.set("artist_type", formFields.artistType);
    formData.set("studio_address", formFields.artistType === "offline_studio" ? formFields.studioAddress.trim() : "");
    formData.delete("sample_images");
    photos.forEach((photo) => formData.append("sample_images", photo));
    formData.delete("categories");
    selectedCategories.forEach((category) => formData.append("categories", category));
    formData.set("other_category", cleanOtherCategory);
    formData.set("country", country);
    formData.set("city", provinceOrState);
    formData.set("contact_link_label", selectedContactLabel);
    formData.set("accepts_custom", String(formFields.acceptsCustom));
    formData.set("ships_international", String(formFields.shipsInternational));
    formData.set("authorization_accepted", String(authorizationAccepted));

    setSubmitState("submitting");
    let response: Response;
    const controller = new AbortController();
    let uploadTimedOut = false;
    const timeout = window.setTimeout(() => {
      uploadTimedOut = true;
      controller.abort();
    }, 120000);

    try {
      response = await fetch("/api/applications", {
        method: "POST",
        body: formData,
        signal: controller.signal,
        headers: {
          Accept: "application/json",
        },
      });
    } catch {
      showSubmitError(
        uploadTimedOut
          ? "The upload took too long. Please check your connection, keep this page open, and try again."
          : "We could not submit the application. Please check your connection and try again.",
      );
      window.clearTimeout(timeout);
      return;
    } finally {
      window.clearTimeout(timeout);
    }

    let result: { error?: string; statusUrl?: string } = {};

    try {
      result = await response.json();
    } catch {
      result = {};
    }

    if (!response.ok) {
      setStatusUrl(typeof result.statusUrl === "string" ? result.statusUrl : "");
      showSubmitError(result.error || "Something went wrong while submitting. Please try again.");
      return;
    }

    form.reset();
    setFormFields(emptyFormFields);
    setSelectedCategories([]);
    setOtherCategory("");
    setEmail("");
    setEmailCheckState("idle");
    setCountry("");
    setProvinceOrState("");
    setContactPlatform("");
    setOtherContactPlatform("");
    setPhotoNames(["", "", ""]);
    setPhotoErrors(["", "", ""]);
    photoFilesRef.current = [null, null, null];
    if (photoInputRef.current) {
      photoInputRef.current.value = "";
    }
    setPhotoPreparing([false, false, false]);
    clearPhotoPreviews();
    setAuthorizationAccepted(false);
    setStatusUrl("");
    setSubmitState("success");
    try {
      window.localStorage.removeItem(applicationDraftKey);
    } catch {
      // Submission succeeded even if this browser blocks local storage cleanup.
    }

  }

  const provinceOptions = regionOptionsForCountry(country);

  return (
    <>
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        noValidate
        className="soft-card space-y-8 rounded-[12px] p-5 sm:p-8"
      >
      <p className="rounded-[10px] bg-[#f5fbff] px-4 py-3 text-sm leading-6 text-[#626960]">
        Fields marked with * are required. Fields without * can be left blank.
        {draftLoaded ? " Text fields are saved automatically on this device." : ""}
      </p>
      <div id="application-form-status-top" aria-live="assertive">
        <StatusMessage submitState={submitState} errorMessage={errorMessage} statusUrl={statusUrl} />
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <Field
          label="Brand name"
          name="brand_name"
          value={formFields.brandName}
          onChange={(value) => setFormFields((current) => ({ ...current, brandName: value }))}
          required
        />
        <Field
          label="Contact name"
          name="contact_name"
          value={formFields.contactName}
          onChange={(value) => setFormFields((current) => ({ ...current, contactName: value }))}
          required
        />
        <EmailField value={email} onChange={handleEmailChange} checkState={emailCheckState} />
        <CountrySelectField
          value={country}
          onChange={handleCountryChange}
          helper="Choose from the list. Province or state can be typed below."
        />
        <ProvinceStateField
          value={provinceOrState}
          onChange={setProvinceOrState}
          options={provinceOptions}
          name="city"
          helper="City-level detail is not needed. Leave blank if it does not apply."
        />
        <ArtistTypeField
          artistType={formFields.artistType}
          studioAddress={formFields.studioAddress}
          onArtistTypeChange={(value) =>
            setFormFields((current) => ({
              ...current,
              artistType: value,
              studioAddress: value === "offline_studio" ? current.studioAddress : "",
            }))
          }
          onStudioAddressChange={(value) => setFormFields((current) => ({ ...current, studioAddress: value }))}
        />
        <Field
          label="Instagram username"
          name="instagram_url"
          type="text"
          value={formFields.instagramUrl}
          onChange={(value) => setFormFields((current) => ({ ...current, instagramUrl: value }))}
          pattern={instagramUsernamePattern}
          placeholder="yourname"
          helper="Enter your Instagram username. We will link it to your profile."
        />
        <Field
          label="Website URL"
          name="website_url"
          type="url"
          value={formFields.websiteUrl}
          onChange={(value) => setFormFields((current) => ({ ...current, websiteUrl: value }))}
        />
        <ContactPlatformField
          contactPlatform={contactPlatform}
          otherContactPlatform={otherContactPlatform}
          setContactPlatform={setContactPlatform}
          setOtherContactPlatform={setOtherContactPlatform}
        />
        <Field
          label="Actual account or shop link"
          name="shop_url"
          value={formFields.shopUrl}
          onChange={(value) => setFormFields((current) => ({ ...current, shopUrl: value }))}
          placeholder="@yourstudio or https://..."
          helper="WeChat, Xiaohongshu, LINE, Shopee, Naver, KakaoTalk, Etsy, or another account or shop link customers should use."
        />
        <Field
          label="Typical price range (USD)"
          name="price_range"
          value={formFields.priceRange}
          onChange={(value) => setFormFields((current) => ({ ...current, priceRange: value }))}
          placeholder="$20 - $80 USD"
          helper="Please estimate your usual product price range in US dollars."
        />
      </div>

      <div>
        <p className="text-sm font-semibold text-[#2d3842]">Product categories *</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {[...categories, "Other"].map((category) => {
            const isSelected = selectedCategories.includes(category);

            return (
              <label
                key={category}
                aria-pressed={isSelected}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  isSelected
                    ? "border-[#2d3842] bg-[#2d3842] text-white shadow-sm"
                    : "border-[#d9ddd2] bg-white/80 text-[#626960] hover:border-[#9ba69d]"
                }`}
              >
                <input
                  type="checkbox"
                  name="categories"
                  value={category}
                  checked={isSelected}
                  onChange={() => toggleCategory(category)}
                  className="h-4 w-4 shrink-0 accent-[#2d3842]"
                />
                <span>{category}</span>
              </label>
            );
          })}
        </div>
        {selectedCategories.includes("Other") ? (
          <label className="mt-4 block max-w-xl">
            <span className="text-sm font-semibold text-[#2d3842]">Other category</span>
            <input
              name="other_category"
              value={otherCategory}
              onChange={(event) => setOtherCategory(event.target.value)}
              className="field-control mt-2 w-full px-4 text-sm"
              placeholder="Tell us your main product type"
            />
          </label>
        ) : null}
      </div>

      <fieldset>
        <legend className="text-sm font-semibold text-[#2d3842]">Product photos *</legend>
        <p className="mt-2 text-xs leading-5 text-[#626960]">
          Choose exactly 3 photos that best represent your work. JPG, PNG, or WebP. Large photos are optimized before upload.
        </p>
        <label
          htmlFor="application-photos"
          className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-[10px] border border-dashed border-[#bfc8be] bg-[#f5fbff] px-4 py-6 text-center transition hover:border-[#8cab91] hover:bg-[#f1fbef]"
        >
          <span className="text-sm font-semibold text-[#2d3842]">Choose 3 photos</span>
          <span className="mt-1 text-xs leading-5 text-[#626960]">You can select all 3 from your album at once.</span>
        </label>
        <input
          id="application-photos"
          ref={photoInputRef}
          name="sample_images"
          type="file"
          accept="image/*,.jpg,.jpeg,.png,.webp"
          multiple
          onChange={(event) => void handlePhotoSelection(event.target)}
          className="sr-only"
          aria-label="Choose exactly 3 product photos"
        />
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {photoNames.map((fileName, index) => (
            <div
              key={index}
              id={`application-photo-card-${index}`}
              className={`rounded-[10px] border border-dashed px-4 py-5 ${
                photoErrors[index]
                  ? "border-[#d7867f] bg-[#fff7f5]"
                  : fileName
                    ? "border-[#8cab91] bg-[#f1fbef]"
                    : "border-[#bfc8be] bg-[#f5fbff]"
              }`}
            >
              <p className="text-sm font-semibold text-[#2d3842]">
                Photo {index + 1}
              </p>
              {photoPreviews[index] ? (
                <NextImage
                  src={photoPreviews[index]}
                  alt={`Selected product photo ${index + 1}`}
                  width={600}
                  height={600}
                  unoptimized
                  className="mt-3 aspect-square w-full rounded-[8px] border border-[#d9ddd2] bg-white object-contain"
                />
              ) : null}
              <p className={`mt-3 break-all text-xs leading-5 ${photoErrors[index] ? "text-[#a4423b]" : "text-[#626960]"}`}>
                {photoErrors[index] || (fileName ? `Selected: ${fileName}` : "No photo selected yet.")}
              </p>
              <input
                ref={(node) => {
                  photoSlotInputRefs.current[index] = node;
                }}
                type="file"
                accept="image/*,.jpg,.jpeg,.png,.webp"
                onChange={(event) => void handleSinglePhotoSelection(index, event.target)}
                className="sr-only"
                aria-label={`Replace product photo ${index + 1}`}
              />
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => replacePhoto(index)}
                  className="rounded-full border border-[#d9ddd2] bg-white px-4 py-2 text-xs font-semibold text-[#2d3842] transition hover:border-[#9ba69d]"
                >
                  {fileName ? "Replace" : "Choose"}
                </button>
                {fileName ? (
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="rounded-full border border-[#f0c5bf] bg-[#fff7f5] px-4 py-2 text-xs font-semibold text-[#8c2c27] transition hover:border-[#d7867f]"
                  >
                    Remove
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs leading-5 text-[#626960]">
          If one photo has a problem, your text and selections will stay in place. Only that photo needs to be chosen again.
        </p>
      </fieldset>

      <label className="block">
        <span className="text-sm font-semibold text-[#2d3842]">Short bio</span>
        <textarea
          name="bio"
          rows={5}
          maxLength={maxBioLength}
          value={formFields.bio}
          onChange={(event) => setFormFields((current) => ({ ...current, bio: event.target.value }))}
          className="field-control mt-2 w-full px-4 py-3 text-sm"
          placeholder="Tell visitors about your work, materials, style, and custom options."
        />
        <span className="mt-2 block text-xs leading-5 text-[#626960]">
          {maxBioLength} characters max. English is preferred.
          <br />
          If you write in another language, we may translate it into English, and the meaning may be slightly different from your original wording.
        </span>
      </label>

      <div className="grid gap-3 text-sm text-[#626960] sm:grid-cols-2">
        <label className="flex items-center gap-3 rounded-[10px] bg-[#f5fbff] p-4">
          <input
            name="accepts_custom"
            type="checkbox"
            value="true"
            checked={formFields.acceptsCustom}
            onChange={(event) => setFormFields((current) => ({ ...current, acceptsCustom: event.target.checked }))}
            className="h-4 w-4 accent-[#2d3842]"
          />
          Accepts custom orders
        </label>
        <label className="flex items-center gap-3 rounded-[10px] bg-[#f5fbff] p-4">
          <input
            name="ships_international"
            type="checkbox"
            value="true"
            checked={formFields.shipsInternational}
            onChange={(event) => setFormFields((current) => ({ ...current, shipsInternational: event.target.checked }))}
            className="h-4 w-4 accent-[#2d3842]"
          />
          Ships internationally
        </label>
      </div>

      <label className="flex gap-3 rounded-[10px] border border-[#cfd2ca] bg-[#dff9d9]/45 p-4 text-sm leading-6 text-[#626960]">
        <input
          name="authorization_accepted"
          type="checkbox"
          value="true"
          required
          checked={authorizationAccepted}
          onChange={(event) => setAuthorizationAccepted(event.target.checked)}
          className="mt-1 h-4 w-4 shrink-0 accent-[#2d3842]"
        />
        I confirm that I own or have permission to share the submitted product information, brand details, and links. I authorize Resinate With You to display them if my application is approved.
      </label>

      <button
        type="submit"
        disabled={!draftLoaded || submitState === "submitting" || photoPreparing.some(Boolean)}
        aria-busy={submitState === "submitting" || photoPreparing.some(Boolean)}
        aria-describedby={!draftLoaded ? "application-form-loading-note" : undefined}
        className="studio-button studio-button-primary w-full disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {!draftLoaded
          ? "Loading form..."
          : photoPreparing.some(Boolean)
            ? "Preparing photos..."
            : submitState === "submitting"
              ? "Uploading and submitting..."
              : "Submit application"}
      </button>
      {!draftLoaded ? (
        <p
          id="application-form-loading-note"
          className={`text-xs leading-5 ${formLoadTimedOut ? "font-semibold text-[#a4423b]" : "text-[#626960]"}`}
        >
          {formLoadTimedOut
            ? "The form did not finish loading. Please refresh this page."
            : "This may take a moment on first load."}
        </p>
      ) : null}

      <div id="application-form-status" aria-live="polite">
        <StatusMessage submitState={submitState} errorMessage={errorMessage} statusUrl={statusUrl} />
      </div>
      </form>

      {submitState === "success" ? (
        <div
          className="fixed inset-0 z-[100] grid place-items-center bg-[#2d3842]/35 px-4 py-8 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="application-success-title"
        >
          <div className="w-full max-w-md rounded-[12px] border border-[#d9ddd2] bg-white p-6 shadow-[0_28px_80px_rgba(45,56,66,0.24)] sm:p-8">
            <p className="eyebrow">Application complete</p>
            <h2 id="application-success-title" className="display-heading mt-3 text-3xl">
              Application received
            </h2>
            <p className="mt-4 text-sm leading-6 text-[#626960]">
              Your application was submitted successfully. We will review it before publishing your profile.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <a
                href="/apply"
                onClick={(event) => {
                  event.preventDefault();
                  closeSuccessDialog();
                }}
                className="studio-button studio-button-primary justify-center text-center"
              >
                Done
              </a>
              <a
                href="/artist/application-status"
                className="studio-button justify-center border border-[#d9ddd2] bg-white text-center text-[#2d3842]"
              >
                Check application status
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function isHeicPhoto(file: File) {
  const normalizedType = file.type.toLowerCase();
  const normalizedName = file.name.toLowerCase();
  return (
    normalizedType === "image/heic" ||
    normalizedType === "image/heif" ||
    normalizedName.endsWith(".heic") ||
    normalizedName.endsWith(".heif")
  );
}

async function optimizePhotoForUpload(file: File) {
  if (file.size <= applicationPreparedPhotoMaxSize && !isHeicPhoto(file)) {
    return file;
  }

  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await loadImage(objectUrl);
    const dimensions = [applicationPhotoMaxDimension, 1500, 1200, 1000, 800];
    const qualities = [0.82, 0.74, 0.66, 0.58, 0.5, 0.42];
    let smallestFile: File | null = null;

    for (const maxDimension of dimensions) {
      const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight));
      const width = Math.max(1, Math.round(image.naturalWidth * scale));
      const height = Math.max(1, Math.round(image.naturalHeight * scale));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error("Canvas is not available.");
      }

      context.drawImage(image, 0, 0, width, height);

      for (const quality of qualities) {
        const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));

        if (!blob) {
          continue;
        }

        const optimizedFile = new File([blob], optimizedPhotoName(file.name), {
          type: "image/jpeg",
          lastModified: file.lastModified,
        });

        if (!smallestFile || optimizedFile.size < smallestFile.size) {
          smallestFile = optimizedFile;
        }

        if (optimizedFile.size <= applicationPreparedPhotoMaxSize) {
          return optimizedFile;
        }
      }
    }

    if (!smallestFile) {
      throw new Error("Photo conversion failed.");
    }

    return smallestFile;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function optimizedPhotoName(name: string) {
  const baseName = name.replace(/\.[^.]+$/i, "").trim() || "product-photo";
  return `${baseName}.jpg`;
}

function loadImage(source: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Photo could not be opened."));
    image.src = source;
  });
}

function replaceAt<T>(items: T[], index: number, value: T) {
  return items.map((item, itemIndex) => (itemIndex === index ? value : item));
}

function revokeObjectUrl(url: string) {
  if (url) {
    URL.revokeObjectURL(url);
  }
}

function firstPhotoPreparingIndex(preparing: boolean[]) {
  const index = preparing.findIndex(Boolean);
  return index >= 0 ? index : 0;
}

function regionOptionsForCountry(country: string) {
  const normalizedCountry = country.trim().toLowerCase();
  const countryOption = countryOptions.find(
    (option) => option.value.toLowerCase() === normalizedCountry || option.label.toLowerCase() === normalizedCountry,
  );

  return countryOption?.code ? regionOptionsByCountryCode[countryOption.code] || [] : [];
}

function saveApplicationDraft(draft: ApplicationDraft) {
  const hasDraft =
    Object.values(draft.formFields).some((value) =>
      typeof value === "boolean" ? value : value.trim().length > 0,
    ) ||
    draft.selectedCategories.length > 0 ||
    draft.otherCategory.trim().length > 0 ||
    draft.email.trim().length > 0 ||
    draft.country.trim().length > 0 ||
    draft.provinceOrState.trim().length > 0 ||
    draft.contactPlatform.trim().length > 0 ||
    draft.otherContactPlatform.trim().length > 0 ||
    draft.authorizationAccepted;

  try {
    if (!hasDraft) {
      window.localStorage.removeItem(applicationDraftKey);
      return;
    }

    window.localStorage.setItem(applicationDraftKey, JSON.stringify(draft));
  } catch {
    // A blocked local storage setting must not break the application form.
  }
}

function Field({
  label,
  name,
  type = "text",
  required = false,
  placeholder,
  helper,
  pattern,
  value,
  onChange,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  helper?: string;
  pattern?: string;
  value?: string;
  onChange?: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-[#2d3842]">
        {label}
        {required ? " *" : ""}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        pattern={pattern}
        value={value}
        onChange={onChange ? (event) => onChange(event.target.value) : undefined}
        className="field-control mt-2 w-full px-4 text-sm"
      />
      {helper ? <span className="mt-2 block text-xs leading-5 text-[#626960]">{helper}</span> : null}
    </label>
  );
}

function ArtistTypeField({
  artistType,
  studioAddress,
  onArtistTypeChange,
  onStudioAddressChange,
}: {
  artistType: string;
  studioAddress: string;
  onArtistTypeChange: (value: string) => void;
  onStudioAddressChange: (value: string) => void;
}) {
  return (
    <>
      <label className="block">
        <span className="text-sm font-semibold text-[#2d3842]">Artist type</span>
        <select
          name="artist_type"
          value={artistType}
          onChange={(event) => onArtistTypeChange(event.target.value)}
          className="field-control mt-2 w-full px-4 text-sm"
        >
          <option value="individual">Individual</option>
          <option value="offline_studio">Offline studio</option>
        </select>
      </label>
      {artistType === "offline_studio" ? (
        <label className="block">
          <span className="text-sm font-semibold text-[#2d3842]">Studio address</span>
          <input
            name="studio_address"
            value={studioAddress}
            onChange={(event) => onStudioAddressChange(event.target.value)}
            className="field-control mt-2 w-full px-4 text-sm"
            placeholder="Full public studio address, if visitors may see it"
          />
          <span className="mt-2 block text-xs leading-5 text-[#626960]">
            Optional. If provided, this address may be shown on your public artist profile.
          </span>
        </label>
      ) : null}
    </>
  );
}

function EmailField({
  value,
  onChange,
  checkState,
}: {
  value: string;
  onChange: (value: string) => void;
  checkState: EmailCheckState;
}) {
  const invalidEmail = value.trim().length > 0 && !isValidEmail(value);
  const messageByState: Partial<Record<EmailCheckState, React.ReactNode>> = {
    checking: "Checking whether this email already has an application...",
    available: "This email is available for a new application.",
    exists: (
      <>
        This email already has an application.{" "}
        <a href="/artist/application-status" className="font-semibold underline underline-offset-4">
          Check application status
        </a>
      </>
    ),
    error: "Email availability could not be checked. We will check again when you submit.",
  };
  const toneByState: Partial<Record<EmailCheckState, string>> = {
    checking: "text-[#626960]",
    available: "text-[#2f6c4f]",
    exists: "text-red-800",
    error: "text-[#8a5a17]",
  };

  return (
    <label className="block">
      <span className="text-sm font-semibold text-[#2d3842]">Email *</span>
      <input
        name="email"
        type="email"
        required
        value={value}
        onChange={(event) => onChange(event.target.value)}
        inputMode="email"
        autoCapitalize="none"
        autoCorrect="off"
        aria-invalid={invalidEmail}
        className={`field-control mt-2 w-full px-4 text-sm ${invalidEmail ? "border-red-300 bg-red-50/70 focus:border-red-600" : ""}`}
      />
      {invalidEmail ? (
        <span className="mt-2 block rounded-[8px] border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold leading-5 text-red-900">
          Email format is not valid. Please use an email like hello@example.com.
        </span>
      ) : checkState !== "idle" ? (
        <span className={`mt-2 block text-xs leading-5 ${toneByState[checkState]}`}>
          {messageByState[checkState]}
        </span>
      ) : null}
    </label>
  );
}

function StatusMessage({
  submitState,
  errorMessage,
  statusUrl,
}: {
  submitState: SubmitState;
  errorMessage: string;
  statusUrl: string;
}) {
  if (submitState === "success") {
    return null;
  }

  if (submitState === "submitting") {
    return <Status tone="warning">Uploading your photos and submitting your application. Please keep this page open.</Status>;
  }

  if (submitState === "error") {
    return (
      <Status tone="error">
        {errorMessage || "Something went wrong."}
        {statusUrl ? (
          <>
            {" "}
            <a href={statusUrl} className="font-semibold underline underline-offset-4">
              Check application status
            </a>
          </>
        ) : null}
      </Status>
    );
  }

  return null;
}


function ContactPlatformField({
  contactPlatform,
  otherContactPlatform,
  setContactPlatform,
  setOtherContactPlatform,
}: {
  contactPlatform: string;
  otherContactPlatform: string;
  setContactPlatform: (value: string) => void;
  setOtherContactPlatform: (value: string) => void;
}) {
  return (
    <div>
      <label className="block">
        <span className="text-sm font-semibold text-[#2d3842]">Contact or shop platform</span>
        <select
          name="contact_platform"
          value={contactPlatform}
          onChange={(event) => setContactPlatform(event.target.value)}
          className="field-control mt-2 w-full px-4 text-sm"
        >
          <option value="">No platform selected</option>
          {contactPlatformOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      {contactPlatform === "other" ? (
        <label className="mt-3 block">
          <span className="text-sm font-semibold text-[#2d3842]">Other platform name</span>
          <input
            name="other_contact_platform"
            value={otherContactPlatform}
            onChange={(event) => setOtherContactPlatform(event.target.value)}
            className="field-control mt-2 w-full px-4 text-sm"
            placeholder="Tell us the platform or contact method"
          />
        </label>
      ) : null}
      <span className="mt-2 block text-xs leading-5 text-[#626960]">
        Optional. Choose where customers should contact you or shop from you.
      </span>
    </div>
  );
}

function Status({ children, tone }: { children: React.ReactNode; tone: "success" | "warning" | "error" }) {
  const toneClass = {
    success: "border-[#cfd2ca] bg-[#dff9d9]/55 text-[#2d3842]",
    warning: "border-[#cfd2ca] bg-[#e5d7f7]/45 text-[#2d3842]",
    error: "border-red-200 bg-red-50 text-red-900",
  }[tone];

  return <p className={`rounded-[10px] border px-4 py-3 text-sm ${toneClass}`}>{children}</p>;
}
