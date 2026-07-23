import type { Metadata } from "next";
import { api } from "@/lib/api";
import {
  curriculumDetailHref,
  localizedProgramText,
  normalizeProgramLevel,
  programDetailHref,
  programImage,
  programLevelPath,
  stripProgramHtml,
  type SiteLocale,
} from "@/lib/program-pages";
import { absoluteUrl, buildPageMetadata } from "@/lib/seo";

const summarize = (value: string, fallback: string) => {
  const text = value.trim() || fallback;
  if (text.length <= 160) return text;
  const shortened = text.slice(0, 157);
  return `${shortened.slice(0, shortened.lastIndexOf(" ")).trim()}…`;
};

const unavailableMetadata = (locale: SiteLocale): Metadata => ({
  title: locale === "vi" ? "Không tìm thấy chương trình" : "Program not found",
  robots: { index: false, follow: false },
});

export const isValidLevelSegment = (locale: SiteLocale, segment: string) =>
  locale === "vi"
    ? segment === "dai-hoc" || segment === "sau-dai-hoc"
    : segment === "undergraduate" || segment === "postgraduate";

export const buildEducationLevelMetadata = (
  locale: SiteLocale,
  segment: string,
): Metadata => {
  if (!isValidLevelSegment(locale, segment)) return unavailableMetadata(locale);

  const level = normalizeProgramLevel(segment);
  const viPath = `/vi/chuong-trinh-dao-tao/${programLevelPath("vi", level)}`;
  const enPath = `/en/programs/${programLevelPath("en", level)}`;
  const isGraduate = level === "graduate";
  const title =
    locale === "vi"
      ? `${isGraduate ? "Chương trình sau đại học" : "Chương trình đại học"} ngành Công nghệ Thông tin`
      : `${isGraduate ? "Postgraduate" : "Undergraduate"} Information Technology Programs`;
  const description =
    locale === "vi"
      ? `Khám phá ${isGraduate ? "chương trình sau đại học" : "các chương trình đại học"} về Công nghệ Thông tin, Khoa học Máy tính, Dữ liệu và AI tại Đại học Tân Tạo.`
      : `Explore ${isGraduate ? "postgraduate" : "undergraduate"} programs in Information Technology, Computer Science, Data Science and AI at Tan Tao University.`;

  return buildPageMetadata({
    locale,
    title,
    description,
    path: locale === "vi" ? viPath : enPath,
    alternatePath: locale === "vi" ? enPath : viPath,
    image: "/assets/ttu/programs-academic-partnership.jpg",
  });
};

export async function buildProgramMetadata(
  locale: SiteLocale,
  slug: string,
): Promise<Metadata> {
  try {
    const program = await api.programs.findBySlug(slug, locale);
    const title = localizedProgramText(locale, program.nameVi, program.nameEn);
    const description = summarize(
      stripProgramHtml(
        localizedProgramText(
          locale,
          program.descriptionVi,
          program.descriptionEn,
        ),
      ),
      locale === "vi"
        ? `Thông tin tuyển sinh, nội dung đào tạo và cơ hội nghề nghiệp của chương trình ${title} tại Đại học Tân Tạo.`
        : `Admissions, curriculum and career information for the ${title} program at Tan Tao University.`,
    );
    const viPath = programDetailHref("vi", program);
    const enPath = programDetailHref("en", program);

    return buildPageMetadata({
      locale,
      title: `${title} | SIT - ${locale === "vi" ? "Đại học Tân Tạo" : "Tan Tao University"}`,
      description,
      path: locale === "vi" ? viPath : enPath,
      alternatePath: locale === "vi" ? enPath : viPath,
      image: programImage(program),
    });
  } catch {
    return unavailableMetadata(locale);
  }
}

export async function buildCurriculumMetadata(
  locale: SiteLocale,
  programSlug: string,
  curriculumSlug: string,
): Promise<Metadata> {
  try {
    const curriculum = await api.curriculums.findByProgramAndCurriculumSlug(
      programSlug,
      curriculumSlug,
      locale,
    );
    const title = localizedProgramText(
      locale,
      curriculum.nameVi,
      curriculum.nameEn,
    );
    const description = summarize(
      stripProgramHtml(
        localizedProgramText(
          locale,
          curriculum.descriptionVi,
          curriculum.descriptionEn,
        ),
      ),
      locale === "vi"
        ? `Chi tiết chuẩn đầu ra, cấu trúc học phần và yêu cầu tốt nghiệp của ${title}.`
        : `Learning outcomes, course structure and graduation requirements for ${title}.`,
    );
    const viPath = curriculumDetailHref("vi", curriculum.program, curriculum);
    const enPath = curriculumDetailHref("en", curriculum.program, curriculum);

    return buildPageMetadata({
      locale,
      title: `${title} | SIT - ${locale === "vi" ? "Đại học Tân Tạo" : "Tan Tao University"}`,
      description,
      path: locale === "vi" ? viPath : enPath,
      alternatePath: locale === "vi" ? enPath : viPath,
      image: curriculum.banner || programImage(curriculum.program),
    });
  } catch {
    return unavailableMetadata(locale);
  }
}

export async function buildProgramStructuredData(
  locale: SiteLocale,
  slug: string,
) {
  try {
    const program = await api.programs.findBySlug(slug, locale);
    const name = localizedProgramText(locale, program.nameVi, program.nameEn);
    const description = summarize(
      stripProgramHtml(
        localizedProgramText(
          locale,
          program.descriptionVi,
          program.descriptionEn,
        ),
      ),
      locale === "vi"
        ? `Chương trình ${name} tại Đại học Tân Tạo.`
        : `${name} program at Tan Tao University.`,
    );

    return {
      "@context": "https://schema.org",
      "@type": "EducationalOccupationalProgram",
      name,
      description,
      url: absoluteUrl(programDetailHref(locale, program)),
      image: absoluteUrl(programImage(program)),
      inLanguage: locale === "vi" ? "vi-VN" : "en-US",
      educationalLevel:
        program.level === "postgraduate" ? "Postgraduate" : "Undergraduate",
      provider: {
        "@type": "CollegeOrUniversity",
        name:
          locale === "vi"
            ? "Khoa Công nghệ Thông tin - Đại học Tân Tạo"
            : "School of Information Technology - Tan Tao University",
        url: "https://sit.ttu.edu.vn",
      },
    };
  } catch {
    return undefined;
  }
}

export async function buildCurriculumStructuredData(
  locale: SiteLocale,
  programSlug: string,
  curriculumSlug: string,
) {
  try {
    const curriculum = await api.curriculums.findByProgramAndCurriculumSlug(
      programSlug,
      curriculumSlug,
      locale,
    );
    const name = localizedProgramText(
      locale,
      curriculum.nameVi,
      curriculum.nameEn,
    );
    const programName = localizedProgramText(
      locale,
      curriculum.program.nameVi,
      curriculum.program.nameEn,
    );
    const description = summarize(
      stripProgramHtml(
        localizedProgramText(
          locale,
          curriculum.descriptionVi,
          curriculum.descriptionEn,
        ),
      ),
      locale === "vi"
        ? `Chuẩn đầu ra, cấu trúc học phần và yêu cầu tốt nghiệp của ${name}.`
        : `Learning outcomes, course structure and graduation requirements for ${name}.`,
    );

    return {
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      name,
      description,
      url: absoluteUrl(
        curriculumDetailHref(locale, curriculum.program, curriculum),
      ),
      image: absoluteUrl(
        curriculum.banner || programImage(curriculum.program),
      ),
      inLanguage: locale === "vi" ? "vi-VN" : "en-US",
      dateModified: curriculum.updatedAt,
      learningResourceType: "Curriculum",
      isPartOf: {
        "@type": "EducationalOccupationalProgram",
        name: programName,
        url: absoluteUrl(programDetailHref(locale, curriculum.program)),
      },
      provider: {
        "@type": "CollegeOrUniversity",
        name:
          locale === "vi"
            ? "Khoa Công nghệ Thông tin - Đại học Tân Tạo"
            : "School of Information Technology - Tan Tao University",
        url: "https://sit.ttu.edu.vn",
      },
    };
  } catch {
    return undefined;
  }
}
