// Trims a string; anything else (null, undefined, unexpected API values)
// becomes an empty string.
export const normalizeString = (value: unknown): string =>
  typeof value === 'string' ? value.trim() : '';
