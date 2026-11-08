export function sanitizeIntegerInput(raw: string): string {
  // Autoriser uniquement les chiffres et -
  let value = raw.replace(/[^0-9-]/g, '');

  // Le - doit être uniquement au début
  if (value.includes('-')) {
    value = '-' + value.replace(/-/g, '');
  }

  return value;
}