/**
 * Utility functions for regular expressions and escaping user input to prevent ReDoS.
 */

/**
 * Escapes regex meta characters in a string: `[.*+?^${}()|[\]\\]`.
 * Used to safely interpolate user query strings into `RegExp` or MongoDB `$regex`.
 *
 * @param string The raw string to escape.
 * @returns The escaped string safe for regex pattern matching.
 */
export function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
