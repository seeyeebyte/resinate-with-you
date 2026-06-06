"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase";

type FormStatus = "checking" | "ready" | "saving" | "saved" | "error";

export function ArtistSetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [status, setStatus] = useState<FormStatus>("checking");
  const [message, setMessage] = useState("Checking your password link...");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    let mounted = true;

    async function prepareSession() {
      if (!supabase) {
        setStatus("error");
        setMessage("Artist password setup is not configured yet.");
        return;
      }

      const code = searchParams.get("code");

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          setStatus("error");
          setMessage("This password link is invalid or has expired. Request a new link from the login page.");
          return;
        }
      }

      const { data } = await supabase.auth.getSession();

      if (!mounted) {
        return;
      }

      if (!data.session) {
        setStatus("error");
        setMessage("This password link is invalid or has expired. Request a new link from the login page.");
        return;
      }

      setStatus("ready");
      setMessage("Choose a password for your artist dashboard.");
    }

    prepareSession();

    return () => {
      mounted = false;
    };
  }, [searchParams, supabase]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase) {
      setStatus("error");
      setMessage("Artist password setup is not configured yet.");
      return;
    }

    if (password.length < 8) {
      setStatus("error");
      setMessage("Use at least 8 characters for your password.");
      return;
    }

    if (password !== confirmPassword) {
      setStatus("error");
      setMessage("The two passwords do not match.");
      return;
    }

    setStatus("saving");
    setMessage("Saving your password...");

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setStatus("error");
      setMessage(error.message || "Password could not be saved. Request a new link and try again.");
      return;
    }

    setStatus("saved");
    setMessage("Password saved. Opening your artist dashboard...");
    window.setTimeout(() => router.replace("/artist/dashboard"), 900);
  }

  const canEdit = status === "ready" || status === "error";

  return (
    <form onSubmit={handleSubmit} className="soft-card rounded-[10px] p-6 sm:p-8">
      <div>
        <p className="eyebrow">Artist Account</p>
        <h1 className="display-heading mt-4 text-4xl leading-tight">Set your password.</h1>
        <p className="mt-4 leading-7 text-[#626960]">
          Use the secure email link from Resinate With You to create or reset your artist dashboard password.
        </p>
      </div>

      <p
        className={`mt-6 rounded-[8px] border px-4 py-3 text-sm ${
          status === "saved"
            ? "border-teal-200 bg-teal-50 text-teal-950"
            : status === "error"
              ? "border-red-200 bg-red-50 text-red-950"
              : "border-[#d9ddd2] bg-[#f8faf5] text-[#626960]"
        }`}
      >
        {message}
      </p>

      <label className="mt-5 block">
        <span className="text-sm font-semibold text-[#2d3842]">New password</span>
        <input
          type="password"
          required
          minLength={8}
          disabled={!canEdit}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="field-control mt-2 w-full px-3 disabled:opacity-60"
          placeholder="At least 8 characters"
        />
      </label>

      <label className="mt-4 block">
        <span className="text-sm font-semibold text-[#2d3842]">Confirm password</span>
        <input
          type="password"
          required
          minLength={8}
          disabled={!canEdit}
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          className="field-control mt-2 w-full px-3 disabled:opacity-60"
          placeholder="Enter it again"
        />
      </label>

      <button type="submit" disabled={!canEdit} className="studio-button studio-button-primary mt-6 w-full disabled:opacity-60">
        {status === "saving" ? "Saving..." : "Save password"}
      </button>
    </form>
  );
}
