"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import type { Session } from "@supabase/supabase-js";
import { isValidEmail } from "@/lib/applications";
import { getSupabaseBrowserClient, persistSupabaseBrowserSession } from "@/lib/supabase";

export function ArtistLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");
  const supabase = getSupabaseBrowserClient();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!isValidEmail(normalizedEmail)) {
      setStatus("error");
      setMessage("Enter a valid email address.");
      return;
    }

    if (!password) {
      setStatus("error");
      setMessage("Enter your password.");
      return;
    }

    if (!supabase) {
      setStatus("error");
      setMessage("Artist login is not configured yet.");
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 20000);

    try {
      const response = await fetch("/api/artist/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: normalizedEmail,
          password,
        }),
        signal: controller.signal,
      });
      const payload = (await response.json()) as { error?: string; session?: Session };

      if (!response.ok || !payload.session) {
        setStatus("error");
        setMessage(payload.error || "Unable to sign in. Check your email and password.");
        return;
      }

      if (!persistSupabaseBrowserSession(payload.session)) {
        setStatus("error");
        setMessage("This browser could not save the login session. Check that private browsing or storage restrictions are disabled.");
        return;
      }

      window.location.assign("/artist/dashboard");
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof DOMException && error.name === "AbortError"
          ? "Login timed out. Check that your phone and computer are still on the same network, then try again."
          : "Could not connect to the login service. Check your connection and try again.",
      );
    } finally {
      window.clearTimeout(timeout);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="soft-card rounded-[10px] p-6 sm:p-8">
      <div>
        <p className="eyebrow">Artist Login</p>
        <h1 className="display-heading mt-4 text-4xl leading-tight">Manage your artist space.</h1>
        <p className="mt-4 leading-7 text-[#626960]">
          Approved artists can sign in with email and password to manage their profile and future product submissions.
        </p>
      </div>
      <label className="mt-7 block">
        <span className="text-sm font-semibold text-[#2d3842]">Email</span>
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="field-control mt-2 w-full px-3"
          placeholder="artist@example.com"
        />
      </label>
      <label className="mt-4 block">
        <span className="text-sm font-semibold text-[#2d3842]">Password</span>
        <input
          type="password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="field-control mt-2 w-full px-3"
          placeholder="Your password"
        />
      </label>
      {message ? (
        <p className="mt-4 rounded-[8px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-950">{message}</p>
      ) : null}
      <button type="submit" disabled={status === "loading"} className="studio-button studio-button-primary mt-6 w-full disabled:opacity-60">
        {status === "loading" ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
