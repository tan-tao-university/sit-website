import { UseFormReturn, FieldValues, Path } from "react-hook-form";
import { ZodSchema, ZodError, z } from "zod";

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  success: boolean;
  errors: ValidationError[];
  data?: any;
}

/**
 * Validate form data with Zod schema and set errors on form
 * @param schema - Zod validation schema
 * @param data - Form data to validate
 * @param form - React Hook Form instance
 * @returns Validation result with success status and errors
 */
export function validateFormData<T extends FieldValues>(
  schema: ZodSchema,
  data: any,
  form: UseFormReturn<T>,
): ValidationResult {
  try {
    const result = schema.parse(data);
    return {
      success: true,
      errors: [],
      data: result,
    };
  } catch (error) {
    if (error instanceof ZodError) {
      const errors: ValidationError[] = [];
      const fieldErrors = error.flatten().fieldErrors;

      Object.entries(fieldErrors).forEach(([field, messages]) => {
        if (messages && messages.length > 0) {
          const message = messages[0];
          errors.push({ field, message });

          // Set error on form field
          form.setError(field as Path<T>, {
            type: "manual",
            message,
          });
        }
      });

      return {
        success: false,
        errors,
      };
    }

    return {
      success: false,
      errors: [{ field: "general", message: "Validation failed" }],
    };
  }
}

/**
 * Get user-friendly error message for common validation errors
 */
export function getFieldErrorMessage(field: string, error: string): string {
  const fieldNames: Record<string, string> = {
    title: "Tiêu đề",
    slug: "Slug",
    summary: "Tóm tắt",
    content: "Nội dung",
    coverImage: "Ảnh bìa",
    category: "Danh mục",
    status: "Trạng thái",
    name: "Tên",
    nameVi: "Tên tiếng Việt",
    nameEn: "Tên tiếng Anh",
    code: "Mã",
    email: "Email",
    password: "Mật khẩu",
    description: "Mô tả",
    descriptionVi: "Mô tả tiếng Việt",
    descriptionEn: "Mô tả tiếng Anh",
  };

  const fieldName = fieldNames[field] || field;

  // Common error patterns
  if (error.includes("required") || error.includes("bắt buộc")) {
    return `${fieldName} là bắt buộc`;
  }
  if (error.includes("min")) {
    return `${fieldName} quá ngắn`;
  }
  if (error.includes("max")) {
    return `${fieldName} quá dài`;
  }
  if (error.includes("email")) {
    return `${fieldName} không hợp lệ`;
  }
  if (error.includes("url") || error.includes("URL")) {
    return `${fieldName} phải là URL hợp lệ`;
  }

  return error;
}

/**
 * Format validation errors for toast notification
 */
export function formatValidationErrors(errors: ValidationError[]): string {
  if (errors.length === 0) return "";

  if (errors.length === 1) {
    return getFieldErrorMessage(errors[0].field, errors[0].message);
  }

  const errorList = errors
    .slice(0, 3) // Show max 3 errors
    .map((err) => `• ${getFieldErrorMessage(err.field, err.message)}`)
    .join("\n");

  const remaining = errors.length - 3;
  if (remaining > 0) {
    return `${errorList}\n• ...và ${remaining} lỗi khác`;
  }

  return errorList;
}

/**
 * Check if form has any errors
 */
export function hasFormErrors<T extends FieldValues>(
  form: UseFormReturn<T>,
): boolean {
  return Object.keys(form.formState.errors).length > 0;
}

/**
 * Get all form errors as array
 */
export function getFormErrors<T extends FieldValues>(
  form: UseFormReturn<T>,
): ValidationError[] {
  const errors: ValidationError[] = [];

  Object.entries(form.formState.errors).forEach(([field, error]) => {
    if (error?.message) {
      errors.push({
        field,
        message: error.message as string,
      });
    }
  });

  return errors;
}

/**
 * Clear all form errors
 */
export function clearFormErrors<T extends FieldValues>(
  form: UseFormReturn<T>,
): void {
  Object.keys(form.formState.errors).forEach((field) => {
    form.clearErrors(field as Path<T>);
  });
}

/**
 * Scroll to first error field
 */
export function scrollToFirstError(): void {
  setTimeout(() => {
    const firstError = document.querySelector('[data-error="true"]');
    if (firstError) {
      firstError.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, 100);
}

// Backend returns null (not undefined) for unset optional text fields;
// z.string().optional() only accepts undefined, so normalize null -> undefined here.
const optionalString = (max?: number) => {
  const schema = max ? z.string().max(max) : z.string();
  return schema
    .nullable()
    .optional()
    .transform((v) => v ?? undefined);
};

export const alumniFormSchema = z.object({
  fullName: z.string().min(1, "Họ và tên là bắt buộc").max(255),
  slug: z.string().min(1, "Slug là bắt buộc").max(255),
  avatarUrl: z.string().url("URL không hợp lệ").optional().or(z.literal("")),
  graduationYear: z.coerce
    .number()
    .min(1900, "Năm không hợp lệ")
    .max(new Date().getFullYear(), "Năm không hợp lệ")
    .optional(),
  program: optionalString(255),
  degree: optionalString(50),
  shortBio: optionalString(),
  personalStory: optionalString(),
  sectionMembers: z
    .array(
      z.object({
        sectionId: z.string().min(1, "ID chuyên mục là bắt buộc"),
        customTitle: optionalString(),
        customQuote: optionalString(),
        displayOrder: z.coerce.number().optional(),
        isFeatured: z.boolean().optional(),
      }),
    )
    .optional(),
  meta: z
    .object({
      visibility: optionalString(),
      verifiedBy: optionalString(),
    })
    .optional(),
  academicProfile: z
    .object({
      major: optionalString(),
      thesisTitle: optionalString(),
      advisor: optionalString(),
      researchArea: optionalString(),
      honors: optionalString(),
      notes: optionalString(),
    })
    .optional(),
  careers: z
    .array(
      z.object({
        organization: z.string().min(1, "Tổ chức là bắt buộc"),
        role: z.string().min(1, "Vai trò là bắt buộc"),
        industry: optionalString(),
        location: optionalString(),
        startYear: z.coerce.number().optional(),
        endYear: z.coerce.number().optional(),
        description: optionalString(),
      }),
    )
    .optional(),
  achievements: z
    .array(
      z.object({
        type: optionalString(),
        title: optionalString(),
        description: optionalString(),
        year: z.coerce.number().optional(),
        link: optionalString(),
      }),
    )
    .optional(),
  contacts: z
    .array(
      z.object({
        type: z.string().min(1, "Loại là bắt buộc"),
        url: optionalString(),
        visibility: optionalString(),
      }),
    )
    .optional(),
});

export type AlumniFormData = z.infer<typeof alumniFormSchema>;

export const studentPortfolioFormSchema = z.object({
  fullName: z.string().min(1, "Họ và tên là bắt buộc").max(255),
  slug: z.string().min(1, "Slug là bắt buộc").max(255),
  avatarUrl: z.string().url("URL không hợp lệ").optional().or(z.literal("")),
  title: optionalString(255),
  shortBio: optionalString(),
  about: optionalString(),
  program: optionalString(255),
  studentYear: z.coerce
    .number()
    .min(1900, "Năm không hợp lệ")
    .max(new Date().getFullYear() + 1, "Năm không hợp lệ")
    .optional(),
  location: optionalString(255),
  isPublished: z.boolean().optional(),
  skills: z
    .array(
      z.object({
        category: optionalString(100),
        name: z.string().min(1, "Tên kỹ năng là bắt buộc").max(100),
        displayOrder: z.coerce.number().optional(),
      }),
    )
    .optional(),
  projects: z
    .array(
      z.object({
        title: z.string().min(1, "Tên dự án là bắt buộc").max(255),
        description: optionalString(),
        imageUrl: z.string().url("URL không hợp lệ").optional().or(z.literal("")),
        techStack: z.array(z.string()).optional(),
        role: optionalString(255),
        demoUrl: z.string().url("URL không hợp lệ").optional().or(z.literal("")),
        repoUrl: z.string().url("URL không hợp lệ").optional().or(z.literal("")),
        isFeatured: z.boolean().optional(),
        displayOrder: z.coerce.number().optional(),
      }),
    )
    .optional(),
  experiences: z
    .array(
      z.object({
        organization: z.string().min(1, "Tổ chức là bắt buộc").max(255),
        role: z.string().min(1, "Vai trò là bắt buộc").max(255),
        startDate: optionalString(20),
        endDate: optionalString(20),
        description: optionalString(),
        displayOrder: z.coerce.number().optional(),
      }),
    )
    .optional(),
  education: z
    .array(
      z.object({
        school: z.string().min(1, "Tên trường là bắt buộc").max(255),
        degree: optionalString(100),
        field: optionalString(255),
        startYear: z.coerce.number().optional(),
        endYear: z.coerce.number().optional(),
        displayOrder: z.coerce.number().optional(),
      }),
    )
    .optional(),
  achievements: z
    .array(
      z.object({
        title: z.string().min(1, "Tên thành tích là bắt buộc").max(255),
        description: optionalString(),
        year: z.coerce.number().optional(),
        link: z.string().url("URL không hợp lệ").optional().or(z.literal("")),
        displayOrder: z.coerce.number().optional(),
      }),
    )
    .optional(),
  contacts: z
    .array(
      z.object({
        type: z.string().min(1, "Loại là bắt buộc").max(50),
        value: z.string().min(1, "Giá trị là bắt buộc"),
        displayOrder: z.coerce.number().optional(),
      }),
    )
    .optional(),
});

export type StudentPortfolioFormData = z.infer<
  typeof studentPortfolioFormSchema
>;
