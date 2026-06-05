"use client";

import { countryOptions } from "@/lib/country-options";

export function CountrySelectField({
  value,
  onChange,
  required = false,
  helper = "Choose the country or region from the list.",
  className = "field-control mt-2 w-full px-4 text-sm",
}: {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  helper?: string;
  className?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-[#2d3842]">
        Country or region
        {required ? " *" : ""}
      </span>
      <select
        name="country"
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={className}
      >
        <option value="">Select country or region</option>
        {countryOptions.map((option) => (
          <option key={option.code} value={option.value}>
            {option.label}
            {option.code ? ` (${option.code})` : ""}
          </option>
        ))}
      </select>
      {helper ? <span className="mt-2 block text-xs leading-5 text-[#626960]">{helper}</span> : null}
    </label>
  );
}
