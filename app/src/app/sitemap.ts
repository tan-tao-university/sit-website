import type { MetadataRoute } from "next";
import { api, type Program } from "@/lib/api";
import {
  curriculumDetailHref,
  programDetailHref,
} from "@/lib/program-pages";
import {
  absoluteUrl,
  localizedAlternates,
} from "@/lib/seo";

export const revalidate = 3600;

type SitemapEntry = MetadataRoute.Sitemap[number];

const STATIC_ROUTE_PAIRS = [
  ["/vi", "/en"],
  ["/vi/gioi-thieu-chung", "/en/about-us"],
  ["/vi/chuong-trinh-dao-tao", "/en/programs"],
  ["/vi/chuong-trinh-dao-tao/dai-hoc", "/en/programs/undergraduate"],
  ["/vi/chuong-trinh-dao-tao/sau-dai-hoc", "/en/programs/postgraduate"],
  ["/vi/nghien-cuu", "/en/research"],
  ["/vi/nghien-cuu/de-tai-khoa-hoc", "/en/research/scientific-projects"],
  ["/vi/nghien-cuu/bai-bao-khoa-hoc", "/en/research/scientific-publications"],
  ["/vi/sinh-vien", "/en/students"],
  ["/vi/sinh-vien/so-tay", "/en/students/handbook"],
  ["/vi/sinh-vien/hoat-dong", "/en/students/activities"],
  ["/vi/sinh-vien/viec-lam", "/en/students/jobs"],
  ["/vi/sinh-vien/cuu-sinh-vien", "/en/students/alumni"],
  ["/vi/thanh-tich", "/en/achievements"],
  ["/vi/tin-tuc", "/en/news"],
] as const;

const pairedEntries = (
  viPath: string,
  enPath: string,
  lastModified?: string,
): SitemapEntry[] => {
  const alternates = { languages: localizedAlternates(viPath, enPath) };
  return [
    { url: absoluteUrl(viPath), alternates, lastModified },
    { url: absoluteUrl(enPath), alternates, lastModified },
  ];
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries = STATIC_ROUTE_PAIRS.flatMap(([viPath, enPath]) =>
    pairedEntries(viPath, enPath),
  );
  entries.push(
    { url: absoluteUrl("/vi/giang-vien") },
    { url: absoluteUrl("/en/faculty") },
  );

  const [
    programsResult,
    curriculumsResult,
    newsResult,
    handbooksResult,
    facultyResult,
  ] = await Promise.allSettled([
    api.programs.findAll({ status: "active" }),
    api.curriculums.findAll(),
    api.news.findAll(),
    api.handbook.findAll(),
    api.faculty.findAll(),
  ]);

  const programs =
    programsResult.status === "fulfilled" ? programsResult.value : [];
  const curriculums =
    curriculumsResult.status === "fulfilled" ? curriculumsResult.value : [];
  const programById = new Map<string, Program>(
    programs.map((program) => [program.programId, program]),
  );

  for (const program of programs) {
    entries.push(
      ...pairedEntries(
        programDetailHref("vi", program),
        programDetailHref("en", program),
        program.updatedAt,
      ),
    );
  }

  for (const curriculum of curriculums) {
    const program = programById.get(curriculum.programId);
    if (!program) continue;
    entries.push(
      ...pairedEntries(
        curriculumDetailHref("vi", program, curriculum),
        curriculumDetailHref("en", program, curriculum),
        curriculum.updatedAt,
      ),
    );
  }

  if (newsResult.status === "fulfilled") {
    for (const news of newsResult.value.filter(
      (item) => item.status === "published",
    )) {
      entries.push(
        ...pairedEntries(
          `/vi/tin-tuc/${news.slug}`,
          `/en/news/${news.slug}`,
          news.updatedAt,
        ),
      );
    }
  }

  if (handbooksResult.status === "fulfilled") {
    for (const handbook of handbooksResult.value.filter(
      (item) => item.status === "published",
    )) {
      entries.push(
        ...pairedEntries(
          `/vi/sinh-vien/so-tay/${handbook.schoolYear}`,
          `/en/students/handbook/${handbook.schoolYear}`,
          handbook.updatedAt,
        ),
      );
    }
  }

  if (facultyResult.status === "fulfilled") {
    for (const faculty of facultyResult.value.filter(
      (member) => member.isActive !== false,
    )) {
      entries.push({
        url: absoluteUrl(`/vi/giang-vien/${faculty.slug}`),
        lastModified: faculty.updatedAt,
      });
    }
  }

  return entries;
}
