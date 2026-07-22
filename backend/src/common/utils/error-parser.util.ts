/**
 * Utility to parse PostgreSQL errors and extract field information
 * for better error messages in API responses
 */

interface ParsedDatabaseError {
  field: string | null;
  constraint: string | null;
  value: string | null;
  message: string;
}

export interface PgDatabaseError {
  code?: string;
  constraint?: string;
  detail?: string;
}

/**
 * Narrows an unknown catch value to a PostgreSQL unique-violation error (code 23505).
 */
export function isPgUniqueViolation(error: unknown): error is PgDatabaseError {
  return (
    typeof error === 'object' &&
    error !== null &&
    (error as PgDatabaseError).code === '23505'
  );
}

/**
 * Parse PostgreSQL unique constraint violation error
 * @param error - The database error object
 * @returns Parsed error information with field details
 */
export function parseDuplicateKeyError(
  error: PgDatabaseError,
): ParsedDatabaseError {
  const constraint = error.constraint || '';
  const detail = error.detail || '';

  // Extract field name from constraint name
  // e.g., "program_slug_en_unique" -> "slug_en"
  let field: string | null = null;

  // Try to extract from constraint name
  if (constraint) {
    // Pattern: table_field_unique or table_field1_field2_unique
    const parts = constraint.split('_');
    // Remove table name (first part) and 'unique' (last part)
    if (parts.length >= 3) {
      parts.shift(); // Remove table name
      parts.pop(); // Remove 'unique'
      field = parts.join('_');
    }
  }

  // Try to extract from error detail if constraint parsing failed
  // e.g., "Key (slug_en)=(computer-science) already exists."
  if (!field && detail) {
    const match = detail.match(/Key \(([^)]+)\)=/);
    if (match) {
      field = match[1];
    }
  }

  // Extract value from detail
  let value: string | null = null;
  if (detail) {
    const match = detail.match(/=\(([^)]+)\)/);
    if (match) {
      value = match[1];
    }
  }

  // Convert snake_case to camelCase for field name
  const camelCaseField = field ? snakeToCamel(field) : null;

  // Generate user-friendly message
  const fieldDisplay = camelCaseField || 'value';
  const message = `Duplicate ${fieldDisplay} detected. This value already exists.`;

  return {
    field: camelCaseField,
    constraint,
    value,
    message,
  };
}

/**
 * Convert snake_case to camelCase
 * @param str - Snake case string
 * @returns Camel case string
 */
function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase());
}

/**
 * Get Vietnamese field name for display
 * @param field - Field name in camelCase
 * @returns Vietnamese field name
 */
export function getVietnameseFieldName(field: string): string {
  const fieldNames: Record<string, string> = {
    slugEn: 'Slug (Tiếng Anh)',
    slugVi: 'Slug (Tiếng Việt)',
    code: 'Mã',
    email: 'Email',
    nameEn: 'Tên (Tiếng Anh)',
    nameVi: 'Tên (Tiếng Việt)',
  };

  return fieldNames[field] || field;
}
