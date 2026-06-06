"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArtistAvatarForm } from "@/components/ArtistAvatarForm";
import { ArtistProductsOverview } from "@/components/ArtistProductsOverview";
import { getSupabaseBrowserClient } from "@/lib/supabase";

export function ArtistDashboardShell() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [activePanel, setActivePanel] = useState<"profile" | "products" | "account">("profile");
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);

  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      if (!supabase) {
        setLoading(false);
        return;
      }

      const { data } = await supabase.auth.getSession();
      if (!mounted) {
        return;
      }

      setEmail(data.session?.user.email || "");
      setLoading(false);

      if (!data.session) {
        router.replace("/artist/login");
      }
    }

    loadSession();

    return () => {
      mounted = false;
    };
  }, [router, supabase]);

  async function signOut() {
    if (supabase) {
      await supabase.auth.signOut();
    }
    router.push("/artist/login");
    router.refresh();
  }

  return (
    <section className="section pastel-wash">
      <div>
        <div className="section-heading">
          <div>
            <p className="eyebrow">Artist Dashboard</p>
            <h1>Your artist workspace</h1>
          </div>
          <p>Manage your public profile and product submissions from one place.</p>
        </div>

        {!supabase ? (
          <p className="rounded-[8px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            Supabase is not configured yet. Artist login will work after auth settings are added.
          </p>
        ) : null}

        {loading ? (
          <div className="soft-card rounded-[10px] p-6">Loading your workspace...</div>
        ) : email ? (
          <div className="grid gap-5 lg:grid-cols-[16rem_1fr]">
            <aside className="soft-card self-start rounded-[10px] p-4">
              <p className="px-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#566c71]">Workspace</p>
              <div className="mt-3 grid gap-2">
                <PanelButton active={activePanel === "profile"} onClick={() => setActivePanel("profile")} label="1. Edit profile" />
                <PanelButton active={activePanel === "products"} onClick={() => setActivePanel("products")} label="2. Manage products" />
                <PanelButton active={activePanel === "account"} onClick={() => setActivePanel("account")} label="3. Account" />
              </div>
            </aside>

            {activePanel === "profile" ? (
            <div className="soft-card rounded-[10px] p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#566c71]">Signed in as</p>
              <h2 className="mt-2 text-2xl font-semibold text-[#2d3842]">{email}</h2>
              <p className="mt-4 leading-7 text-[#626960]">
                Edit the public profile visitors see on your artist page.
              </p>
              <ArtistAvatarForm />
            </div>
            ) : null}

            {activePanel === "products" ? (
              <ArtistProductsOverview />
            ) : null}

            {activePanel === "account" ? (
              <div className="soft-card rounded-[10px] p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#566c71]">Account</p>
                <h2 className="mt-2 text-2xl font-semibold text-[#2d3842]">{email}</h2>
                <ArtistPasswordChangeForm email={email} />
                <button onClick={signOut} className="studio-button studio-button-secondary mt-6">
                  Sign out
                </button>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="soft-card rounded-[10px] p-6">
            <p className="leading-7 text-[#626960]">Redirecting to artist login...</p>
            <Link href="/artist/login" className="studio-button studio-button-primary mt-4">
              Go to login
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

type PasswordStatus = "idle" | "saving" | "success" | "error";

function ArtistPasswordChangeForm({ email }: { email: string }) {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<PasswordStatus>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase) {
      setStatus("error");
      setMessage("Password changes are not configured yet.");
      return;
    }

    if (!currentPassword) {
      setStatus("error");
      setMessage("Enter your current password.");
      return;
    }

    if (newPassword.length < 8) {
      setStatus("error");
      setMessage("Use at least 8 characters for your new password.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatus("error");
      setMessage("The new passwords do not match.");
      return;
    }

    if (currentPassword === newPassword) {
      setStatus("error");
      setMessage("Choose a new password that is different from your current password.");
      return;
    }

    setStatus("saving");
    setMessage("Saving your new password...");

    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email,
      password: currentPassword,
    });

    if (verifyError) {
      setStatus("error");
      setMessage("The current password is not correct.");
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      setStatus("error");
      setMessage(error.message || "Password could not be changed. Try again or use forgot password.");
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setStatus("success");
    setMessage("Password changed. Use the new password next time you sign in.");
  }

  const isSaving = status === "saving";

  return (
    <form onSubmit={handleSubmit} className="mt-6 max-w-2xl rounded-[10px] border border-[#d9ddd2] bg-white/70 p-5">
      <div>
        <h3 className="text-lg font-semibold text-[#2d3842]">Change password</h3>
        <p className="mt-2 text-sm leading-6 text-[#626960]">
          Enter your current password before choosing a new one.
        </p>
      </div>

      {message ? (
        <p
          className={`mt-4 rounded-[8px] border px-4 py-3 text-sm ${
            status === "success"
              ? "border-teal-200 bg-teal-50 text-teal-950"
              : status === "error"
                ? "border-red-200 bg-red-50 text-red-950"
                : "border-[#d9ddd2] bg-[#f8faf5] text-[#626960]"
          }`}
          aria-live="polite"
        >
          {message}
        </p>
      ) : null}

      <div className="mt-5 grid gap-4">
        <label className="block">
          <span className="text-sm font-semibold text-[#2d3842]">Current password</span>
          <input
            type="password"
            required
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            disabled={isSaving}
            className="field-control mt-2 w-full px-3 disabled:opacity-60"
            autoComplete="current-password"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-[#2d3842]">New password</span>
          <input
            type="password"
            required
            minLength={8}
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            disabled={isSaving}
            className="field-control mt-2 w-full px-3 disabled:opacity-60"
            autoComplete="new-password"
            placeholder="At least 8 characters"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-[#2d3842]">Confirm new password</span>
          <input
            type="password"
            required
            minLength={8}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            disabled={isSaving}
            className="field-control mt-2 w-full px-3 disabled:opacity-60"
            autoComplete="new-password"
          />
        </label>
      </div>

      <button type="submit" disabled={isSaving} className="studio-button studio-button-primary mt-5 w-full disabled:opacity-60 sm:w-auto">
        {isSaving ? "Saving..." : "Save new password"}
      </button>
      <p className="mt-4 text-xs leading-5 text-[#626960]">
        If you do not know your current password, use forgot password on the login page.
      </p>
    </form>
  );
}

function PanelButton({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-[8px] px-3 py-3 text-left text-sm font-semibold transition ${
        active ? "bg-[#2d3842] text-white" : "text-[#626960] hover:bg-[#f1f5ef] hover:text-[#2d3842]"
      }`}
    >
      {label}
    </button>
  );
}
