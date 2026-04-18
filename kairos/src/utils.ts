/**
 * Returns true for common truthy string values: '1', 'true', 'yes', 'on'.
 * Comparison is case-insensitive and trims surrounding whitespace.
 */
export const isTruthy = (value?: string): boolean => {
  if (!value) return false;
  return ['1', 'true', 'yes', 'on'].includes(value.trim().toLowerCase());
};
