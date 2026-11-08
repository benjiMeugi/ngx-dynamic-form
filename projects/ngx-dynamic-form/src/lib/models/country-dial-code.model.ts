import { getCountries, getCountryCallingCode, CountryCode } from 'libphonenumber-js';

export interface CountryDialCode {
  iso: CountryCode;
  name: string;
  dial: string;
  flag: string;
}

function isoToFlag(iso: string): string {
  return iso
    .toUpperCase()
    .replace(/./g, char => String.fromCodePoint(127397 + char.charCodeAt(0)));
}

/** Génère la liste complète des pays (~250) avec indicatif et drapeau, triée alphabétiquement */
export function buildCountryList(locale = 'fr'): CountryDialCode[] {
  const regionNames = new Intl.DisplayNames([locale], { type: 'region' });
  return getCountries()
    .map(iso => ({
      iso,
      name: regionNames.of(iso) ?? iso,
      dial: '+' + getCountryCallingCode(iso),
      flag: isoToFlag(iso),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}