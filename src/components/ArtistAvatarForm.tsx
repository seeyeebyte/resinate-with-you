"use client";

import type { FormEvent, ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CountrySelectField } from "@/components/CountrySelectField";
import { contactPlatformOptions } from "@/components/PlatformLinks";
import { ProvinceStateField } from "@/components/ProvinceStateField";
import {
  instagramUsernameFromInput,
  instagramUsernamePattern,
  isInstagramUrl,
  isValidEmail,
  normalizeInstagramInput,
} from "@/lib/applications";
import { countryOptions } from "@/lib/country-options";
import { regionOptionsByCountryCode } from "@/lib/region-options-by-country";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { categories as productCategories } from "@/lib/site";

type ArtistProfile = {
  id: string;
  brand_name: string | null;
  contact_name?: string | null;
  contact_email?: string | null;
  slug: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  country?: string | null;
  city?: string | null;
  instagram_url?: string | null;
  website_url?: string | null;
  contact_link_label?: string | null;
  shop_url?: string | null;
  categories?: string[] | null;
  accepts_custom?: boolean | null;
  ships_international?: boolean | null;
};

const maxAvatarSize = 2 * 1024 * 1024;

export function ArtistAvatarForm() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [artist, setArtist] = useState<ArtistProfile | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    brandName: "",
    contactName: "",
    contactEmail: "",
    country: "",
    city: "",
    bio: "",
    instagramUrl: "",
    websiteUrl: "",
    contactPlatform: "wechat",
    otherContactPlatform: "",
    shopUrl: "",
    categories: [] as string[],
    acceptsCustom: false,
    shipsInternational: false,
  });

  const getAccessToken = useCallback(async () => {
    if (!supabase) {
      return "";
    }

    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || "";
  }, [supabase]);

  useEffect(() => {
    let mounted = true;

    async function loadArtist() {
      const token = await getAccessToken();

      if (!token) {
        return;
      }

      const response = await fetch("/api/artist/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (!mounted) {
        return;
      }

      if (response.ok) {
        setArtist(data.artist);
        setPreviewUrl(data.artist?.avatar_url || "");
        setProfile(profileFromArtist(data.artist));
      }
    }

    loadArtist();

    return () => {
      mounted = false;
    };
  }, [getAccessToken]);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!profile.brandName.trim()) {
      setError("Brand name is required.");
      return;
    }

    const contactLinkLabel = selectedContactLabel(profile.contactPlatform, profile.otherContactPlatform);

    if (profile.contactPlatform === "other" && !contactLinkLabel) {
      setError("Add the contact or shop platform name.");
      return;
    }

    if (profile.contactEmail.trim() && !isValidEmail(profile.contactEmail.trim())) {
      setError("Public contact email must be a valid email address.");
      return;
    }

    const instagramUrl = normalizeInstagramInput(profile.instagramUrl);

    if (profile.instagramUrl.trim() && (!instagramUrl || !isInstagramUrl(instagramUrl))) {
      setError("Instagram username must use letters, numbers, periods, or underscores only.");
      return;
    }

    const token = await getAccessToken();

    if (!token) {
      setError("Please sign in again before saving your avatar.");
      return;
    }

    const formData = new FormData();
    formData.append("brand_name", profile.brandName);
    formData.append("contact_name", profile.contactName);
    formData.append("contact_email", profile.contactEmail);
    formData.append("country", profile.country);
    formData.append("city", profile.city);
    formData.append("bio", profile.bio);
    formData.append("instagram_url", instagramUrl || "");
    formData.append("website_url", profile.websiteUrl);
    formData.append("contact_link_label", contactLinkLabel);
    formData.append("shop_url", profile.shopUrl);
    formData.append("categories", profile.categories.join(", "));
    if (profile.acceptsCustom) {
      formData.append("accepts_custom", "on");
    }
    if (profile.shipsInternational) {
      formData.append("ships_international", "on");
    }
    if (file) {
      formData.append("avatar", file);
    }
    setSaving(true);

    const response = await fetch("/api/artist/profile", {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    const data = await response.json();
    setSaving(false);

    if (!response.ok) {
      setError(data.error || "Avatar could not be saved.");
      return;
    }

    setArtist(data.artist);
    setPreviewUrl(data.artist?.avatar_url || previewUrl);
    setProfile(profileFromArtist(data.artist));
    setFile(null);
    setMessage("Profile saved.");
  }

  function chooseFile(nextFile: File | null) {
    setError("");
    setMessage("");

    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    if (nextFile && nextFile.size > maxAvatarSize) {
      setFile(null);
      setPreviewUrl(artist?.avatar_url || "");
      setError("Avatar must be 2 MB or smaller.");
      return;
    }

    setFile(nextFile);

    if (nextFile) {
      setPreviewUrl(URL.createObjectURL(nextFile));
    } else {
      setPreviewUrl(artist?.avatar_url || "");
    }
  }

  function handleCountryChange(value: string) {
    setProfile((current) => ({ ...current, country: value, city: "" }));
  }

  function toggleCategory(category: string) {
    setProfile((current) => ({
      ...current,
      categories: current.categories.includes(category)
        ? current.categories.filter((item) => item !== category)
        : [...current.categories, category],
    }));
  }

  const provinceOptions = regionOptionsForCountry(profile.country);

  return (
    <form onSubmit={saveProfile} noValidate className="mt-6 rounded-[8px] border border-[#d9ddd2] bg-white/70 p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-[22px] border border-[#d9ddd2] bg-[#f5fbff]">
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt="Artist avatar preview" className="h-full w-full object-cover" />
          ) : (
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#566c71]">Avatar</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-[#2d3842]">Public profile</p>
          <p className="mt-1 text-sm leading-6 text-[#626960]">Set the image shown on your public artist profile. JPG, PNG, or WebP, max 2 MB.</p>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(event) => chooseFile(event.target.files?.[0] ?? null)}
            className="mt-3 block w-full text-sm text-[#626960]"
          />
        </div>
      </div>
      <p className="mt-5 rounded-[8px] bg-[#f5fbff] px-4 py-3 text-sm leading-6 text-[#626960]">
        Fields marked with * are required. Fields without * can be left blank.
      </p>
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <Label title="Brand name *">
          <input
            value={profile.brandName}
            onChange={(event) => setProfile((current) => ({ ...current, brandName: event.target.value }))}
            className="field-control mt-2 w-full px-3"
            maxLength={120}
          />
        </Label>
        <Label title="Contact name">
          <input
            value={profile.contactName}
            onChange={(event) => setProfile((current) => ({ ...current, contactName: event.target.value }))}
            className="field-control mt-2 w-full px-3"
            maxLength={120}
          />
        </Label>
        <Label title="Public contact email">
          <input
            value={profile.contactEmail}
            onChange={(event) => setProfile((current) => ({ ...current, contactEmail: event.target.value }))}
            type="email"
            inputMode="email"
            autoCapitalize="none"
            autoCorrect="off"
            className="field-control mt-2 w-full px-3"
            placeholder="hello@example.com"
          />
          <p className="mt-2 text-xs leading-5 text-[#626960]">This can be different from your login email.</p>
        </Label>
        <div>
          <p className="text-sm font-semibold text-[#2d3842]">Product categories</p>
          <p className="mt-1 text-xs leading-5 text-[#626960]">Choose product types. Style tags are managed per product.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {productCategories.map((category) => {
              const isSelected = profile.categories.includes(category);

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
                    checked={isSelected}
                    onChange={() => toggleCategory(category)}
                    className="h-4 w-4 shrink-0 accent-[#2d3842]"
                  />
                  <span>{category}</span>
                </label>
              );
            })}
          </div>
        </div>
        <CountrySelectField
          value={profile.country}
          onChange={handleCountryChange}
          className="field-control mt-2 w-full px-3"
          helper="Choose from the list. Province or state can be typed below."
        />
        <ProvinceStateField
          value={profile.city}
          onChange={(value) => setProfile((current) => ({ ...current, city: value }))}
          options={provinceOptions}
          helper="City-level detail is not needed. Leave blank if it does not apply."
        />
        <Label title="Instagram username">
          <input
            value={profile.instagramUrl}
            onChange={(event) => setProfile((current) => ({ ...current, instagramUrl: event.target.value }))}
            type="text"
            pattern={instagramUsernamePattern}
            className="field-control mt-2 w-full px-3"
            placeholder="yourname"
          />
          <p className="mt-2 text-xs leading-5 text-[#626960]">Enter your Instagram username. We will link it to your profile.</p>
        </Label>
        <Label title="Website URL">
          <input
            value={profile.websiteUrl}
            onChange={(event) => setProfile((current) => ({ ...current, websiteUrl: event.target.value }))}
            type="url"
            className="field-control mt-2 w-full px-3"
            placeholder="https://your-site.com"
          />
        </Label>
        <div>
          <Label title="Contact or shop platform">
            <select
              value={profile.contactPlatform}
              onChange={(event) => setProfile((current) => ({ ...current, contactPlatform: event.target.value }))}
              className="field-control mt-2 w-full px-3"
            >
              <option value="">No platform selected</option>
              {contactPlatformOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Label>
          {profile.contactPlatform === "other" ? (
            <Label title="Other platform name" className="mt-3">
              <input
                value={profile.otherContactPlatform}
                onChange={(event) => setProfile((current) => ({ ...current, otherContactPlatform: event.target.value }))}
                className="field-control mt-2 w-full px-3"
                placeholder="Tell us the platform or contact method"
              />
            </Label>
          ) : null}
          <p className="mt-2 text-xs leading-5 text-[#626960]">Choose where customers should contact you or shop from you.</p>
        </div>
        <Label title="Actual account or shop link">
          <input
            value={profile.shopUrl}
            onChange={(event) => setProfile((current) => ({ ...current, shopUrl: event.target.value }))}
            className="field-control mt-2 w-full px-3"
            placeholder="@yourstudio or https://..."
          />
          <p className="mt-2 text-xs leading-5 text-[#626960]">Use the account name or link customers should use.</p>
        </Label>
      </div>
      <Label title="Short bio" className="mt-4">
        <textarea
          value={profile.bio}
          onChange={(event) => setProfile((current) => ({ ...current, bio: event.target.value }))}
          className="field-control mt-2 min-h-32 w-full px-3 py-3"
          maxLength={500}
          placeholder="Tell visitors about your work, materials, style, and custom options."
        />
      </Label>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="flat-panel flex items-center gap-3 rounded-[8px] px-4 py-4 text-[#626960]">
          <input
            checked={profile.acceptsCustom}
            onChange={(event) => setProfile((current) => ({ ...current, acceptsCustom: event.target.checked }))}
            type="checkbox"
            className="h-5 w-5"
          />
          <span>Accepts custom orders</span>
        </label>
        <label className="flat-panel flex items-center gap-3 rounded-[8px] px-4 py-4 text-[#626960]">
          <input
            checked={profile.shipsInternational}
            onChange={(event) => setProfile((current) => ({ ...current, shipsInternational: event.target.checked }))}
            type="checkbox"
            className="h-5 w-5"
          />
          <span>Ships internationally</span>
        </label>
      </div>
      {error ? <p className="mt-3 rounded-[8px] border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-950">{error}</p> : null}
      {message ? <p className="mt-3 rounded-[8px] border border-teal-200 bg-teal-50 px-3 py-2 text-sm text-teal-950">{message}</p> : null}
      <button type="submit" disabled={saving} className="studio-button studio-button-secondary mt-4">
        {saving ? "Saving..." : "Save public profile"}
      </button>
    </form>
  );
}

function Label({ title, children, className = "" }: { title: string; children: ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="text-sm font-semibold text-[#2d3842]">{title}</span>
      {children}
    </label>
  );
}

function profileFromArtist(artist: ArtistProfile | null | undefined) {
  const contactPlatform = contactPlatformFromLabel(artist?.contact_link_label || "");

  return {
    brandName: artist?.brand_name || "",
    contactName: artist?.contact_name || "",
    contactEmail: artist?.contact_email || "",
    country: artist?.country || "",
    city: artist?.city || "",
    bio: artist?.bio || "",
    instagramUrl: instagramUsernameFromInput(artist?.instagram_url || ""),
    websiteUrl: artist?.website_url || "",
    contactPlatform: contactPlatform.value,
    otherContactPlatform: contactPlatform.otherLabel,
    shopUrl: artist?.shop_url || "",
    categories: artist?.categories?.filter((category) => productCategories.includes(category)) || [],
    acceptsCustom: Boolean(artist?.accepts_custom),
    shipsInternational: Boolean(artist?.ships_international),
  };
}

function regionOptionsForCountry(country: string) {
  const normalizedCountry = country.trim().toLowerCase();
  const countryOption = countryOptions.find(
    (option) => option.value.toLowerCase() === normalizedCountry || option.label.toLowerCase() === normalizedCountry,
  );

  return countryOption?.code ? regionOptionsByCountryCode[countryOption.code] || [] : [];
}

function contactPlatformFromLabel(label: string) {
  const match = contactPlatformOptions.find((option) => option.label.toLowerCase() === label.trim().toLowerCase());

  if (match) {
    return { value: match.value, otherLabel: "" };
  }

  return { value: label ? "other" : "", otherLabel: label };
}

function selectedContactLabel(contactPlatform: string, otherContactPlatform: string) {
  if (!contactPlatform) {
    return "";
  }

  if (contactPlatform === "other") {
    return otherContactPlatform.trim();
  }

  return contactPlatformOptions.find((option) => option.value === contactPlatform)?.label || "";
}
