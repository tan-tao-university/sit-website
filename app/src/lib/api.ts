export const API_URL =
  typeof window === "undefined"
    ? process.env.INTERNAL_API_URL ||
      (process.env.NODE_ENV === "production"
        ? "https://sit.ttu.edu.vn/api/backend"
        : "http://localhost:8080/api/v1")
    : "/api/backend";

// --- Types & Interfaces ---

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
  content: Record<string, any>;
}

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

export interface Course extends CreateCourseDto {
  courseId: string;
}

// --- News Types ---

export interface News {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  content: any; // Yoopta JSON
  contentText?: string;
  coverImage?: string;
  category?:
    | "workshop"
    | "achievements"
    | "academic"
    | "business"
    | "events"
    | "general";
  status: "draft" | "published" | "archived";
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Handbook {
  id: string;
  schoolYear: string;
  status: "draft" | "published";
  contentVi?: any; // Yoopta JSON
  contentEn?: any; // Yoopta JSON
  pdfUrlVi?: string;
  pdfUrlEn?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: string;
  titleVi: string;
  titleEn?: string;
  descriptionVi?: string;
  descriptionEn?: string;
  startAt: string;
  endAt?: string;
  locationVi: string;
  locationEn?: string;
  registrationUrl?: string;
  status: "draft" | "published" | "cancelled";
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

export interface CareerOpportunity {
  id: string;
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
  status: "published";
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PopupBanner {
  id: string;
  titleVi: string;
  titleEn?: string;
  imageUrl: string;
  imageAltVi?: string;
  imageAltEn?: string;
  linkUrl: string;
  openInNewTab: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// --- Research Types ---

export enum ResearchType {
  PROJECT = "PROJECT",
  PUBLICATION = "PUBLICATION",
}

export enum ResearchStatus {
  ONGOING = "ONGOING",
  COMPLETED = "COMPLETED",
}

export enum ResearchLanguage {
  VI = "vi",
  EN = "en",
}

export interface Research {
  id: string;
  type: ResearchType;
  title: string;
  slug?: string;
  abstract?: string;
  authors?: string;
  principalInvestigator?: string;
  unit?: string;
  researchField?: string;
  // Project-specific fields
  sponsor?: string;
  fundingAmount?: string;
  startYear?: number;
  endYear?: number;
  status?: ResearchStatus;
  // Publication-specific fields
  journalName?: string;
  publisher?: string;
  publicationYear?: number;
  doi?: string;
  pdfUrl?: string;
  // Metadata
  keywords?: string;
  language?: ResearchLanguage;
  createdAt: string;
  updatedAt: string;
}

// --- Achievement Types ---

export type AchievementType =
  | "HACKATHON"
  | "AWARD"
  | "SCHOLARSHIP"
  | "RESEARCH"
  | "COMPETITION"
  | "OTHER";
export type AchievementLevel = "UNIVERSITY" | "NATIONAL" | "INTERNATIONAL";
export type AchievementVisibility = "PUBLIC" | "INTERNAL";

export interface Achievement {
  id: string;
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
  createdAt: string;
  updatedAt: string;
}

// --- Helper Functions ---

const getHeaders = () => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (typeof window === "undefined" && process.env.API_ACCESS_KEY) {
    headers["X-API-Key"] = process.env.API_ACCESS_KEY;
  }
  return headers;
};

const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  return fetch(url, {
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers,
    },
    credentials: "include", // Send cookies to backend
  });
};

// --- API Client (Read-Only) ---

export const api = {
  programs: {
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

    findBySlug: async (
      slug: string,
      locale: "vi" | "en" = "vi",
    ): Promise<Program> => {
      const response = await fetchWithAuth(
        `${API_URL}/programs/slug/${locale}/${slug}`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch program by slug");
      }

      return response.json();
    },
  },
  curriculums: {
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

    findByProgramAndCurriculumSlug: async (
      programSlug: string,
      curriculumSlug: string,
      locale: "vi" | "en" = "vi",
    ): Promise<Curriculum & { program: Program }> => {
      const response = await fetchWithAuth(
        `${API_URL}/curriculums/by-slug/${locale}/${programSlug}/${curriculumSlug}`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch curriculum by slug");
      }

      return response.json();
    },
  },
  sections: {
    findAll: async (curriculumId?: string): Promise<Section[]> => {
      const query = curriculumId ? `?curriculumId=${curriculumId}` : "";
      const response = await fetchWithAuth(`${API_URL}/sections${query}`);

      if (!response.ok) {
        throw new Error("Failed to fetch sections");
      }

      return response.json();
    },
  },
  courses: {
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
  },
  search: {
    query: async (
      q: string,
    ): Promise<{
      programs: Program[];
      curriculums: Curriculum[];
      news: News[];
      research: Research[];
    }> => {
      const response = await fetchWithAuth(
        `${API_URL}/search?q=${encodeURIComponent(q)}`,
      );

      if (!response.ok) {
        return { programs: [], curriculums: [], news: [], research: [] };
      }

      return response.json();
    },
  },
  news: {
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
  },
  handbook: {
    // Published editions, newest school year first (for the archive list).
    findAll: async (): Promise<Handbook[]> => {
      const response = await fetchWithAuth(`${API_URL}/handbook`);
      if (!response.ok) throw new Error("Failed to fetch handbooks");
      return response.json();
    },

    // Current published edition (latest school year). Throws 404 if none.
    getCurrent: async (): Promise<Handbook> => {
      const response = await fetchWithAuth(`${API_URL}/handbook/current`);
      if (!response.ok) throw new Error("Failed to fetch current handbook");
      return response.json();
    },

    findByYear: async (schoolYear: string): Promise<Handbook> => {
      const response = await fetchWithAuth(
        `${API_URL}/handbook/year/${schoolYear}`,
      );
      if (!response.ok) throw new Error("Failed to fetch handbook");
      return response.json();
    },
  },
  events: {
    findUpcoming: async (limit = 3): Promise<Event[]> => {
      const searchParams = new URLSearchParams({
        upcoming: "true",
        limit: String(limit),
      });
      const response = await fetchWithAuth(
        `${API_URL}/events?${searchParams.toString()}`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch upcoming events");
      }

      return response.json();
    },
  },
  careerOpportunities: {
    findAll: async (filters?: {
      type?: CareerOpportunityType;
      workMode?: CareerWorkMode;
      limit?: number;
    }): Promise<CareerOpportunity[]> => {
      const searchParams = new URLSearchParams();
      if (filters?.type) searchParams.set("type", filters.type);
      if (filters?.workMode) searchParams.set("workMode", filters.workMode);
      if (filters?.limit) searchParams.set("limit", String(filters.limit));
      const query = searchParams.size ? `?${searchParams.toString()}` : "";
      const response = await fetchWithAuth(
        `${API_URL}/career-opportunities${query}`,
        { cache: "no-store" },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch career opportunities");
      }

      return response.json();
    },
  },
  popupBanners: {
    findActive: async (): Promise<PopupBanner | null> => {
      const response = await fetchWithAuth(`${API_URL}/popup-banners/active`);

      if (!response.ok) {
        throw new Error("Failed to fetch active popup banner");
      }

      if (response.status === 204) return null;

      const responseBody = await response.text();
      if (!responseBody.trim()) return null;

      return JSON.parse(responseBody) as PopupBanner | null;
    },
  },
  research: {
    findAll: async (type?: "PROJECT" | "PUBLICATION"): Promise<Research[]> => {
      const searchParams = new URLSearchParams();
      if (type) searchParams.append("type", type);

      const response = await fetchWithAuth(
        `${API_URL}/research?${searchParams.toString()}`,
      );

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
  },
  achievements: {
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
        { cache: "no-store" },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch achievements");
      }

      return response.json();
    },

    findOne: async (id: string): Promise<Achievement> => {
      const response = await fetchWithAuth(`${API_URL}/achievements/${id}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch achievement");
      }

      return response.json();
    },
  },
  alumniSections: {
    findAll: async (): Promise<AlumniSection[]> => {
      const response = await fetchWithAuth(`${API_URL}/alumni-sections`);

      if (!response.ok) {
        throw new Error("Failed to fetch alumni sections");
      }

      return response.json();
    },
  },
  alumni: {
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
  },
  faculty: {
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

    findBySlug: async (slug: string): Promise<Faculty> => {
      const response = await fetchWithAuth(`${API_URL}/faculty/slug/${slug}`);

      if (!response.ok) {
        throw new Error("Failed to fetch faculty by slug");
      }

      return response.json();
    },
  },
  studentPortfolio: {
    findAll: async (): Promise<StudentPortfolio[]> => {
      const response = await fetchWithAuth(`${API_URL}/student-portfolio`);

      if (!response.ok) {
        throw new Error("Failed to fetch student portfolios");
      }

      return response.json();
    },

    findBySlug: async (slug: string): Promise<StudentPortfolio> => {
      const response = await fetchWithAuth(
        `${API_URL}/student-portfolio/${slug}`,
        { cache: "no-store" },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch student portfolio");
      }

      return response.json();
    },
  },
};

// --- Faculty Types ---

export interface FacultyAcademicTimeline {
  id: string;
  facultyId: string;
  degree?: string;
  field?: string;
  institution?: string;
  country?: string;
  startYear?: number;
  endYear?: number;
  description?: string;
  displayOrder?: number;
}

export interface FacultyResearchArea {
  id: string;
  facultyId: string;
  title?: string;
  description?: string;
  displayOrder?: number;
}

export interface FacultyPublication {
  id: string;
  facultyId: string;
  title?: string;
  venue?: string;
  year?: number;
  publicationType?: string;
  doi?: string;
  publisherUrl?: string;
  displayOrder?: number;
}

export interface FacultyCourse {
  id: string;
  facultyId: string;
  courseId: string;
  course?: Course;
}

export interface FacultyContact {
  id: string;
  facultyId: string;
  type?: string;
  value?: string;
  visibility?: string;
}

export interface FacultyMeta {
  facultyId: string;
  profileVisibility?: string;
  lastUpdatedAt?: string;
  updatedBy?: string;
}

export interface Faculty {
  id: string;
  slug: string;
  fullName: string;
  avatarUrl?: string;
  academicTitle?: string;
  position?: string;
  department?: string;
  quote?: string;
  bioShort?: string;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;

  academicTimeline?: FacultyAcademicTimeline[];
  researchAreas?: FacultyResearchArea[];
  publications?: FacultyPublication[];
  courses?: FacultyCourse[];
  contacts?: FacultyContact[];
  meta?: FacultyMeta;
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

export interface AlumniSection extends CreateAlumniSectionDto {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface AlumniAcademicProfile {
  id: string;
  major?: string;
  thesisTitle?: string;
  advisor?: string;
  researchArea?: string;
  honors?: string;
  notes?: string;
}

export interface AlumniCareer {
  id: string;
  organization: string;
  role: string;
  industry?: string;
  location?: string;
  startYear?: number;
  endYear?: number;
  description?: string;
}

export interface AlumniAchievement {
  id: string;
  type?: string;
  title?: string;
  description?: string;
  year?: number;
  link?: string;
}

export interface AlumniContact {
  id: string;
  type: string;
  url?: string;
  visibility?: string;
}

export interface AlumniSectionMember {
  id: string;
  sectionId: string;
  customTitle?: string;
  customQuote?: string;
  displayOrder?: number;
  isFeatured?: boolean;
}

export interface AlumniMeta {
  alumniId: string;
  visibility?: string;
  lastVerifiedAt?: string;
  verifiedBy?: string;
}

export interface Alumni {
  id: string;
  fullName: string;
  slug: string;
  avatarUrl?: string;
  graduationYear?: number;
  program?: string;
  degree?: string;
  shortBio?: string;
  personalStory?: string;

  academicProfile?: AlumniAcademicProfile;
  careers?: AlumniCareer[];
  achievements?: AlumniAchievement[];
  contacts?: AlumniContact[];
  sectionMembers?: AlumniSectionMember[];
  meta?: AlumniMeta;

  createdAt: string;
  updatedAt: string;
}

// --- Student Portfolio Types ---

export interface StudentPortfolioSkill {
  id: string;
  category?: string;
  name: string;
  displayOrder?: number;
}

export interface StudentPortfolioProject {
  id: string;
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

export interface StudentPortfolioExperience {
  id: string;
  organization: string;
  role: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  displayOrder?: number;
}

export interface StudentPortfolioEducation {
  id: string;
  school: string;
  degree?: string;
  field?: string;
  startYear?: number;
  endYear?: number;
  displayOrder?: number;
}

export interface StudentPortfolioAchievement {
  id: string;
  title: string;
  description?: string;
  year?: number;
  link?: string;
  displayOrder?: number;
}

export interface StudentPortfolioContact {
  id: string;
  type: string;
  value: string;
  displayOrder?: number;
}

export interface StudentPortfolio {
  id: string;
  slug: string;
  fullName: string;
  avatarUrl?: string;
  title?: string;
  shortBio?: string;
  about?: string;
  program?: string;
  studentYear?: number;
  location?: string;
  isPublished: boolean;

  skills?: StudentPortfolioSkill[];
  projects?: StudentPortfolioProject[];
  experiences?: StudentPortfolioExperience[];
  education?: StudentPortfolioEducation[];
  achievements?: StudentPortfolioAchievement[];
  contacts?: StudentPortfolioContact[];

  createdAt: string;
  updatedAt: string;
}
