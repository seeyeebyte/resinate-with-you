import { NextResponse } from "next/server";
import { loadRegionOptions } from "@/lib/location-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const countryCode = searchParams.get("countryCode") || "";
  const regions = await loadRegionOptions(countryCode);

  return NextResponse.json({ regions });
}
