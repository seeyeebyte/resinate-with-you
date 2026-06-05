import { maxProductStyleTags } from "@/lib/customization";

export type ProductNoteFlags = {
  tags: string[];
  acceptsCustom: boolean;
  shipsInternational: boolean;
};

export function parseProductNotes(notes: string | null | undefined): ProductNoteFlags {
  const lines = (notes || "").split("\n");
  const tagLine = lines.find((line) => line.toLowerCase().startsWith("tags:"));

  return {
    tags: tagLine ? splitList(tagLine.replace(/^tags:\s*/i, "")) : [],
    acceptsCustom: lines.some((line) => line.trim().toLowerCase() === "accepts_custom: true"),
    shipsInternational: lines.some((line) => line.trim().toLowerCase() === "ships_international: true"),
  };
}

export function formatProductNotes({
  tags,
  acceptsCustom,
  shipsInternational,
}: {
  tags?: string | string[] | null;
  acceptsCustom?: boolean;
  shipsInternational?: boolean;
}) {
  const normalizedTags = Array.isArray(tags) ? tags : splitList(tags || "");
  return [
    normalizedTags.length ? `tags: ${normalizedTags.join(", ")}` : null,
    acceptsCustom ? "accepts_custom: true" : null,
    shipsInternational ? "ships_international: true" : null,
  ]
    .filter(Boolean)
    .join("\n");
}

export function splitList(value: string) {
  const seen = new Set<string>();

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((item) => {
      const key = item.toLowerCase();

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    })
    .slice(0, maxProductStyleTags);
}
