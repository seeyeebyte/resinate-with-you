import { readdirSync, readFileSync } from "fs";
import { join } from "path";
import type { ICountry, IState } from "@countrystatecity/countries";

const locationDataDir = join(process.cwd(), "node_modules", "@countrystatecity", "countries", "dist", "data");

let countryOptionsCache: LocationOption[] | null = null;
let countryDirectoryByCodeCache: Map<string, string> | null = null;
const regionOptionsCache = new Map<string, LocationOption[]>();

export type LocationOption = {
  label: string;
  value: string;
  code: string;
};

export async function loadCountryOptions(): Promise<LocationOption[]> {
  if (countryOptionsCache) {
    return countryOptionsCache;
  }

  const countries = readJsonFile<ICountry[]>(join(locationDataDir, "countries.json"));

  countryOptionsCache = countries.map(mapCountry).sort(sortByLabel);

  return countryOptionsCache;
}

export async function loadRegionOptions(countryCode: string): Promise<LocationOption[]> {
  const normalizedCode = countryCode.trim().toUpperCase();

  if (!normalizedCode) {
    return [];
  }

  const cachedRegions = regionOptionsCache.get(normalizedCode);

  if (cachedRegions) {
    return cachedRegions;
  }

  const countryDir = findCountryDirectory(normalizedCode);
  const states = countryDir ? readJsonFile<IState[]>(join(locationDataDir, countryDir, "states.json")) : [];
  const regions = states.map(mapState).sort(sortByLabel);

  regionOptionsCache.set(normalizedCode, regions);

  return regions;
}

export function findOptionByLabel(options: LocationOption[], label: string) {
  const normalizedLabel = normalizeLocationLabel(label);

  return options.find((option) => normalizeLocationLabel(option.label) === normalizedLabel) || null;
}

function mapCountry(country: ICountry): LocationOption {
  return {
    label: country.name,
    value: country.name,
    code: country.iso2,
  };
}

function mapState(state: IState): LocationOption {
  return {
    label: state.name,
    value: state.name,
    code: state.iso2,
  };
}

function sortByLabel(left: LocationOption, right: LocationOption) {
  return left.label.localeCompare(right.label);
}

function normalizeLocationLabel(label: string) {
  return label.trim().toLowerCase();
}

function findCountryDirectory(countryCode: string) {
  const normalizedCode = countryCode.trim().toUpperCase();

  if (!countryDirectoryByCodeCache) {
    countryDirectoryByCodeCache = new Map(
      readdirSync(locationDataDir, { withFileTypes: true })
        .filter((item) => item.isDirectory())
        .map((item) => item.name)
        .map((directory) => [directory.split("-").at(-1)?.toUpperCase() || "", directory]),
    );
  }

  return countryDirectoryByCodeCache.get(normalizedCode);
}

function readJsonFile<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf8")) as T;
}
