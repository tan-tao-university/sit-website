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
import { api, type Program } from "@/lib/api";
import {
  apiProgramLevel,
  localizedProgramText,
  normalizeProgramLevel,
  programDetailHref,
  programImage,
  programsBasePath,
  stripProgramHtml,
  type ProgramLevelKey,
  type SiteLocale,
} from "@/lib/program-pages";

import { ArrowIcon } from "@/components/icons/ArrowIcon";

type TranslationProgram = {
  title: string;
  code: string;
  description?: string;
  features?: string;
};

type ProgramCategory = {
  title: string;
  programs: TranslationProgram[];
};

type LevelDetails = {
  hero: {
    breadcrumbs: string[];
    title: string;
    highlight: string;
    subtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
    image: string;
    alt?: string;
  };
  keyDetails: { label: string; value: string; description?: string }[];
  overview: {
    badge: string;
    title: string;
    description: string;
    points: string[];
  };
};

type ProgramsData = Record<ProgramLevelKey, Record<string, ProgramCategory>>;

type DetailsTranslations = {
  shared: {
    keyDetailsTitle: string;
    programCard: {
      codeLabel: string;
      featuresLabel: string;
      ctaLabel: string;
    };
  };
  undergraduate: LevelDetails;
  graduate: LevelDetails;
};

export default function EducationLevelPageContent({ locale }: { locale: SiteLocale }) {
  const params = useParams<{ "education-level": string }>();
  const levelKey = normalizeProgramLevel(params?.["education-level"]);
  const t = useTranslations("programs");
  const reduceMotion = useReducedMotion();
  const [apiPrograms, setApiPrograms] = useState<Program[]>([]);

  const programsData = t.raw("programs") as ProgramsData;
  const details = t.raw("details") as DetailsTranslations;
  const levelDetails = details[levelKey];
  const shared = details.shared;
  const fallbackCategories = useMemo(
    () => Object.values(programsData?.[levelKey] || {}),
    [levelKey, programsData],
  );

  useEffect(() => {
    let active = true;

    api.programs
      .findAll({ level: apiProgramLevel(levelKey), status: "active" })
      .then((data) => {
        if (active) setApiPrograms(data);
      })
      .catch((error) => {
        console.error("Failed to fetch education-level programs:", error);
      });

    return () => {
      active = false;
    };
  }, [levelKey]);

  const reveal = {
    hidden: reduceMotion ? { opacity: 1 } : { opacity: 0, y: 26 },
    visible: { opacity: 1, y: 0 },
  };
  const levelLabel = levelKey === "graduate" ? t("graduate") : t("undergraduate");
  const copy =
    locale === "vi"
      ? {
          chapter: "Hành trình học tập",
          pathway: "Một lộ trình được thiết kế để chuyển hóa kiến thức thành năng lực thực hành.",
          programs: "Các ngành thuộc bậc học",
          programIntro: "Mỗi ngành là một hướng tiếp cận khác nhau, cùng chia sẻ nền tảng công nghệ và tư duy giải quyết vấn đề.",
          discover: "Khám phá chương trình",
          admissionCycle: "Tuyển sinh 2026",
        }
      : {
          chapter: "Learning journey",
          pathway: "A pathway designed to turn academic knowledge into practical capability.",
          programs: "Programs at this level",
          programIntro: "Each program offers a distinct direction while sharing a foundation in technology and problem solving.",
          discover: "Discover the program",
          admissionCycle: "Admissions 2026",
        };

  return (
    <main className="overflow-hidden bg-white text-[#171b25]">
      <section className="relative border-b border-[#171b25]/15 bg-white">
        <div className="mx-auto max-w-7xl px-5 pb-10 pt-7 sm:px-8 sm:pb-12">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-[#8a8d88]">
            <Link
              href={programsBasePath(locale)}
              className="transition-colors hover:text-[#BA4811] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#BA4811]"
            >
              {levelDetails.hero.breadcrumbs[1] || t("title")}
            </Link>
            <span aria-hidden className="text-[#BA4811]">/</span>
            <span className="text-[#4f544f]">{levelLabel}</span>
          </nav>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={reveal}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
            className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end"
          >
            <div>
              <p className="font-mono text-[0.64rem] font-semibold uppercase tracking-[0.2em] text-[#BA4811]">
                {String(levelKey === "undergraduate" ? 1 : 2).padStart(2, "0")} / {levelLabel}
              </p>
              <h1 className="mt-5 max-w-[16ch] text-[3rem] font-bold leading-[1.08] tracking-[-0.04em] text-balance sm:text-[3.8rem] lg:text-[4.4rem]">
                {levelDetails.hero.title}
                <span className="mt-2 block text-[#BA4811]">{levelDetails.hero.highlight}</span>
              </h1>
            </div>
            <div className="border-t border-[#171b25]/18 pt-6 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
              <p className="text-sm leading-7 text-[#60645f]">{levelDetails.hero.subtitle}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="https://tuyensinh.ttu.edu.vn"
                  target="_blank"
                  rel="noreferrer"
                  className="group inline-flex min-h-12 items-center gap-3 bg-[#BA4811] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#96380d] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#BA4811]"
                >
                  {levelDetails.hero.ctaPrimary}
                  <span className="transition-transform group-hover:translate-x-1"><ArrowIcon direction="up-right" size={16} /></span>
                </a>
                <a
                  href="#level-programs"
                  className="inline-flex min-h-12 items-center border border-[#171b25]/25 px-5 text-sm font-semibold text-[#171b25] transition-colors hover:border-[#BA4811] hover:text-[#BA4811] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#BA4811]"
                >
                  {levelDetails.hero.ctaSecondary}
                </a>
              </div>
            </div>
          </motion.div>

          <div className="relative mt-10 h-72 overflow-hidden bg-[#ece8e4] sm:h-96 lg:h-[27rem]">
            <img
              src={levelDetails.hero.image || "/assets/banner-KT2.png"}
              alt={levelDetails.hero.alt || levelDetails.hero.title}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#171b25]/45 to-transparent" />
            <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-6 text-white sm:bottom-6 sm:left-6 sm:right-6">
              <span className="font-mono text-[0.6rem] uppercase tracking-[0.16em]">{copy.admissionCycle} · SIT</span>
              <span className="hidden max-w-md text-right text-xs leading-5 text-white/85 sm:block">{copy.pathway}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[#171b25]/15 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 lg:grid-cols-4">
          {levelDetails.keyDetails.map((detail, index) => (
            <div
              key={detail.label}
              className={`min-h-36 px-5 py-6 sm:px-7 lg:px-8 ${index % 2 ? "border-l border-[#171b25]/15" : ""} ${index > 1 ? "border-t border-[#171b25]/15 lg:border-t-0" : ""} ${index > 0 ? "lg:border-l lg:border-[#171b25]/15" : ""}`}
            >
              <p className="font-mono text-[0.58rem] uppercase tracking-[0.15em] text-[#8a8d88]">{detail.label}</p>
              <p className="mt-3 text-xl font-bold tracking-[-0.035em] sm:text-2xl">{detail.value}</p>
              {detail.description && <p className="mt-2 text-[0.68rem] leading-5 text-[#70716c]">{detail.description}</p>}
            </div>
          ))}
        </div>
      </section>

      <section className="relative bg-[#f7f4f1] py-16 sm:py-20 lg:py-24">
        <SectionTab label={copy.chapter} />
        <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
          <motion.div
            initial="hidden"
            whileInView="visible"
            variants={reveal}
            viewport={{ once: true }}
            className="lg:sticky lg:top-28 lg:self-start"
          >
            <p className="font-mono text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-[#BA4811]">{levelDetails.overview.badge}</p>
            <h2 className="mt-5 max-w-lg text-[2.15rem] font-bold leading-[1.05] tracking-[-0.045em] sm:text-[2.8rem]">
              {levelDetails.overview.title}
            </h2>
            <p className="mt-6 max-w-md text-sm leading-7 text-[#686c67]">{levelDetails.overview.description}</p>
            <p className="mt-8 border-l-2 border-[#BA4811] pl-5 text-base font-semibold leading-7 text-[#414640]">{copy.pathway}</p>
          </motion.div>

          <div className="border-t-2 border-[#171b25]">
            {levelDetails.overview.points.map((point, index) => (
              <motion.article
                key={point}
                initial="hidden"
                whileInView="visible"
                variants={reveal}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="grid gap-5 border-b border-[#cfcac4] py-7 sm:grid-cols-[6rem_1fr] sm:py-9"
              >
                <span className="text-[2.7rem] font-bold leading-none tracking-[-0.06em] text-[#BA4811]">{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <p className="text-base font-semibold leading-7 text-[#313630]">{point}</p>
                  <span className="mt-4 block h-px w-12 bg-[#BA4811]/50" />
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section id="level-programs" className="relative scroll-mt-24 bg-white py-16 sm:py-20 lg:py-24">
        <SectionTab label={copy.programs} />
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-6 border-b-2 border-[#171b25] pb-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
            <div>
              <p className="font-mono text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-[#BA4811]">{shared.keyDetailsTitle}</p>
              <h2 className="mt-4 text-[2.1rem] font-bold leading-tight tracking-[-0.045em] sm:text-[2.7rem]">{copy.programs}</h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-[#686c67] lg:justify-self-end">{copy.programIntro}</p>
          </div>

          {apiPrograms.length > 0 ? (
            <div>
              {apiPrograms.map((program, index) => {
                const title = localizedProgramText(locale, program.nameVi, program.nameEn);
                const description = stripProgramHtml(localizedProgramText(locale, program.descriptionVi, program.descriptionEn));
                const imageOnRight = index % 2 !== 0;

                return (
                  <motion.article
                    key={program.programId}
                    initial="hidden"
                    whileInView="visible"
                    variants={reveal}
                    viewport={{ once: true, margin: "-70px" }}
                    transition={{ duration: 0.55 }}
                    className="group grid border-b border-[#dedad5] lg:grid-cols-12"
                  >
                    <div className={`relative min-h-64 overflow-hidden bg-[#fbf8f5] lg:col-span-5 lg:min-h-80 ${imageOnRight ? "lg:order-2" : ""}`}>
                      <img
                        src={programImage(program)}
                        alt={title}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                      />
                      <span className="absolute left-5 top-5 bg-white px-3 py-2 font-mono text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-[#BA4811]">
                        {program.majorCode || program.code}
                      </span>
                    </div>
                    <div className={`flex flex-col justify-between px-0 py-8 lg:col-span-7 lg:p-10 ${imageOnRight ? "lg:order-1" : ""}`}>
                      <div className="flex items-start justify-between gap-6">
                        <span className="text-[2.8rem] font-bold leading-none tracking-[-0.06em] text-[#d7d1ca]">{String(index + 1).padStart(2, "0")}</span>
                        <span className="font-mono text-[0.58rem] uppercase tracking-[0.14em] text-[#858984]">{levelLabel}</span>
                      </div>
                      <div className="mt-10 max-w-xl">
                        <h3 className="text-2xl font-bold leading-tight tracking-[-0.04em] transition-colors group-hover:text-[#BA4811] sm:text-3xl">{title}</h3>
                        {description && <p className="mt-4 line-clamp-3 text-sm leading-7 text-[#686c67]">{description}</p>}
                        <Link
                          href={programDetailHref(locale, program)}
                          className="mt-7 inline-flex min-h-11 items-center gap-3 border-b border-[#BA4811] text-sm font-semibold text-[#BA4811] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#BA4811]"
                        >
                          {copy.discover}
                          <HugeiconsIcon icon={ArrowUpRight01Icon} size={17} />
                        </Link>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          ) : (
            <div className="space-y-12 pt-10">
              {fallbackCategories.map((category, categoryIndex) => (
                <motion.div
                  key={category.title}
                  initial="hidden"
                  whileInView="visible"
                  variants={reveal}
                  viewport={{ once: true }}
                  className="grid gap-6 lg:grid-cols-[0.35fr_0.65fr]"
                >
                  <div>
                    <span className="font-mono text-[0.62rem] font-semibold text-[#BA4811]">{String(categoryIndex + 1).padStart(2, "0")}</span>
                    <h3 className="mt-3 text-2xl font-bold tracking-[-0.035em]">{category.title}</h3>
                  </div>
                  <div className="border-t-2 border-[#171b25]">
                    {category.programs.map((program) => (
                      <article key={program.code} className="border-b border-[#dedad5] py-6">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <h4 className="max-w-xl text-lg font-bold leading-snug tracking-[-0.02em]">{program.title}</h4>
                          <span className="font-mono text-[0.62rem] uppercase tracking-[0.12em] text-[#BA4811]">{program.code}</span>
                        </div>
                        {program.description && <p className="mt-3 text-[0.78rem] leading-6 text-[#686c67]">{program.description}</p>}
                        {program.features && <p className="mt-4 border-l-2 border-[#BA4811] pl-3 text-[0.68rem] leading-5 text-[#858984]">{program.features}</p>}
                      </article>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      <CtaBanner />
    </main>
  );
}
