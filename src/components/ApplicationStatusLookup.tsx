"use client";

import { FormEvent, useState } from "react";
import { isValidEmail } from "@/lib/applications";

type LookupState = "idle" | "loading" | "found" | "empty" | "error";

type StatusResult = {
  brand_name: string;
  status: string;
  status_label: string;
  admin_notes: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export function ApplicationStatusLookup() {
  const [state, setState] = useState<LookupState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [application, setApplication] = useState<StatusResult | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("loading");
    setErrorMessage("");
    setApplication(null);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "").trim().toLowerCase();

    if (!isValidEmail(email)) {
      setState("error");
      setErrorMessage("Enter a valid email address, such as hello@example.com.");
      return;
    }

    let response: Response;

    try {
      response = await fetch(`/api/applications/status?email=${encodeURIComponent(email)}`);
    } catch {
      setState("error");
      setErrorMessage("We could not check your application status. Please check your connection and try again.");
      return;
    }

    let result: { error?: string; application?: StatusResult | null } = {};

    try {
      result = await response.json();
    } catch {
      result = {};
    }

    if (!response.ok) {
      setState("error");
      setErrorMessage(result.error || "We could not check your application status.");
      return;
    }

    if (!result.application) {
      setState("empty");
      return;
    }

    setApplication(result.application);
    setState("found");
  }

  return (
    <div className="soft-card rounded-[8px] p-5 sm:p-7">
      <form onSubmit={handleSubmit} noValidate className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <label>
          <span className="text-sm font-semibold text-[#2d3842]">Application email</span>
          <input
            name="email"
            type="email"
            required
            inputMode="email"
            autoCapitalize="none"
            autoCorrect="off"
            className="mt-2 min-h-12 w-full rounded-[6px] border border-[#d9ddd2] bg-white px-4 text-sm outline-none transition focus:border-teal-700"
            placeholder="you@example.com"
          />
        </label>
        <button type="submit" disabled={state === "loading"} className="studio-button studio-button-primary self-end disabled:opacity-60">
          {state === "loading" ? "Checking..." : "Check status"}
        </button>
      </form>

      {state === "found" && application ? (
        <div className="mt-6 rounded-[8px] border border-teal-200 bg-teal-50 p-4">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-teal-950">
            {application.status_label}
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-[#2d3842]">{application.brand_name}</h2>
          <p className="mt-2 text-sm leading-6 text-[#626960]">{statusMessage(application.status)}</p>
          {application.admin_notes ? (
            <p className="mt-4 rounded-[8px] bg-white/70 p-3 text-sm leading-6 text-[#626960]">
              <span className="font-semibold text-[#2d3842]">Review note: </span>
              {application.admin_notes}
            </p>
          ) : null}
        </div>
      ) : null}

      {state === "empty" ? (
        <p className="mt-5 rounded-[8px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          We could not find an application for that email address.
        </p>
      ) : null}

      {state === "error" ? (
        <p className="mt-5 rounded-[8px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-950">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}

function statusMessage(status: string) {
  const messages: Record<string, string> = {
    submitted: "We received your application. It is waiting for review.",
    reviewing: "Your application is being reviewed.",
    needs_info: "We need a little more information before we can finish the review.",
    approved: "Your application was approved. We will share the next steps for your artist profile.",
    rejected: "We are not able to approve your application at this stage.",
  };

  return messages[status] || "We are reviewing your application.";
}
