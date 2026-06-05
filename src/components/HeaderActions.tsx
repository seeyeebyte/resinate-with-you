"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { headerContent } from "@/lib/customization";
import { getSupabaseBrowserClient } from "@/lib/supabase";

export function HeaderActions() {
  const [signedIn, setSignedIn] = useState(false);
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);

  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      if (!supabase) {
        return;
      }

      const { data } = await supabase.auth.getSession();

      if (mounted) {
        setSignedIn(Boolean(data.session));
      }
    }

    loadSession();

    const subscription = supabase?.auth.onAuthStateChange((_event, session) => {
      setSignedIn(Boolean(session));
    });

    return () => {
      mounted = false;
      subscription?.data.subscription.unsubscribe();
    };
  }, [supabase]);

  if (signedIn) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/artist/dashboard" className="studio-button studio-button-secondary hidden min-h-0 px-4 py-2 sm:inline-flex">
          Artist Dashboard
        </Link>
        <Link href="/artist/products/new" className="studio-button studio-button-primary min-h-0 px-4 py-2">
          Add product
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link href="/artist/login" className="studio-button studio-button-secondary hidden min-h-0 px-4 py-2 sm:inline-flex">
        {headerContent.loginLabel}
      </Link>
      <Link href="/apply" className="studio-button studio-button-primary min-h-0 px-4 py-2">
        {headerContent.primaryCtaLabel}
      </Link>
    </div>
  );
}
