import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function for conditional className management
 * Combines clsx for conditional classes and tailwind-merge for deduplication
 *
 * @example
 * cn('base-class', isActive && 'active-class', className)
 * cn('px-4 py-2', 'px-6') // Returns 'py-2 px-6' (px-6 overrides px-4)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
