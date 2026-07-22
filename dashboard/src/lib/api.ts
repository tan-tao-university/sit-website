export const API_URL = "/api/backend";

export interface CreateProgramDto {
  code: string;
  nameVi: string;
  nameEn?: string;
  level: "undergraduate" | "postgraduate";
  majorCode?: string;
  banner?: string;
  status?: "active" | "inactive";
  slugVi: string;
  slugEn: string;
  descriptionVi?: string;
  descriptionEn?: string;
  content: Record<string, unknown>;
}

export type UpdateProgramDto = Partial<CreateProgramDto>;

export interface Program extends CreateProgramDto {
  programId: string;
  contentId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCurriculumDto {
  programId: string;
  year: number;
  nameVi: string;
  nameEn?: string;
  slugVi: string;
  slugEn: string;
  descriptionVi?: string;
  descriptionEn?: string;
  banner?: string;
  pdfUrl?: string;
  isCurrent?: boolean;
  durationYears?: number;
  totalSemesters?: number;
  totalCredits?: number;
  educationType?: string;
  language?: string;
  degreeAwarded?: string;
}

export type UpdateCurriculumDto = Partial<CreateCurriculumDto>;

export interface Curriculum extends CreateCurriculumDto {
  curriculumId: string;
  sections?: Section[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateSectionDto {
  curriculumId: string;
  sectionKey:
    | "intro"
    | "overview"
    | "vision"
    | "objectives"
    | "learning_outcomes"
    | "admission_requirements"
    | "workload"
    | "curriculum_structure"
    | "teaching_method"
    | "assessment"
    | "career_opportunities"
    | "graduation_requirements";
  title: string;
  content?: string;
  displayOrder?: number;
  isVisible?: boolean;
}

export type UpdateSectionDto = Partial<CreateSectionDto>;

export interface Section extends CreateSectionDto {
  sectionId: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  userId: string;
  email: string;
  fullName: string;
  avatarUrl?: string | null;
  emailVerified: boolean;
  isActive: boolean;
  roles: string[];
  lastLoginAt?: string;
  createdAt: string;
}

export interface CreateUserDto {
  email: string;
  password: string;
  fullName: string;
}

export interface AssignRoleDto {
  role: "admin" | "student" | "parent";
}

export interface UpdateUserDto {
  fullName?: string;
  isActive?: boolean;
  avatarUrl?: string;
  password?: string;
}

export interface CreateCourseDto {
  code: string;
  nameVi: string;
  nameEn?: string;
  credits: number;
  slugVi: string;
  slugEn: string;
  lectureHours?: number;
  practiceHours?: number;
}

export type UpdateCourseDto = Partial<CreateCourseDto>;

export interface Course extends CreateCourseDto {
  courseId: string;
}

const getHeaders = (): HeadersInit => {
  return {
    "Content-Type": "application/json",
  };
};

// Request deduplication cache - stores parsed response data
const requestCache = new Map<string, Promise<any>>();
let isHandlingUnauthorized = false;

// Helper to create cache key
const getCacheKey = (url: string, options: RequestInit): string => {
  return `${options.method || "GET"}:${url}:${JSON.stringify(options.body || "")}`;
};

// Enhanced fetch with retry logic and timeout
const fetchWithRetry = async (
  url: string,
  options: RequestInit = {},
  retries = 3,
  timeout = 30000,
): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Retry on 5xx errors
    if (response.status >= 500 && retries > 0) {
      console.warn(
        `Server error ${response.status}, retrying... (${retries} attempts left)`,
      );
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1s before retry
      return fetchWithRetry(url, options, retries - 1, timeout);
    }

    return response;
  } catch (error) {
    clearTimeout(timeoutId);

    // Retry on network errors
    if (retries > 0 && error instanceof Error) {
      if (error.name === "AbortError") {
        throw new Error("Request timeout");
      }
      console.warn(`Network error, retrying... (${retries} attempts left)`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return fetchWithRetry(url, options, retries - 1, timeout);
    }

    throw error;
  }
};

// Helper to translate error messages to Vietnamese
const getVietnameseErrorMessage = (
  field?: string,
  constraint?: string,
): string => {
  const fieldNames: Record<string, string> = {
    code: "Mã chương trình",
    slugVi: "Đường dẫn (Tiếng Việt)",
    slugEn: "Đường dẫn (Tiếng Anh)",
    slug_vi: "Đường dẫn (Tiếng Việt)",
    slug_en: "Đường dẫn (Tiếng Anh)",
    nameVi: "Tên (Tiếng Việt)",
    nameEn: "Tên (Tiếng Anh)",
    email: "Email",
  };

  if (field && constraint?.includes("unique")) {
    const fieldName = fieldNames[field] || field;
    return `${fieldName} "${field}" đã tồn tại trong hệ thống. Vui lòng sử dụng giá trị khác.`;
  }

  return "Đã xảy ra lỗi. Vui lòng thử lại.";
};

const fetchWithAuth = async (
  url: string,
  options: RequestInit = {},
): Promise<Response> => {
  const authHeaders = getHeaders() as Record<string, string>;
  if (typeof FormData !== "undefined" && options.body instanceof FormData) {
    delete authHeaders["Content-Type"];
  }

  const fetchOptions: RequestInit = {
    ...options,
    headers: {
      ...authHeaders,
      ...options.headers,
    },
    credentials: "include", // Send cookies to backend
  };

  // Request deduplication for GET requests
  const cacheKey = getCacheKey(url, fetchOptions);
  const method = fetchOptions.method?.toUpperCase() || "GET";

  if (method === "GET") {
    const cachedData = requestCache.get(cacheKey);
    if (cachedData) {
      console.debug("Using cached data:", cacheKey);
      // Return a new Response with cached data
      return cachedData.then((data) => {
        return new Response(JSON.stringify(data), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      });
    }
  }

  // Create the request promise
  const response = await fetchWithRetry(url, fetchOptions);

  // Log errors for debugging
  if (!response.ok) {
    if (response.status === 401) {
      if (!isHandlingUnauthorized) {
        isHandlingUnauthorized = true;
        console.debug("Session expired, logging out...");
        try {
          await fetch("/api/auth/session", { method: "DELETE" });
        } catch (error) {
          console.error("Error during auto-logout:", error);
        } finally {
          isHandlingUnauthorized = false;
          window.location.replace("/login");
        }
      }
      // Return a never-resolving promise or just the response (the app will redirect anyway)
      // Returning response allows the caller to fail gracefully if needed before redirect
      return response;
    }
    let errorBody;
    try {
      errorBody = await response.clone().json();
    } catch {
      errorBody = await response.clone().text();
    }

    const correlationId = response.headers.get("X-Correlation-ID");
    console.error(`API Error: ${method} ${url} - ${response.status}`, {
      correlationId,
      status: response.status,
      statusText: response.statusText,
      body: errorBody,
    });
    return response;
  }

  // Cache GET requests - store the parsed JSON data
  if (method === "GET") {
    const dataPromise = response.clone().json();
    requestCache.set(cacheKey, dataPromise);
    // Clear cache after 5 seconds
    setTimeout(() => requestCache.delete(cacheKey), 5000);
  }

  return response;
};

export interface CreateNewsDto {
  title: string;
  slug: string;
  summary?: string;
  content: any; // Yoopta JSON
  coverImage?: string;
  category?:
    | "workshop"
    | "achievements"
    | "academic"
    | "business"
    | "events"
    | "general";
  status?: "draft" | "published" | "archived";
  publishedAt?: string;
}

export type UpdateNewsDto = Partial<CreateNewsDto>;

export interface News extends CreateNewsDto {
  id: string;
  contentText?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateHandbookDto {
  schoolYear: string; // "2023-2024"
  status?: "draft" | "published";
  contentVi?: any; // Yoopta JSON
  contentEn?: any; // Yoopta JSON
  pdfUrlVi?: string;
  pdfUrlEn?: string;
}

export type UpdateHandbookDto = Partial<CreateHandbookDto>;

export interface Handbook extends CreateHandbookDto {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export type EventStatus = "draft" | "published" | "cancelled";

export interface CreateEventDto {
  titleVi: string;
  titleEn?: string;
  descriptionVi?: string;
  descriptionEn?: string;
  startAt: string;
  endAt?: string;
  locationVi: string;
  locationEn?: string;
  registrationUrl?: string;
  status?: EventStatus;
  isFeatured?: boolean;
}

export type UpdateEventDto = Partial<CreateEventDto>;

export interface Event extends CreateEventDto {
  id: string;
  status: EventStatus;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CareerOpportunityType =
  | "internship"
  | "full_time"
  | "part_time"
  | "contract";
export type CareerWorkMode = "onsite" | "hybrid" | "remote";
export type CareerOpportunityStatus = "draft" | "published" | "closed";

export interface CreateCareerOpportunityDto {
  titleVi: string;
  titleEn?: string;
  companyName: string;
  companyLogoUrl?: string;
  summaryVi?: string;
  summaryEn?: string;
  requirementsVi?: string;
  requirementsEn?: string;
  type: CareerOpportunityType;
  workMode: CareerWorkMode;
  locationVi: string;
  locationEn?: string;
  skills?: string;
  salaryText?: string;
  applicationUrl?: string;
  contactEmail?: string;
  applicationDeadline?: string;
  publishedAt?: string;
  status?: CareerOpportunityStatus;
  isFeatured?: boolean;
}

export type UpdateCareerOpportunityDto =
  Partial<CreateCareerOpportunityDto>;

export interface CareerOpportunity extends CreateCareerOpportunityDto {
  id: string;
  status: CareerOpportunityStatus;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePopupBannerDto {
  titleVi: string;
  titleEn?: string;
  imageUrl: string;
  imageAltVi?: string;
  imageAltEn?: string;
  linkUrl: string;
  openInNewTab?: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
  isActive?: boolean;
}

export type UpdatePopupBannerDto = Partial<CreatePopupBannerDto>;

export interface PopupBanner extends CreatePopupBannerDto {
  id: string;
  openInNewTab: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const api = {
  // ... existing methods ...
  auth: {
    login: async (email: string, password: string): Promise<User> => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || "INVALID_CREDENTIALS");
      }
      return (await response.json()).user;
    },
    logout: async () => {
      await fetch("/api/auth/session", { method: "DELETE" });
    },
    getCurrentUser: async (): Promise<User> => {
      const response = await fetchWithAuth(`${API_URL}/auth/me`);
      if (response.status === 401 || response.status === 403) {
        throw new Error("UNAUTHORIZED");
      }
      if (!response.ok) throw new Error("Failed to fetch user");
      return response.json();
    },
  },
  users: {
    create: async (data: CreateUserDto): Promise<{ user: User }> => {
      const response = await fetchWithAuth(`${API_URL}/users`, {
        method: "POST",
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create user");
      }

      return response.json();
    },
    assignRole: async (userId: string, data: AssignRoleDto) => {
      const response = await fetchWithAuth(`${API_URL}/users/${userId}/roles`, {
        method: "POST",
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to assign role");
      }

      return response.json();
    },
    getAll: async (): Promise<User[]> => {
      const response = await fetchWithAuth(`${API_URL}/users`);

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      return response.json();
    },
    delete: async (userId: string): Promise<void> => {
      const response = await fetchWithAuth(`${API_URL}/users/${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete user");
      }
    },
    update: async (userId: string, data: UpdateUserDto): Promise<User> => {
      const response = await fetchWithAuth(`${API_URL}/users/${userId}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update user");
      }

      return response.json();
    },
  },
  programs: {
    create: async (data: CreateProgramDto): Promise<Program> => {
      const response = await fetchWithAuth(`${API_URL}/programs`, {
        method: "POST",
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        let errorMessage = "Không thể tạo chương trình";
        let errorField: string | undefined;
        let errorConstraint: string | undefined;
        let errorValue: any;

        try {
          const error = await response.json();

          // Extract field information if available (from structured error)
          if (error.field) {
            errorField = error.field;
            errorConstraint = error.constraint;
            errorValue = error.value;

            // Use Vietnamese error message for better UX
            errorMessage = getVietnameseErrorMessage(
              error.field,
              error.constraint,
            );
          } else {
            // Fallback to generic error message
            errorMessage = error.message || error.error || errorMessage;
          }
        } catch {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }

        // Create error with field metadata
        const err = new Error(errorMessage) as any;
        if (errorField) {
          err.field = errorField;
          err.constraint = errorConstraint;
          err.value = errorValue;
        }
        throw err;
      }

      return response.json();
    },

    findAll: async (params?: {
      status?: string;
      level?: string;
    }): Promise<Program[]> => {
      const searchParams = new URLSearchParams();
      if (params?.status) searchParams.append("status", params.status);
      if (params?.level) searchParams.append("level", params.level);

      const response = await fetchWithAuth(
        `${API_URL}/programs?${searchParams.toString()}`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch programs");
      }

      return response.json();
    },

    findOne: async (id: string): Promise<Program> => {
      const response = await fetchWithAuth(`${API_URL}/programs/${id}`);

      if (!response.ok) {
        throw new Error("Failed to fetch program");
      }

      return response.json();
    },

    update: async (id: string, data: UpdateProgramDto): Promise<Program> => {
      const response = await fetchWithAuth(`${API_URL}/programs/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        let errorMessage = "Không thể cập nhật chương trình";
        let errorField: string | undefined;
        let errorConstraint: string | undefined;
        let errorValue: any;

        try {
          const error = await response.json();

          // Extract field information if available
          if (error.field) {
            errorField = error.field;
            errorConstraint = error.constraint;
            errorValue = error.value;

            // Use Vietnamese error message for better UX
            errorMessage = getVietnameseErrorMessage(
              error.field,
              error.constraint,
            );
          } else {
            // Fallback to generic error message
            errorMessage = error.message || error.error || errorMessage;
          }
        } catch {
          errorMessage = response.statusText || errorMessage;
        }

        // Create error with field metadata
        const err = new Error(errorMessage) as any;
        if (errorField) {
          err.field = errorField;
          err.constraint = errorConstraint;
          err.value = errorValue;
        }
        throw err;
      }

      return response.json();
    },

    remove: async (id: string): Promise<void> => {
      const response = await fetchWithAuth(`${API_URL}/programs/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete program");
      }
    },
  },
  curriculums: {
    create: async (data: CreateCurriculumDto): Promise<Curriculum> => {
      const response = await fetchWithAuth(`${API_URL}/curriculums`, {
        method: "POST",
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create curriculum");
      }

      return response.json();
    },

    findAll: async (programId?: string): Promise<Curriculum[]> => {
      const query = programId ? `?programId=${programId}` : "";
      const response = await fetchWithAuth(`${API_URL}/curriculums${query}`);

      if (!response.ok) {
        throw new Error("Failed to fetch curriculums");
      }

      return response.json();
    },

    findOne: async (
      id: string,
      includeSections = false,
    ): Promise<Curriculum> => {
      const query = includeSections ? "?includeSections=true" : "";
      const response = await fetchWithAuth(
        `${API_URL}/curriculums/${id}${query}`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch curriculum");
      }

      return response.json();
    },

    update: async (
      id: string,
      data: UpdateCurriculumDto,
    ): Promise<Curriculum> => {
      const response = await fetchWithAuth(`${API_URL}/curriculums/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update curriculum");
      }

      return response.json();
    },

    remove: async (id: string): Promise<void> => {
      const response = await fetchWithAuth(`${API_URL}/curriculums/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete curriculum");
      }
    },
  },
  sections: {
    create: async (data: CreateSectionDto): Promise<Section> => {
      const response = await fetchWithAuth(`${API_URL}/sections`, {
        method: "POST",
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create section");
      }

      return response.json();
    },

    findAll: async (curriculumId?: string): Promise<Section[]> => {
      const query = curriculumId ? `?curriculumId=${curriculumId}` : "";
      const response = await fetchWithAuth(`${API_URL}/sections${query}`);

      if (!response.ok) {
        throw new Error("Failed to fetch sections");
      }

      return response.json();
    },

    update: async (id: string, data: UpdateSectionDto): Promise<Section> => {
      const response = await fetchWithAuth(`${API_URL}/sections/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update section");
      }

      return response.json();
    },

    remove: async (id: string): Promise<void> => {
      const response = await fetchWithAuth(`${API_URL}/sections/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete section");
      }
    },
  },
  upload: {
    image: async (file: File, folder?: string): Promise<{ url: string }> => {
      const formData = new FormData();
      formData.append("file", file);

      const folderParam = folder ? `?folder=${folder}` : "";
      const response = await fetchWithAuth(`${API_URL}/upload/image${folderParam}`, {
        method: "POST",
        body: formData,
        headers: {},
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to upload image");
      }

      return response.json();
    },
  },
  courses: {
    create: async (data: CreateCourseDto): Promise<Course> => {
      const response = await fetchWithAuth(`${API_URL}/courses`, {
        method: "POST",
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create course");
      }

      return response.json();
    },

    findAll: async (): Promise<Course[]> => {
      const response = await fetchWithAuth(`${API_URL}/courses`);

      if (!response.ok) {
        throw new Error("Failed to fetch courses");
      }

      return response.json();
    },

    findOne: async (id: string): Promise<Course> => {
      const response = await fetchWithAuth(`${API_URL}/courses/${id}`);

      if (!response.ok) {
        throw new Error("Failed to fetch course");
      }

      return response.json();
    },

    update: async (id: string, data: UpdateCourseDto): Promise<Course> => {
      const response = await fetchWithAuth(`${API_URL}/courses/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update course");
      }

      return response.json();
    },

    remove: async (id: string): Promise<void> => {
      const response = await fetchWithAuth(`${API_URL}/courses/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete course");
      }
    },
  },
  translation: {
    translate: async (
      text: string,
      targetLanguage: "vi" | "en",
    ): Promise<{ translatedText: string }> => {
      const response = await fetchWithAuth(`${API_URL}/translation`, {
        method: "POST",
        body: JSON.stringify({ text, targetLanguage }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to translate text");
      }

      return response.json();
    },
  },
  news: {
    create: async (data: CreateNewsDto): Promise<News> => {
      const response = await fetchWithAuth(`${API_URL}/news`, {
        method: "POST",
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create news");
      }

      return response.json();
    },

    findAll: async (): Promise<News[]> => {
      const response = await fetchWithAuth(`${API_URL}/news`);

      if (!response.ok) {
        throw new Error("Failed to fetch news");
      }

      return response.json();
    },

    findOne: async (id: string): Promise<News> => {
      const response = await fetchWithAuth(`${API_URL}/news/${id}`);

      if (!response.ok) {
        throw new Error("Failed to fetch news");
      }

      return response.json();
    },

    update: async (id: string, data: UpdateNewsDto): Promise<News> => {
      const response = await fetchWithAuth(`${API_URL}/news/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update news");
      }

      return response.json();
    },

    remove: async (id: string): Promise<void> => {
      const response = await fetchWithAuth(`${API_URL}/news/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete news");
      }
    },
  },
  handbook: {
    findAll: async (all = true): Promise<Handbook[]> => {
      const query = all ? "?all=true" : "";
      const response = await fetchWithAuth(`${API_URL}/handbook${query}`);
      if (!response.ok) throw new Error("Failed to fetch handbooks");
      return response.json();
    },

    findOne: async (id: string): Promise<Handbook> => {
      const response = await fetchWithAuth(`${API_URL}/handbook/${id}`);
      if (!response.ok) throw new Error("Failed to fetch handbook");
      return response.json();
    },

    create: async (data: CreateHandbookDto): Promise<Handbook> => {
      const response = await fetchWithAuth(`${API_URL}/handbook`, {
        method: "POST",
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || "Failed to create handbook");
      }
      return response.json();
    },

    update: async (id: string, data: UpdateHandbookDto): Promise<Handbook> => {
      const response = await fetchWithAuth(`${API_URL}/handbook/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || "Failed to update handbook");
      }
      return response.json();
    },

    remove: async (id: string): Promise<void> => {
      const response = await fetchWithAuth(`${API_URL}/handbook/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete handbook");
    },

    // Upload a PDF, store it on R2, and get back extracted HTML for the editor.
    extract: async (
      file: File,
      lang: "vi" | "en",
    ): Promise<{ pdfUrl: string; html: string }> => {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetchWithAuth(
        `${API_URL}/handbook/extract?lang=${lang}`,
        { method: "POST", body: formData, headers: {} },
      );
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || "Failed to extract PDF");
      }
      return response.json();
    },
  },
  events: {
    create: async (data: CreateEventDto): Promise<Event> => {
      const response = await fetchWithAuth(`${API_URL}/events`, {
        method: "POST",
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Không thể tạo sự kiện");
      }

      return response.json();
    },

    findAll: async (status?: EventStatus): Promise<Event[]> => {
      const query = status ? `?status=${status}` : "";
      const response = await fetchWithAuth(`${API_URL}/events${query}`);

      if (!response.ok) {
        throw new Error("Không thể tải danh sách sự kiện");
      }

      return response.json();
    },

    findOne: async (id: string): Promise<Event> => {
      const response = await fetchWithAuth(`${API_URL}/events/${id}`);

      if (!response.ok) {
        throw new Error("Không thể tải sự kiện");
      }

      return response.json();
    },

    update: async (id: string, data: UpdateEventDto): Promise<Event> => {
      const response = await fetchWithAuth(`${API_URL}/events/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Không thể cập nhật sự kiện");
      }

      return response.json();
    },

    remove: async (id: string): Promise<void> => {
      const response = await fetchWithAuth(`${API_URL}/events/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Không thể xóa sự kiện");
      }
    },
  },
  careerOpportunities: {
    create: async (
      data: CreateCareerOpportunityDto,
    ): Promise<CareerOpportunity> => {
      const response = await fetchWithAuth(`${API_URL}/career-opportunities`, {
        method: "POST",
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Không thể tạo cơ hội nghề nghiệp");
      return response.json();
    },

    findAll: async (filters?: {
      status?: CareerOpportunityStatus;
      type?: CareerOpportunityType;
    }): Promise<CareerOpportunity[]> => {
      const query = new URLSearchParams();
      if (filters?.status) query.set("status", filters.status);
      if (filters?.type) query.set("type", filters.type);
      const suffix = query.size ? `?${query.toString()}` : "";
      const response = await fetchWithAuth(
        `${API_URL}/career-opportunities/admin${suffix}`,
      );
      if (!response.ok)
        throw new Error("Không thể tải danh sách cơ hội nghề nghiệp");
      return response.json();
    },

    findOne: async (id: string): Promise<CareerOpportunity> => {
      const response = await fetchWithAuth(
        `${API_URL}/career-opportunities/admin/${id}`,
      );
      if (!response.ok) throw new Error("Không thể tải cơ hội nghề nghiệp");
      return response.json();
    },

    update: async (
      id: string,
      data: UpdateCareerOpportunityDto,
    ): Promise<CareerOpportunity> => {
      const response = await fetchWithAuth(
        `${API_URL}/career-opportunities/${id}`,
        { method: "PUT", body: JSON.stringify(data) },
      );
      if (!response.ok)
        throw new Error("Không thể cập nhật cơ hội nghề nghiệp");
      return response.json();
    },

    remove: async (id: string): Promise<void> => {
      const response = await fetchWithAuth(
        `${API_URL}/career-opportunities/${id}`,
        { method: "DELETE" },
      );
      if (!response.ok) throw new Error("Không thể xóa cơ hội nghề nghiệp");
    },
  },
  popupBanners: {
    create: async (data: CreatePopupBannerDto): Promise<PopupBanner> => {
      const response = await fetchWithAuth(`${API_URL}/popup-banners`, {
        method: "POST",
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Không thể tạo banner popup");
      }

      return response.json();
    },

    findAll: async (): Promise<PopupBanner[]> => {
      const response = await fetchWithAuth(`${API_URL}/popup-banners`);

      if (!response.ok) {
        throw new Error("Không thể tải danh sách banner popup");
      }

      return response.json();
    },

    findOne: async (id: string): Promise<PopupBanner> => {
      const response = await fetchWithAuth(`${API_URL}/popup-banners/${id}`);

      if (!response.ok) {
        throw new Error("Không thể tải banner popup");
      }

      return response.json();
    },

    update: async (
      id: string,
      data: UpdatePopupBannerDto,
    ): Promise<PopupBanner> => {
      const response = await fetchWithAuth(`${API_URL}/popup-banners/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Không thể cập nhật banner popup");
      }

      return response.json();
    },

    remove: async (id: string): Promise<void> => {
      const response = await fetchWithAuth(`${API_URL}/popup-banners/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Không thể xóa banner popup");
      }
    },
  },
  research: {
    create: async (data: CreateResearchDto): Promise<Research> => {
      const response = await fetchWithAuth(`${API_URL}/research`, {
        method: "POST",
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create research");
      }

      return response.json();
    },

    findAll: async (type?: string): Promise<Research[]> => {
      const query = type ? `?type=${type}` : "";
      const response = await fetchWithAuth(`${API_URL}/research${query}`);

      if (!response.ok) {
        throw new Error("Failed to fetch research");
      }

      return response.json();
    },

    findOne: async (id: string): Promise<Research> => {
      const response = await fetchWithAuth(`${API_URL}/research/${id}`);

      if (!response.ok) {
        throw new Error("Failed to fetch research");
      }

      return response.json();
    },

    update: async (id: string, data: UpdateResearchDto): Promise<Research> => {
      const response = await fetchWithAuth(`${API_URL}/research/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update research");
      }

      return response.json();
    },

    remove: async (id: string): Promise<void> => {
      const response = await fetchWithAuth(`${API_URL}/research/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete research");
      }
    },
  },
  achievements: {
    create: async (data: CreateAchievementDto): Promise<Achievement> => {
      const response = await fetchWithAuth(`${API_URL}/achievements`, {
        method: "POST",
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create achievement");
      }

      return response.json();
    },

    findAll: async (filters?: {
      type?: string;
      level?: string;
      visibility?: string;
      isHighlight?: boolean;
    }): Promise<Achievement[]> => {
      const searchParams = new URLSearchParams();
      if (filters?.type) searchParams.append("type", filters.type);
      if (filters?.level) searchParams.append("level", filters.level);
      if (filters?.visibility)
        searchParams.append("visibility", filters.visibility);
      if (filters?.isHighlight !== undefined)
        searchParams.append("isHighlight", String(filters.isHighlight));

      const response = await fetchWithAuth(
        `${API_URL}/achievements?${searchParams.toString()}`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch achievements");
      }

      return response.json();
    },

    findOne: async (id: string): Promise<Achievement> => {
      const response = await fetchWithAuth(`${API_URL}/achievements/${id}`);

      if (!response.ok) {
        throw new Error("Failed to fetch achievement");
      }

      return response.json();
    },

    update: async (
      id: string,
      data: UpdateAchievementDto,
    ): Promise<Achievement> => {
      const response = await fetchWithAuth(`${API_URL}/achievements/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update achievement");
      }

      return response.json();
    },

    remove: async (id: string): Promise<void> => {
      const response = await fetchWithAuth(`${API_URL}/achievements/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete achievement");
      }
    },
  },
  alumni: {
    create: async (data: CreateAlumniDto): Promise<Alumni> => {
      const response = await fetchWithAuth(`${API_URL}/alumni`, {
        method: "POST",
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create alumni");
      }

      return response.json();
    },

    findAll: async (): Promise<Alumni[]> => {
      const response = await fetchWithAuth(`${API_URL}/alumni`);

      if (!response.ok) {
        throw new Error("Failed to fetch alumni");
      }

      return response.json();
    },

    findOne: async (id: string): Promise<Alumni> => {
      const response = await fetchWithAuth(`${API_URL}/alumni/${id}`);

      if (!response.ok) {
        throw new Error("Failed to fetch alumni");
      }

      return response.json();
    },

    update: async (id: string, data: UpdateAlumniDto): Promise<Alumni> => {
      const response = await fetchWithAuth(`${API_URL}/alumni/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update alumni");
      }

      return response.json();
    },

    remove: async (id: string): Promise<void> => {
      const response = await fetchWithAuth(`${API_URL}/alumni/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete alumni");
      }
    },
  },
  alumniSections: {
    create: async (data: CreateAlumniSectionDto): Promise<AlumniSection> => {
      const response = await fetchWithAuth(`${API_URL}/alumni-sections`, {
        method: "POST",
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create alumni section");
      }

      return response.json();
    },

    findAll: async (): Promise<AlumniSection[]> => {
      const response = await fetchWithAuth(`${API_URL}/alumni-sections`);

      if (!response.ok) {
        throw new Error("Failed to fetch alumni sections");
      }

      return response.json();
    },

    update: async (
      id: string,
      data: UpdateAlumniSectionDto,
    ): Promise<AlumniSection> => {
      const response = await fetchWithAuth(`${API_URL}/alumni-sections/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update alumni section");
      }

      return response.json();
    },

    remove: async (id: string): Promise<void> => {
      const response = await fetchWithAuth(`${API_URL}/alumni-sections/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete alumni section");
      }
    },
  },
  faculty: {
    create: async (data: CreateFacultyDto): Promise<Faculty> => {
      const response = await fetchWithAuth(`${API_URL}/faculty`, {
        method: "POST",
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Không thể tạo hồ sơ giảng viên");
      }

      return response.json();
    },

    findAll: async (): Promise<Faculty[]> => {
      const response = await fetchWithAuth(`${API_URL}/faculty`);

      if (!response.ok) {
        throw new Error("Failed to fetch faculty");
      }

      return response.json();
    },

    findOne: async (id: string): Promise<Faculty> => {
      const response = await fetchWithAuth(`${API_URL}/faculty/${id}`);

      if (!response.ok) {
        throw new Error("Failed to fetch faculty");
      }

      return response.json();
    },

    update: async (id: string, data: UpdateFacultyDto): Promise<Faculty> => {
      const response = await fetchWithAuth(`${API_URL}/faculty/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Không thể cập nhật hồ sơ giảng viên");
      }

      return response.json();
    },

    remove: async (id: string): Promise<void> => {
      const response = await fetchWithAuth(`${API_URL}/faculty/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete faculty");
      }
    },
  },
  studentPortfolio: {
    create: async (data: CreateStudentPortfolioDto): Promise<StudentPortfolio> => {
      const response = await fetchWithAuth(`${API_URL}/student-portfolio`, {
        method: "POST",
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Không thể tạo portfolio sinh viên");
      }

      return response.json();
    },

    findAll: async (): Promise<StudentPortfolio[]> => {
      const response = await fetchWithAuth(
        `${API_URL}/student-portfolio/admin/list`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch student portfolios");
      }

      return response.json();
    },

    findOne: async (id: string): Promise<StudentPortfolio> => {
      const response = await fetchWithAuth(
        `${API_URL}/student-portfolio/admin/${id}`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch student portfolio");
      }

      return response.json();
    },

    update: async (
      id: string,
      data: UpdateStudentPortfolioDto,
    ): Promise<StudentPortfolio> => {
      const response = await fetchWithAuth(
        `${API_URL}/student-portfolio/${id}`,
        {
          method: "PUT",
          body: JSON.stringify(data),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.message || "Không thể cập nhật portfolio sinh viên",
        );
      }

      return response.json();
    },

    remove: async (id: string): Promise<void> => {
      const response = await fetchWithAuth(
        `${API_URL}/student-portfolio/${id}`,
        { method: "DELETE" },
      );

      if (!response.ok) {
        throw new Error("Failed to delete student portfolio");
      }
    },
  },
};

export interface AlumniSection {
  id: string;
  slug: string;
  titleVi?: string;
  titleEn?: string;
  displayOrder?: number;
  isActive: boolean;
}

export type ResearchType = "PROJECT" | "PUBLICATION";
export type ResearchStatus = "ONGOING" | "COMPLETED";
export type ResearchLanguage = "vi" | "en";

export interface CreateResearchDto {
  type: ResearchType;
  title: string;
  slug?: string;
  abstract?: string;
  authors?: string;
  principalInvestigator?: string;
  unit?: string;
  researchField?: string;
  // Project fields
  sponsor?: string;
  fundingAmount?: string;
  startYear?: number;
  endYear?: number;
  status?: ResearchStatus;
  // Publication fields
  journalName?: string;
  publisher?: string;
  publicationYear?: number;
  doi?: string;
  pdfUrl?: string;
  // Metadata
  keywords?: string;
  language?: ResearchLanguage;
}

export type UpdateResearchDto = Partial<CreateResearchDto>;

export interface Research extends CreateResearchDto {
  id: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Achievement Types
export type AchievementType =
  | "HACKATHON"
  | "AWARD"
  | "SCHOLARSHIP"
  | "RESEARCH"
  | "COMPETITION"
  | "OTHER";
export type AchievementLevel = "UNIVERSITY" | "NATIONAL" | "INTERNATIONAL";
export type AchievementVisibility = "PUBLIC" | "INTERNAL";

export interface CreateAchievementDto {
  title: string;
  type: AchievementType;
  description?: string;
  studentNames?: string;
  projectName?: string;
  organization?: string;
  level?: AchievementLevel;
  rank?: string;
  reward?: string;
  achievedYear?: number;
  isHighlight?: boolean;
  visibility?: AchievementVisibility;
  coverImage?: string;
}

export type UpdateAchievementDto = Partial<CreateAchievementDto>;

export interface Achievement extends CreateAchievementDto {
  id: string;
  createdAt: string;
  updatedAt: string;
}

// --- Alumni Types ---

export interface CreateAlumniSectionDto {
  slug: string;
  titleVi?: string;
  titleEn?: string;
  descriptionVi?: string;
  descriptionEn?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export type UpdateAlumniSectionDto = Partial<CreateAlumniSectionDto>;

export interface CreateAcademicProfileDto {
  major?: string;
  thesisTitle?: string;
  advisor?: string;
  researchArea?: string;
  honors?: string;
  notes?: string;
}

export interface CreateCareerDto {
  organization: string;
  role: string;
  industry?: string;
  location?: string;
  startYear?: number;
  endYear?: number;
  description?: string;
}

export interface CreateAlumniAchievementDto {
  type?: string;
  title?: string;
  description?: string;
  year?: number;
  link?: string;
}

export interface CreateContactDto {
  type: string;
  url?: string;
  visibility?: string;
}

export interface CreateSectionMemberDto {
  sectionId: string;
  customTitle?: string;
  customQuote?: string;
  displayOrder?: number;
  isFeatured?: boolean;
}

export interface CreateAlumniMetaDto {
  visibility?: string;
  verifiedBy?: string;
}

export interface CreateAlumniDto {
  fullName: string;
  slug: string;
  avatarUrl?: string;
  graduationYear?: number;
  program?: string;
  degree?: string;
  shortBio?: string;
  personalStory?: string;
  academicProfile?: CreateAcademicProfileDto;
  careers?: CreateCareerDto[];
  achievements?: CreateAlumniAchievementDto[];
  contacts?: CreateContactDto[];
  sectionMembers?: CreateSectionMemberDto[];
  meta?: CreateAlumniMetaDto;
}

export type UpdateAlumniDto = Partial<CreateAlumniDto>;

export interface Alumni extends CreateAlumniDto {
  id: string;
  academicProfile?: CreateAcademicProfileDto;
  careers?: CreateCareerDto[];
  achievements?: CreateAlumniAchievementDto[];
  contacts?: CreateContactDto[];
  sectionMembers?: CreateSectionMemberDto[];
  meta?: CreateAlumniMetaDto;
  createdAt: string;
  updatedAt: string;
}

// --- Student Portfolio Types ---

export interface CreateStudentPortfolioSkillDto {
  category?: string;
  name: string;
  displayOrder?: number;
}

export interface CreateStudentPortfolioProjectDto {
  title: string;
  description?: string;
  imageUrl?: string;
  techStack?: string[];
  role?: string;
  demoUrl?: string;
  repoUrl?: string;
  isFeatured?: boolean;
  displayOrder?: number;
}

export interface CreateStudentPortfolioExperienceDto {
  organization: string;
  role: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  displayOrder?: number;
}

export interface CreateStudentPortfolioEducationDto {
  school: string;
  degree?: string;
  field?: string;
  startYear?: number;
  endYear?: number;
  displayOrder?: number;
}

export interface CreateStudentPortfolioAchievementDto {
  title: string;
  description?: string;
  year?: number;
  link?: string;
  displayOrder?: number;
}

export interface CreateStudentPortfolioContactDto {
  type: string;
  value: string;
  displayOrder?: number;
}

export interface CreateStudentPortfolioDto {
  fullName: string;
  slug: string;
  avatarUrl?: string;
  title?: string;
  shortBio?: string;
  about?: string;
  program?: string;
  studentYear?: number;
  location?: string;
  isPublished?: boolean;
  skills?: CreateStudentPortfolioSkillDto[];
  projects?: CreateStudentPortfolioProjectDto[];
  experiences?: CreateStudentPortfolioExperienceDto[];
  education?: CreateStudentPortfolioEducationDto[];
  achievements?: CreateStudentPortfolioAchievementDto[];
  contacts?: CreateStudentPortfolioContactDto[];
}

export type UpdateStudentPortfolioDto = Partial<CreateStudentPortfolioDto>;

export interface StudentPortfolio extends CreateStudentPortfolioDto {
  id: string;
  isPublished: boolean;
  skills?: (CreateStudentPortfolioSkillDto & { id: string })[];
  projects?: (CreateStudentPortfolioProjectDto & { id: string })[];
  experiences?: (CreateStudentPortfolioExperienceDto & { id: string })[];
  education?: (CreateStudentPortfolioEducationDto & { id: string })[];
  achievements?: (CreateStudentPortfolioAchievementDto & { id: string })[];
  contacts?: (CreateStudentPortfolioContactDto & { id: string })[];
  createdAt: string;
  updatedAt: string;
}

// --- Faculty Types ---

export interface CreateFacultyAcademicTimelineDto {
  degree?: string;
  field?: string;
  institution?: string;
  country?: string;
  startYear?: number;
  endYear?: number;
  description?: string;
  displayOrder?: number;
}

export interface CreateFacultyResearchAreaDto {
  title?: string;
  description?: string;
  displayOrder?: number;
}

export interface CreateFacultyPublicationDto {
  title?: string;
  venue?: string;
  year?: number;
  publicationType?: string;
  doi?: string;
  publisherUrl?: string;
  displayOrder?: number;
}

export interface CreateFacultyCourseDto {
  courseId: string;
}

export interface CreateFacultyContactDto {
  type: string;
  value?: string;
  visibility?: string;
}

export interface CreateFacultyMetaDto {
  profileVisibility?: string;
  updatedBy?: string;
}

export interface CreateFacultyDto {
  fullName: string;
  slug: string;
  avatarUrl?: string;
  academicTitle?: string;
  position?: string;
  department?: string;
  quote?: string;
  bioShort?: string;
  isActive?: boolean;
  academicTimeline?: CreateFacultyAcademicTimelineDto[];
  researchAreas?: CreateFacultyResearchAreaDto[];
  publications?: CreateFacultyPublicationDto[];
  courses?: CreateFacultyCourseDto[];
  contacts?: CreateFacultyContactDto[];
  meta?: CreateFacultyMetaDto;
}

export type UpdateFacultyDto = Partial<CreateFacultyDto>;

export interface Faculty extends CreateFacultyDto {
  id: string;
  createdAt: string;
  updatedAt: string;
}
