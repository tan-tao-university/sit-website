"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import CtaBanner from "@/components/CtaBanner";
import SectionTab from "@/components/SectionTab";
import YooptaRenderer from "@/components/YooptaRenderer";
import { api, type Curriculum, type Program } from "@/lib/api";
import {
  curriculumDetailHref,
  localizedProgramText,
  normalizeProgramLevel,
  programDetailHref,
  programImage,
  programLevelPath,
  programsBasePath,
  stripProgramHtml,
  type ProgramLevelKey,
  type SiteLocale,
} from "@/lib/program-pages";

import { ArrowIcon } from "@/components/icons/ArrowIcon";

type ProgramPageTranslations = {
  shared: {
    applyLabel: string;
    overview: {
      badge: string;
      title: string;
      description: string;
      points: string[];
    };
    curriculum: {
      badge: string;
      title: string;
      description: string;
      placeholder: string;
    };
    career: {
      badge: string;
      title: string;
      points: string[];
    };
  };
  undergraduate: {
    heroTagline: string;
    heroImage: string;
    keyFacts: { label: string; value: string }[];
  };
  graduate: {
    heroTagline: string;
    heroImage: string;
    keyFacts: { label: string; value: string }[];
  };
};

type ProgramSlugTranslations = {
  shared: {
    hero: { inquireLabel: string; applyLabel: string };
    overview: {
      title: string;
      description: string;
      sections: { title: string; points: string[] }[];
    };
    curriculum: { title: string; description: string; placeholder: string };
  };
  undergraduate: {
    hero: { badge: string; fallbackImage: string };
    meta: { school: string; division: string; level: string };
  };
  graduate: {
    hero: { badge: string; fallbackImage: string };
    meta: { school: string; division: string; level: string };
  };
};

const ProgramDetailLoading = () => (
  <main className="min-h-screen animate-pulse bg-white">
    <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:py-20">
      <div className="h-3 w-40 bg-[#ebe6e1]" />
      <div className="mt-10 h-40 max-w-4xl bg-[#ebe6e1]" />
      <div className="mt-10 h-24 max-w-xl bg-[#f2eeea]" />
      <div className="mt-14 h-72 bg-[#e8e2dc]" />
    </section>
  </main>
);

export default function ProgramDetailPageContent({ locale }: { locale: SiteLocale }) {
  const params = useParams<{ "education-level": string; program: string }>();
  const t = useTranslations("programs");
  const reduceMotion = useReducedMotion();
  const [program, setProgram] = useState<Program | null>(null);
  const [curriculums, setCurriculums] = useState<Curriculum[]>([]);
  const [relatedPrograms, setRelatedPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const programPage = t.raw("programPage") as ProgramPageTranslations;
  const slugPage = t.raw("programSlugPage") as ProgramSlugTranslations;

  useEffect(() => {
    let active = true;

    async function fetchProgram() {
      if (!params?.program) return;

      try {
        const programData = await api.programs.findBySlug(params.program, locale);
        if (!active) return;
        setProgram(programData);

        const [curriculumData, relatedData] = await Promise.all([
          programData.programId
            ? api.curriculums.findAll(programData.programId)
            : Promise.resolve([]),
          api.programs.findAll({ level: programData.level, status: "active" }),
        ]);
        if (!active) return;
        setCurriculums(curriculumData);
        setRelatedPrograms(
          relatedData.filter(({ programId }) => programId !== programData.programId),
        );
      } catch (fetchError) {
        console.error("Failed to fetch program detail:", fetchError);
        if (active) setError(true);
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchProgram();
    return () => {
      active = false;
    };
  }, [locale, params?.program]);

  const levelKey: ProgramLevelKey = normalizeProgramLevel(
    program?.level || params?.["education-level"],
  );
  const levelLabel = levelKey === "graduate" ? t("graduate") : t("undergraduate");
  const levelContent = programPage[levelKey];
  const slugLevelContent = slugPage[levelKey];
  const keyFacts = useMemo(
    () =>
      levelContent.keyFacts.map((fact) => ({
        ...fact,
        value: fact.value.replace(
          "{{code}}",
          program?.majorCode || program?.code || "—",
        ),
      })),
    [levelContent.keyFacts, program?.code, program?.majorCode],
  );
  const reveal = {
    hidden: reduceMotion ? { opacity: 1 } : { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0 },
  };
  const copy =
    locale === "vi"
      ? {
          dossier: "Hồ sơ chương trình",
          updated: "Cập nhật tuyển sinh 2026",
          contents: "Trong trang này",
          overview: "Tổng quan",
          curriculum: "Chương trình học",
          career: "Cơ hội nghề nghiệp",
          nextStep: "Bước tiếp theo",
          advice: "Trao đổi với đội ngũ tuyển sinh để được tư vấn lộ trình phù hợp.",
          apply: "Đăng ký tư vấn",
          curriculumIndex: "Danh mục chương trình đào tạo",
          year: "Năm áp dụng",
          duration: "Thời lượng",
          credits: "Tín chỉ",
          semesters: "Học kỳ",
          current: "Hiện hành",
          viewCurriculum: "Xem chi tiết chương trình",
          outcome: "Hướng phát triển",
        }
      : {
          dossier: "Program dossier",
          updated: "Admissions update 2026",
          contents: "On this page",
          overview: "Overview",
          curriculum: "Curriculum",
          career: "Career pathways",
          nextStep: "Your next step",
          advice: "Talk with our admissions team to map a pathway that fits your goals.",
          apply: "Request guidance",
          curriculumIndex: "Curriculum index",
          year: "Effective year",
          duration: "Duration",
          credits: "Credits",
          semesters: "Semesters",
          current: "Current",
          viewCurriculum: "View curriculum details",
          outcome: "Pathway",
        };

  if (loading) return <ProgramDetailLoading />;

  if (error || !program) {
    return (
      <main className="flex min-h-[55vh] items-center justify-center bg-[#f7f4f1] px-5">
        <div className="max-w-lg border-l-4 border-[#BA4811] bg-white p-8">
          <p className="text-xl font-bold tracking-tight text-[#171b25]">
            {locale === "vi" ? "Không tìm thấy chương trình này" : "This program could not be found"}
          </p>
          <Link
            href={programsBasePath(locale)}
            className="mt-6 inline-flex min-h-11 items-center bg-[#BA4811] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#96380d] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#BA4811]"
          >
            {t("viewAll")}
          </Link>
        </div>
      </main>
    );
  }

  const title = localizedProgramText(locale, program.nameVi, program.nameEn);
  const descriptionHtml = localizedProgramText(
    locale,
    program.descriptionVi,
    program.descriptionEn,
  );
  const description = stripProgramHtml(descriptionHtml);
  const hasContent =
    program.content &&
    Object.keys(program.content as Record<string, unknown>).length > 0;
  const banner =
    program.banner ||
    programImage(program) ||
    slugLevelContent.hero.fallbackImage;

  return (
    <main className="overflow-hidden bg-white text-[#171b25]">
      <section className="border-b border-[#171b25]/15 bg-white">
        <div className="mx-auto max-w-7xl px-5 pb-12 pt-7 sm:px-8 lg:pb-16">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-[#8a8d88]">
            <Link href={programsBasePath(locale)} className="transition-colors hover:text-[#BA4811] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#BA4811]">
              {t("title")}
            </Link>
            <span aria-hidden className="text-[#BA4811]">/</span>
            <Link
              href={`${programsBasePath(locale)}/${programLevelPath(locale, levelKey)}`}
              className="transition-colors hover:text-[#BA4811] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#BA4811]"
            >
              {levelLabel}
            </Link>
            <span aria-hidden className="text-[#BA4811]">/</span>
            <span className="max-w-[26rem] truncate text-[#4f544f]">{title}</span>
          </nav>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={reveal}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_21rem] lg:gap-16"
          >
            <div>
              <div className="flex items-center gap-4 font-mono text-[0.64rem] font-semibold uppercase tracking-[0.2em] text-[#BA4811]">
                <span className="h-px w-12 bg-current" />
                {copy.dossier} · {program.majorCode || program.code}
              </div>
              <h1 className="mt-7 max-w-[17ch] text-[2.75rem] font-bold leading-[1.08] tracking-[-0.032em] text-balance text-[#171b25] sm:text-[3.4rem] lg:text-[4rem]">
                {title}
              </h1>
              <p className="mt-7 max-w-2xl text-sm leading-7 text-[#60645f] sm:text-[0.95rem]">
                {description || levelContent.heroTagline}
              </p>
            </div>

            <aside className="border-t-2 border-[#BA4811] pt-5 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
              <p className="font-mono text-[0.58rem] uppercase tracking-[0.16em] text-[#8a8d88]">{copy.updated}</p>
              <div className="mt-6 grid grid-cols-2 gap-x-5 gap-y-7 lg:grid-cols-1">
                {keyFacts.map((fact) => (
                  <div key={fact.label}>
                    <p className="font-mono text-[0.56rem] uppercase tracking-[0.14em] text-[#8a8d88]">{fact.label}</p>
                    <p className="mt-2 text-sm font-semibold leading-6 text-[#171b25]">{fact.value}</p>
                  </div>
                ))}
              </div>
              <a
                href="https://tuyensinh.ttu.edu.vn"
                target="_blank"
                rel="noreferrer"
                className="group mt-8 flex min-h-12 items-center justify-between bg-[#BA4811] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#96380d] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#BA4811]"
              >
                {slugPage.shared.hero.applyLabel || programPage.shared.applyLabel}
                <span className="transition-transform group-hover:translate-x-1"><ArrowIcon direction="up-right" size={16} /></span>
              </a>
            </aside>
          </motion.div>
        </div>

        <div className="relative mx-auto h-64 max-w-7xl overflow-hidden sm:h-80 lg:h-[25rem]">
          <img src={banner} alt={title} className="h-full w-full object-cover" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#171b25]/55 to-transparent" />
          <div className="absolute inset-x-5 bottom-6 mx-auto flex max-w-7xl items-end justify-between gap-6 sm:inset-x-8">
            <p className="max-w-xl text-lg font-semibold leading-7 text-white sm:text-xl">{levelContent.heroTagline}</p>
            <span className="hidden font-mono text-[0.6rem] uppercase tracking-[0.16em] text-white/70 sm:block">SIT · Tan Tao University</span>
          </div>
        </div>
      </section>

      <section id="program-overview" className="relative scroll-mt-24 bg-[#f7f4f1] py-16 sm:py-20 lg:py-24">
        <SectionTab label={programPage.shared.overview.badge} />
        <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[11rem_minmax(0,1fr)] lg:gap-16">
          <nav className="lg:sticky lg:top-28 lg:self-start" aria-label={copy.contents}>
            <p className="font-mono text-[0.6rem] font-semibold uppercase tracking-[0.17em] text-[#BA4811]">{copy.contents}</p>
            <div className="mt-5 border-t-2 border-[#171b25]">
              {[
                ["#program-overview", copy.overview],
                ["#curriculum", copy.curriculum],
                ["#career", copy.career],
              ].map(([href, label], index) => (
                <a key={href} href={href} className="grid min-h-12 grid-cols-[2rem_1fr] items-center border-b border-[#d4cec8] text-[0.72rem] font-semibold text-[#5f635e] transition-colors hover:text-[#BA4811] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#BA4811]">
                  <span className="font-mono text-[0.58rem] text-[#BA4811]">0{index + 1}</span>
                  {label}
                </a>
              ))}
            </div>
          </nav>

          <div>
            <motion.div initial="hidden" whileInView="visible" variants={reveal} viewport={{ once: true }}>
              <p className="font-mono text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-[#BA4811]">{programPage.shared.overview.badge}</p>
              <h2 className="mt-4 max-w-xl text-[2.2rem] font-bold leading-[1.05] tracking-[-0.045em] sm:text-[2.9rem]">{slugPage.shared.overview.title}</h2>
              <p className="mt-6 max-w-3xl text-base leading-8 text-[#686c67]">{slugPage.shared.overview.description}</p>
            </motion.div>

            {hasContent && (
              <motion.div
                initial="hidden"
                whileInView="visible"
                variants={reveal}
                viewport={{ once: true }}
                className="mt-10 border-t border-[#d6d0ca] pt-8"
              >
                <YooptaRenderer value={program.content} className="[&_h1]:text-[#171b25] [&_h2]:text-[#171b25] [&_h3]:text-[#171b25] [&_p]:text-base [&_p]:leading-8 [&_p]:text-[#5f635e]" />
              </motion.div>
            )}

            <div className="mt-10 border-t-2 border-[#171b25]">
              {slugPage.shared.overview.sections.map((section, sectionIndex) => (
                <motion.article
                  key={section.title}
                  initial="hidden"
                  whileInView="visible"
                  variants={reveal}
                  viewport={{ once: true, margin: "-50px" }}
                  className="grid gap-6 border-b border-[#d4cec8] py-8 sm:grid-cols-[3.5rem_1fr]"
                >
                  <span className="text-[2rem] font-bold leading-none tracking-[-0.05em] text-[#BA4811]">0{sectionIndex + 1}</span>
                  <div>
                    <h3 className="text-xl font-bold tracking-[-0.03em]">{section.title}</h3>
                    <div className="mt-5 divide-y divide-[#d9d3cd] border-t border-[#d9d3cd]">
                      {section.points.map((point, index) => (
                        <p key={point} className="grid grid-cols-[2.5rem_1fr] gap-4 py-4 text-base leading-7 text-[#5f635e] sm:text-[1.05rem]">
                          <span className="pt-0.5 font-mono text-[0.68rem] text-[#BA4811]">{String(index + 1).padStart(2, "0")}</span>
                          <span>{point}</span>
                        </p>
                      ))}
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>

        </div>
      </section>

      <section className="border-b border-[#171b25]/15 bg-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-5 py-8 sm:px-8 sm:py-10 lg:grid-cols-[10rem_minmax(0,1fr)_auto] lg:items-center lg:gap-10">
          <p className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[#BA4811]">{copy.nextStep}</p>
          <p className="max-w-3xl text-xl font-bold leading-8 tracking-[-0.025em] text-[#171b25] sm:text-2xl">{copy.advice}</p>
          <a
            href="https://www.facebook.com/sit.ttu.edu.vn"
            target="_blank"
            rel="noreferrer"
            className="group inline-flex min-h-12 items-center justify-between gap-8 bg-[#BA4811] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#96380d] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#BA4811]"
          >
            {copy.apply}
            <HugeiconsIcon icon={ArrowUpRight01Icon} size={17} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
          </a>
        </div>
      </section>

      <section id="curriculum" className="relative scroll-mt-24 bg-white py-16 sm:py-20 lg:py-24">
        <SectionTab label={programPage.shared.curriculum.badge} />
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-6 border-b-2 border-[#171b25] pb-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-end">
            <div>
              <p className="font-mono text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-[#BA4811]">{copy.curriculumIndex}</p>
              <h2 className="mt-4 text-[2.2rem] font-bold leading-tight tracking-[-0.045em] sm:text-[2.9rem]">{slugPage.shared.curriculum.title}</h2>
            </div>
            <p className="max-w-xl text-base leading-8 text-[#686c67] lg:justify-self-end">{slugPage.shared.curriculum.description}</p>
          </div>

          {curriculums.length > 0 ? (
            <div>
              {curriculums.map((curriculum, index) => {
                const curriculumName = localizedProgramText(locale, curriculum.nameVi, curriculum.nameEn);
                return (
                  <motion.div
                    key={curriculum.curriculumId}
                    initial="hidden"
                    whileInView="visible"
                    variants={reveal}
                    viewport={{ once: true, margin: "-40px" }}
                    className="border-b border-[#dedad5]"
                  >
                    <Link
                      href={curriculumDetailHref(locale, program, curriculum)}
                      aria-label={`${copy.viewCurriculum}: ${curriculumName}`}
                      className="group grid gap-5 px-3 py-7 transition-colors hover:bg-[#fbf8f5] focus-visible:bg-[#fbf8f5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#BA4811] sm:grid-cols-[3rem_minmax(0,1fr)_8rem] sm:items-center lg:grid-cols-[4rem_minmax(0,1fr)_8rem_9rem_3rem]"
                    >
                      <span className="font-mono text-[0.72rem] font-semibold text-[#BA4811]">{String(index + 1).padStart(2, "0")}</span>
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-xl font-bold leading-snug tracking-[-0.025em] transition-colors group-hover:text-[#BA4811] sm:text-[1.35rem]">{curriculumName}</h3>
                          {curriculum.isCurrent && <span className="border border-[#BA4811]/35 px-2.5 py-1 font-mono text-[0.62rem] uppercase tracking-[0.1em] text-[#BA4811]">{copy.current}</span>}
                        </div>
                        <p className="mt-2 font-mono text-[0.72rem] uppercase tracking-[0.08em] text-[#70746f]">{copy.year}: {curriculum.year}</p>
                      </div>
                      <div className="font-mono text-[0.72rem] uppercase tracking-[0.07em] text-[#70746f]">
                        <span className="block text-[#a19d98]">{copy.duration}</span>
                        <span className="mt-1 block font-semibold text-[#4f544f]">{curriculum.durationYears ? `${curriculum.durationYears} ${locale === "vi" ? "năm" : "years"}` : "—"}</span>
                      </div>
                      <div className="hidden font-mono text-[0.72rem] uppercase tracking-[0.07em] text-[#70746f] lg:block">
                        <span className="block text-[#a19d98]">{copy.credits} / {copy.semesters}</span>
                        <span className="mt-1 block font-semibold text-[#4f544f]">{curriculum.totalCredits || "—"} / {curriculum.totalSemesters || "—"}</span>
                      </div>
                      <span className="flex h-10 w-10 items-center justify-center justify-self-end border border-[#BA4811]/35 text-[#BA4811] transition-colors group-hover:bg-[#BA4811] group-hover:text-white">
                        <HugeiconsIcon icon={ArrowUpRight01Icon} size={17} />
                      </span>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="border-b border-[#dedad5] py-16 text-center text-sm text-[#686c67]">{slugPage.shared.curriculum.placeholder}</div>
          )}
        </div>
      </section>

      <section id="career" className="relative scroll-mt-24 border-y border-[#171b25]/15 bg-white py-16 text-[#171b25] sm:py-20 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[0.68fr_1.32fr] lg:gap-20">
          <div>
            <p className="font-mono text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-[#BA4811]">{programPage.shared.career.badge}</p>
            <h2 className="mt-5 max-w-md text-[2.2rem] font-bold leading-[1.05] tracking-[-0.045em] sm:text-[2.9rem]">{programPage.shared.career.title}</h2>
            <p className="mt-7 border-l-2 border-[#BA4811] pl-5 text-sm leading-7 text-[#686c67]">{levelContent.heroTagline}</p>
          </div>
          <div className="border-t-2 border-[#BA4811]">
            {programPage.shared.career.points.map((point, index) => (
              <motion.article
                key={point}
                initial="hidden"
                whileInView="visible"
                variants={reveal}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: index * 0.05 }}
                className="group grid min-h-24 grid-cols-[3.5rem_1fr_auto] items-center gap-4 border-b border-[#dedad5] py-5"
              >
                <span className="font-mono text-[0.64rem] font-semibold text-[#BA4811]">0{index + 1}</span>
                <p className="text-base font-semibold leading-7 sm:text-lg">{point}</p>
                <span className="text-[#BA4811] transition-transform group-hover:translate-x-1"><ArrowIcon direction="right" size={16} /></span>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {relatedPrograms.length > 0 && (
        <section className="relative bg-[#f7f4f1] py-16 sm:py-20">
          <SectionTab label={t("relatedPrograms")} />
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <h2 className="max-w-lg text-[2.1rem] font-bold leading-tight tracking-[-0.045em] sm:text-[2.7rem]">{t("exploreOtherPrograms")}</h2>
            <div className="mt-9 border-t-2 border-[#171b25]">
              {relatedPrograms.slice(0, 4).map((relatedProgram, index) => (
                <Link
                  key={relatedProgram.programId}
                  href={programDetailHref(locale, relatedProgram)}
                  className="group grid gap-3 border-b border-[#d6d0ca] py-5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#BA4811] sm:grid-cols-[3rem_1fr_auto] sm:items-center"
                >
                  <span className="font-mono text-[0.64rem] font-semibold text-[#BA4811]">{String(index + 1).padStart(2, "0")}</span>
                  <span className="text-lg font-bold tracking-[-0.025em] transition-colors group-hover:text-[#BA4811]">
                    {localizedProgramText(locale, relatedProgram.nameVi, relatedProgram.nameEn)}
                  </span>
                  <span className="flex h-10 w-10 items-center justify-center border border-[#BA4811]/35 text-[#BA4811] transition-colors group-hover:bg-[#BA4811] group-hover:text-white">
                    <HugeiconsIcon icon={ArrowUpRight01Icon} size={17} />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <CtaBanner />
    </main>
  );
}
