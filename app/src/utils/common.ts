import { LEVELS } from "@/lib/constants";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

/**
 * Get the display name for an education level based on locale
 * @param levelId - The level identifier (e.g., "undergraduate", "postgraduate")
 * @param locale - The locale ("vi" or "en")
 * @returns The localized level name, or the levelId if not found
 */
export function getLevelDisplay(levelId: string, locale: "vi" | "en"): string {
  const level = LEVELS.find((l) => l.id === levelId);
  if (!level) {
    // Fallback: capitalize the levelId if not found
    return levelId.charAt(0).toUpperCase() + levelId.slice(1);
  }
  return level.language[locale];
}

/**
 * Format a date in Vietnamese locale
 * @param date - The date to format (Date object or string)
 * @param formatString - The format string (default: "dd MMMM, yyyy")
 * @returns The formatted date in Vietnamese
 */
export function formatVietnameseDate(
  date: Date | string,
  formatString: string = "dd MMMM, yyyy"
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, formatString, { locale: vi });
}
