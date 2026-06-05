export function formatDisplayPrice(priceText: string) {
  const trimmed = priceText.trim();

  if (!trimmed) {
    return "Price on request";
  }

  if (/[€£¥₩]|USD|US\$/i.test(trimmed)) {
    return trimmed;
  }

  if (trimmed.includes("$")) {
    return trimmed.replace(/\$/g, "US$");
  }

  if (/^[\d.,\s-]+$/.test(trimmed)) {
    return trimmed.replace(/\d+(?:[.,]\d+)?/g, (value) => `US$${value}`);
  }

  return trimmed;
}
