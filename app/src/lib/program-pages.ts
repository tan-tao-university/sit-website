import type { Curriculum, Program } from "@/lib/api";

export type SiteLocale = "vi" | "en";
export type ProgramLevelKey = "undergraduate" | "graduate";

export const normalizeProgramLevel = (
  value?: string,
): ProgramLevelKey =>
  value === "graduate" ||
  value === "postgraduate" ||
  value === "sau-dai-hoc"
    ? "graduate"
    : "undergraduate";

export const apiProgramLevel = (level: ProgramLevelKey) =>
  level === "graduate" ? "postgraduate" : "undergraduate";

export const programsBasePath = (locale: SiteLocale) =>
  locale === "vi" ? "/vi/chuong-trinh-dao-tao" : "/en/programs";

export const programLevelPath = (
  locale: SiteLocale,
  level: ProgramLevelKey,
) => {
  if (locale === "vi") {
    return level === "graduate" ? "sau-dai-hoc" : "dai-hoc";
  }

  return level === "graduate" ? "postgraduate" : "undergraduate";
};

export const programDetailHref = (
  locale: SiteLocale,
  program: Pick<Program, "level" | "slugVi" | "slugEn">,
) => {
  const level = normalizeProgramLevel(program.level);
  const slug = locale === "vi" ? program.slugVi : program.slugEn || program.slugVi;

  return `${programsBasePath(locale)}/${programLevelPath(locale, level)}/${slug}`;
};

export const curriculumDetailHref = (
  locale: SiteLocale,
  program: Pick<Program, "level" | "slugVi" | "slugEn">,
  curriculum: Pick<Curriculum, "slugVi" | "slugEn">,
) => {
  const slug =
    locale === "vi"
      ? curriculum.slugVi
      : curriculum.slugEn || curriculum.slugVi;

  return `${programDetailHref(locale, program)}/${slug}`;
};

export const localizedProgramText = (
  locale: SiteLocale,
  vi?: string,
  en?: string,
) => (locale === "vi" ? vi : en || vi) || "";

export const stripProgramHtml = (html?: string) =>
  (html || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();

const TOPIC_IMAGES = [
  { keywords: ["dữ liệu", "data"], src: "/assets/programs/data.jpg" },
  {
    keywords: ["trí tuệ", "intelligence", "ttnt"],
    src: "/assets/programs/ai.jpg",
  },
  {
    keywords: ["an ninh", "bảo mật", "security", "mạng", "network"],
    src: "/assets/programs/security.jpg",
  },
  {
    keywords: ["phần mềm", "software", "kỹ sư", "engineer"],
    src: "/assets/programs/software.jpg",
  },
  {
    keywords: ["máy tính", "computer"],
    src: "/assets/programs/computer.jpg",
  },
];

export const programImage = (
  program: Pick<Program, "banner" | "nameVi" | "nameEn" | "code">,
) => {
  if (program.banner) return program.banner;

  const searchable = `${program.nameVi} ${program.nameEn || ""} ${program.code}`.toLowerCase();
  return (
    TOPIC_IMAGES.find(({ keywords }) =>
      keywords.some((keyword) => searchable.includes(keyword)),
    )?.src || "/assets/programs/it.jpg"
  );
};
