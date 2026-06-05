"use client";

import { useEffect, useMemo, useState } from "react";
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
                <div className="mt-5 grid gap-3 text-sm leading-6 text-[#626960]">
                  <p>Password changes are handled through Supabase email login. A reset-password flow can be added next if needed.</p>
                  <p>Sign out when you are finished using a shared computer.</p>
                </div>
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
