/**
 * Normalizes any Ethiopian phone number to local 10-digit format: 09XXXXXXXX or 07XXXXXXXX
 */
export function normalizeEthiopianPhone(input: string): string {
  if (!input) return "";
  let cleaned = input.trim().replace(/\D/g, "");

  if (cleaned.startsWith("251") && cleaned.length >= 12) {
    cleaned = "0" + cleaned.substring(3);
  } else if (
    cleaned.length === 9 &&
    (cleaned.startsWith("9") || cleaned.startsWith("7"))
  ) {
    cleaned = "0" + cleaned;
  }

  return cleaned;
}

/**
 * Validates if the input is a valid Ethiopian phone number
 */
export function isValidEthiopianPhone(input: string): boolean {
  const normalized = normalizeEthiopianPhone(input);
  return /^(09|07)\d{8}$/.test(normalized);
}

/**
 * Formats a phone number for display (+251 9XX XXX XXX)
 */
export function formatDisplayPhone(raw: string): string {
  const normalized = normalizeEthiopianPhone(raw);
  if (normalized.length === 10) {
    // 09 11 23 4567 -> +251 91 123 4567
    const rest = normalized.slice(1); // 911234567
    return `+251 ${rest.slice(0, 2)} ${rest.slice(2, 5)} ${rest.slice(5)}`;
  }
  return raw;
}
