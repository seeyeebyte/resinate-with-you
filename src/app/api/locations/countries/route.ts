import { NextResponse } from "next/server";
import { loadCountryOptions } from "@/lib/location-data";

export async function GET() {
  const countries = await loadCountryOptions();

  return NextResponse.json({ countries });
}
