/**
 * Generates a short URL-safe slug (alphanumeric). Length 8 by default.
 * Uniqueness must be enforced by the caller (e.g. retry on DB unique constraint).
 */
const ALPHABET =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export function generateSlug(length = 8): string {
  let result = "";
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  for (let i = 0; i < length; i++) {
    result += ALPHABET[bytes[i]! % ALPHABET.length];
  }
  return result;
}
