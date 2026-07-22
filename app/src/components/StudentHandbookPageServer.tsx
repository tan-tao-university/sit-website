import { api, type Handbook } from "@/lib/api";
import type { SiteLocale } from "@/lib/program-pages";
import StudentHandbookPageContent from "@/components/StudentHandbookPageContent";

const emptyByLocale = {
  vi: {
    eyebrow: "Sổ tay sinh viên SIT",
    message: "Sổ tay sinh viên đang được cập nhật. Vui lòng quay lại sau.",
  },
  en: {
    eyebrow: "SIT student handbook",
    message: "The student handbook is being updated. Please check back later.",
  },
} as const;

export default async function StudentHandbookPageServer({
  locale,
  schoolYear,
}: {
  locale: SiteLocale;
  schoolYear?: string;
}) {
  let edition: Handbook | null = null;
  let archive: Handbook[] = [];

  try {
    [edition, archive] = await Promise.all([
      schoolYear
        ? api.handbook.findByYear(schoolYear)
        : api.handbook.getCurrent(),
      api.handbook.findAll().catch(() => []),
    ]);
  } catch {
    edition = null;
  }

  if (!edition) {
    const copy = emptyByLocale[locale];
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-white px-5 text-center text-[#171b25]">
        <div>
          <div className="flex items-center justify-center gap-4 font-mono text-[0.64rem] font-semibold uppercase tracking-[0.2em] text-[#BA4811]">
            <span className="h-px w-12 bg-current" />
            {copy.eyebrow}
          </div>
          <p className="mt-6 text-lg text-[#626661]">{copy.message}</p>
        </div>
      </main>
    );
  }

  return (
    <StudentHandbookPageContent
      locale={locale}
      edition={edition}
      archive={archive}
    />
  );
}
