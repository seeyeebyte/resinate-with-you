"use client";

import { useId, useMemo, useState } from "react";

export type LocationOption = {
  label: string;
  value: string;
  code: string;
};

export function SearchableLocationField({
  label,
  name,
  options,
  value,
  onChange,
  onSelect,
  onClear,
  required = false,
  placeholder,
  helper,
  loading = false,
}: {
  label: string;
  name: string;
  options: LocationOption[];
  value: string;
  onChange: (value: string) => void;
  onSelect: (option: LocationOption) => void;
  onClear: () => void;
  required?: boolean;
  placeholder?: string;
  helper?: string;
  loading?: boolean;
}) {
  const fieldId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = useMemo(() => findLocationOptionByLabel(options, value), [options, value]);
  const visibleOptions = useMemo(() => {
    const normalizedQuery = normalizeLocationText(value);
    const matches = normalizedQuery
      ? options.filter((option) => {
          const label = normalizeLocationText(option.label);
          const optionValue = normalizeLocationText(option.value);
          const code = option.code.toLowerCase();

          return label.includes(normalizedQuery) || optionValue.includes(normalizedQuery) || code.includes(normalizedQuery);
        })
      : options;

    return matches.sort((left, right) => {
      const leftStartsWith = left.label.toLowerCase().startsWith(normalizedQuery);
      const rightStartsWith = right.label.toLowerCase().startsWith(normalizedQuery);

      if (leftStartsWith !== rightStartsWith) {
        return leftStartsWith ? -1 : 1;
      }

      return left.label.localeCompare(right.label);
    });
  }, [options, value]);

  function handleTextChange(nextValue: string) {
    onChange(nextValue);
    setIsOpen(true);

    const exactOption = findLocationOptionByLabel(options, nextValue);

    if (exactOption) {
      onSelect(exactOption);
    }
  }

  function selectOption(option: LocationOption) {
    onSelect(option);
    setIsOpen(false);
  }

  const shouldShowSuggestions = !loading && options.length > 0 && isOpen && visibleOptions.length > 0;
  const suggestionLimit = value.trim() ? 8 : 12;

  return (
    <div>
      <label htmlFor={fieldId} className="text-sm font-semibold text-[#2d3842]">
        {label}
        {required ? " *" : ""}
      </label>
      <div className="relative mt-2" data-location-picker-version="native-datalist-v1">
        <input
          id={fieldId}
          name={name}
          required={required}
          value={value}
          onChange={(event) => {
            handleTextChange(event.target.value);
          }}
          onFocus={() => {
            setIsOpen(true);
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setIsOpen(false);
            }
          }}
          placeholder={placeholder}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          className="field-control w-full px-4 pr-16 text-sm"
        />
        {value ? (
          <button
            type="button"
            onClick={() => {
              onClear();
              setIsOpen(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full px-2 py-1 text-xs font-semibold text-[#626960] transition hover:bg-[#eef4ee] hover:text-[#2d3842]"
            aria-label={`Clear ${label.toLowerCase()}`}
          >
            Clear
          </button>
        ) : null}
      </div>
      {loading ? <div className="mt-2 rounded-[10px] border border-[#d9ddd2] bg-white px-3 py-3 text-sm text-[#626960]">Loading suggestions...</div> : null}
      {shouldShowSuggestions ? (
        <div className="mt-2 overflow-hidden rounded-[12px] border border-[#d9ddd2] bg-white shadow-sm">
          {visibleOptions.slice(0, suggestionLimit).map((option) => (
            <button
              key={`${option.code}-${option.label}`}
              type="button"
              onPointerDown={(event) => {
                event.preventDefault();
                selectOption(option);
              }}
              onClick={() => selectOption(option)}
              className="flex w-full items-center justify-between gap-3 border-b border-[#eef0eb] px-4 py-3 text-left text-sm text-[#2d3842] last:border-b-0 active:bg-[#e9f6fb]"
            >
              <span className="font-semibold">{option.label}</span>
              {option.code ? <span className="text-xs font-bold uppercase tracking-[0.14em] text-[#8b958b]">{option.code}</span> : null}
            </button>
          ))}
        </div>
      ) : null}
      {!loading && value.trim() && options.length > 0 && visibleOptions.length === 0 ? (
        <div className="mt-2 rounded-[10px] border border-[#d9ddd2] bg-white px-3 py-3 text-sm text-[#626960]">No matching suggestions. You can keep typing your own value.</div>
      ) : null}
      {!loading && selectedOption ? <span className="mt-2 block text-xs font-semibold text-[#566c71]">Matched: {selectedOption.code ? `${selectedOption.label} (${selectedOption.code})` : selectedOption.label}</span> : null}
      {helper ? <span className="mt-2 block text-xs leading-5 text-[#626960]">{helper}</span> : null}
    </div>
  );
}

export function findLocationOptionByLabel(options: LocationOption[], label: string) {
  const normalizedLabel = normalizeLocationText(label);

  return options.find((option) => normalizeLocationText(option.label) === normalizedLabel || normalizeLocationText(option.value) === normalizedLabel) || null;
}

function normalizeLocationText(text: string) {
  return text
    .trim()
    .replace(/\s*\([^)]+\)\s*$/, "")
    .toLowerCase();
}
