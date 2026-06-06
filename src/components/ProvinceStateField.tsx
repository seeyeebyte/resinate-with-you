"use client";

import { useEffect, useId, useMemo, useState } from "react";

type ProvinceOption = {
  label: string;
  value: string;
};

type ProvinceStateFieldProps = {
  value: string;
  onChange: (value: string) => void;
  options: ProvinceOption[];
  name?: string;
  helper?: string;
};

export function ProvinceStateField({
  value,
  onChange,
  options,
  name,
  helper = "City-level detail is not needed. Leave blank if it does not apply.",
}: ProvinceStateFieldProps) {
  const dialogTitleId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return options.slice(0, 40);
    }

    return options
      .filter((option) => {
        const label = option.label.toLowerCase();
        const optionValue = option.value.toLowerCase();

        return label.includes(normalizedQuery) || optionValue.includes(normalizedQuery);
      })
      .slice(0, 40);
  }, [options, query]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, value]);

  function chooseRegion(region: string) {
    onChange(region);
    setQuery(region);
    setIsOpen(false);
  }

  function clearRegion() {
    onChange("");
    setQuery("");
    setIsOpen(false);
  }

  function openRegionDialog() {
    setQuery(value);
    setIsOpen(true);
  }

  return (
    <div className="block">
      <span className="text-sm font-semibold text-[#2d3842]">Province / state</span>
      {name ? <input type="hidden" name={name} value={value} /> : null}
      <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_auto]">
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="field-control w-full px-4 text-sm"
          placeholder="Province, state, prefecture, or region"
          autoComplete="address-level1"
        />
        <button
          type="button"
          onClick={openRegionDialog}
          className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-[#d9ddd2] bg-white px-5 text-sm font-semibold text-[#2d3842] transition hover:border-[#9ba69d]"
        >
          Choose region
        </button>
      </div>
      {value ? (
        <button
          type="button"
          onClick={clearRegion}
          className="mt-2 text-xs font-semibold text-[#626960] underline decoration-[#d9ddd2] underline-offset-4"
        >
          Clear province / state
        </button>
      ) : null}
      {helper ? <p className="mt-2 text-xs leading-5 text-[#626960]">{helper}</p> : null}

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#18232c]/35 px-3 py-4 sm:items-center">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={dialogTitleId}
            className="max-h-[85vh] w-full max-w-xl overflow-hidden rounded-[16px] border border-[#d9ddd2] bg-white shadow-2xl"
          >
            <div className="border-b border-[#e5e9df] p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 id={dialogTitleId} className="text-lg font-semibold text-[#2d3842]">
                    Choose province / state
                  </h2>
                  <p className="mt-1 text-xs leading-5 text-[#626960]">
                    Search suggestions, or type your own region below.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-full border border-[#d9ddd2] px-3 py-1 text-sm font-semibold text-[#2d3842]"
                >
                  Close
                </button>
              </div>
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="field-control mt-4 w-full px-4 text-sm"
                placeholder="Search or type province / state"
                autoComplete="off"
              />
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => chooseRegion(query.trim())}
                  disabled={!query.trim()}
                  className="rounded-full bg-[#2d3842] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#a8b0b5]"
                >
                  Use typed region
                </button>
                <button
                  type="button"
                  onClick={clearRegion}
                  className="rounded-full border border-[#d9ddd2] bg-white px-4 py-2 text-sm font-semibold text-[#2d3842]"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="max-h-[45vh] overflow-y-auto p-3">
              {filteredOptions.length ? (
                <div className="grid gap-2">
                  {filteredOptions.map((option) => (
                    <button
                      key={`${option.label}-${option.value}`}
                      type="button"
                      onPointerDown={(event) => {
                        event.preventDefault();
                        chooseRegion(option.value);
                      }}
                      className="flex min-h-[48px] items-center justify-between rounded-[10px] px-4 py-3 text-left text-sm font-semibold text-[#2d3842] transition hover:bg-[#f1fbef] focus:bg-[#f1fbef]"
                    >
                      <span>{option.label}</span>
                      {option.value !== option.label ? (
                        <span className="text-xs uppercase tracking-[0.12em] text-[#7b857b]">{option.value}</span>
                      ) : null}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="rounded-[10px] bg-[#f5fbff] p-4 text-sm leading-6 text-[#626960]">
                  No matching suggestions. You can use the typed region.
                </p>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
