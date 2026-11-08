function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Nettoie la saisie en direct : chiffres, un seul séparateur, un seul signe négatif en tête */
export function sanitizeDecimalInput(raw: string, separator: string, maxDecimals: number): string {

  // Garder uniquement chiffres, "-" et séparateur
  const escapedSeparator = escapeRegex(separator);

  const allowed = new RegExp(
    `[^0-9\\-${escapedSeparator}]`,
    'g'
  );

  let value = raw.replace(allowed, '');

  // Gérer le signe "-"
  const isNegative = value.startsWith('-');

  value = value.replace(/-/g, '');

  // Gérer le séparateur
  const separatorIndex = value.indexOf(separator);

  if (separatorIndex !== -1) {

    const intPart = value.slice(0, separatorIndex);

    const decimalPart = value
      .slice(separatorIndex + 1)
      .replace(
        new RegExp(escapedSeparator, 'g'),
        ''
      )
      .slice(0, maxDecimals);

    value = intPart + separator + decimalPart;
  }

  return (isNegative ? '-' : '') + value;
}

/** Convertit la chaîne affichée (avec séparateur custom) en number JS, ou null si incomplet/vide */
export function decimalDisplayToNumber(display: string, separator: string): number | null {           
  if (!display || display === '-' || display === separator || display === `-${separator}`) {
    return null;
  }
  const normalized = display.split(separator).join('.');
  const num = Number(normalized);
  return Number.isFinite(num) ? num : null;
}

/** Convertit un number JS en chaîne affichable avec le séparateur choisi */
export function numberToDecimalDisplay(value: number | null | undefined, separator: string): string {
  if (value === null || value === undefined) return '';
  return String(value).replace('.', separator);
}