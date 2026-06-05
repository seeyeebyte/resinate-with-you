"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { maxProductStyleTags, productStyleTagOptions, themeConfig } from "@/lib/customization";

type ProductStyleTagPickerProps = {
  name?: string;
  defaultValue?: string | string[];
};

export function ProductStyleTagPicker({ name = "tags", defaultValue = "" }: ProductStyleTagPickerProps) {
  const inputId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const initialTags = useMemo(() => normalizeTags(defaultValue), [defaultValue]);
  const [selectedTags, setSelectedTags] = useState(() => initialTags);
  const [customValue, setCustomValue] = useState("");

  useEffect(() => {
    const form = rootRef.current?.closest("form");

    if (!form) {
      return;
    }

    function handleReset() {
      setSelectedTags(initialTags);
      setCustomValue("");
    }

    form.addEventListener("reset", handleReset);
    return () => form.removeEventListener("reset", handleReset);
  }, [initialTags]);

  function toggleTag(tag: string) {
    setSelectedTags((current) => {
      if (hasTag(current, tag)) {
        return current.filter((item) => item.toLowerCase() !== tag.toLowerCase());
      }

      return normalizeTags([...current, tag]);
    });
  }

  function addCustomTags() {
    const nextTags = normalizeTags([...selectedTags, ...splitTags(customValue)]);
    setSelectedTags(nextTags);
    setCustomValue("");
  }

  return (
    <div ref={rootRef} className="mt-2 space-y-3">
      <input type="hidden" name={name} value={selectedTags.join(", ")} />

      <div className="flex flex-wrap gap-2" aria-label="Preset style tags">
        {productStyleTagOptions.map((tag, index) => {
          const isSelected = hasTag(selectedTags, tag);
          const tone = themeConfig.puzzle.chipTones[index % themeConfig.puzzle.chipTones.length];

          return (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              aria-pressed={isSelected}
              className="rounded-full border px-3 py-2 text-sm font-semibold text-[#2d3842] transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#bfe8f7]"
              style={{
                background: isSelected ? tone : "#ffffff",
                borderColor: isSelected ? "rgba(45, 56, 66, 0.14)" : "#d9ddd2",
                boxShadow: isSelected ? "0 8px 20px rgba(45, 56, 66, 0.08)" : "none",
              }}
            >
              {tag}
            </button>
          );
        })}
      </div>

      {selectedTags.length ? (
        <div className="flex flex-wrap gap-2 rounded-[8px] border border-[#d9ddd2] bg-white/70 p-3">
          {selectedTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className="rounded-full bg-[#f5fbff] px-3 py-1.5 text-sm font-semibold text-[#2d3842] transition hover:bg-[#e5d7f7]"
              aria-label={`Remove ${tag}`}
            >
              {tag} x
            </button>
          ))}
        </div>
      ) : null}

      <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
        <label className="sr-only" htmlFor={inputId}>
          Add custom style tags
        </label>
        <input
          id={inputId}
          type="text"
          value={customValue}
          onChange={(event) => setCustomValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addCustomTags();
            }
          }}
          className="field-control w-full px-3"
          placeholder="Add custom tags, separated by commas"
        />
        <button type="button" onClick={addCustomTags} className="studio-button studio-button-secondary min-h-0 px-4 py-2">
          Add tag
        </button>
      </div>

      <p className="text-sm leading-6 text-[#626960]">
        Choose multiple tags or add your own. Up to {maxProductStyleTags} tags will be saved.
      </p>
    </div>
  );
}

function normalizeTags(value: string | string[]) {
  const tags = Array.isArray(value) ? value : splitTags(value);
  const seen = new Set<string>();
  const normalized: string[] = [];

  for (const tag of tags) {
    const cleanTag = tag.trim().replace(/\s+/g, " ");
    const key = cleanTag.toLowerCase();

    if (!cleanTag || seen.has(key)) {
      continue;
    }

    seen.add(key);
    normalized.push(cleanTag);

    if (normalized.length >= maxProductStyleTags) {
      break;
    }
  }

  return normalized;
}

function splitTags(value: string) {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function hasTag(tags: string[], tag: string) {
  return tags.some((item) => item.toLowerCase() === tag.toLowerCase());
}
