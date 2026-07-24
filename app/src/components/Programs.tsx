"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Mortarboard01Icon,
  TeacherIcon,
  MicroscopeIcon,
  ArrowUpRight01Icon,
} from "@hugeicons/core-free-icons";
import { motion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import Link from "next/link";
import SectionTab from "@/components/SectionTab";

import { ArrowIcon } from "@/components/icons/ArrowIcon";

type ProgramItem = {
  title: string;
  code: string;
  description: string;
  slug?: string;
  level?: string;
  banner?: string;
};

const PROGRAM_ORDER: Record<string, number> = {
  "undergraduate:KHMT": 0,
  "undergraduate:TTNT": 1,
  "undergraduate:KHDL": 2,
  "undergraduate:CNTT": 3,
  "postgraduate:KHMT": 4,
};

// ponytail: description from API is HTML; strip tags for the compact list view
const stripHtml = (html: string) =>
  html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;| /g, " ")
    .replace(/\s+/g, " ")
    .trim();

// Topic images (Unsplash, free license) live in /public/assets/programs.
// Used only when the API program has no banner of its own.
const TOPIC_IMAGES: { keywords: string[]; src: string }[] = [
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

const programImage = (program: ProgramItem): string => {
  if (program.banner) return program.banner;
  const haystack = `${program.title} ${program.code}`.toLowerCase();
  const match = TOPIC_IMAGES.find((t) =>
    t.keywords.some((k) => haystack.includes(k)),
  );
  return match?.src ?? "/assets/programs/it.jpg";
};

// ponytail: reference design colors one keyword per card title; the trailing
// words carry the qualifier in both vi/en copy, so highlight the last two
const HighlightedTitle = ({ text }: { text: string }) => {
  const words = text.split(" ");
  if (words.length < 3) return <>{text}</>;
  const head = words.slice(0, -2).join(" ");
  const tail = words.slice(-2).join(" ");
  return (
    <>
      {head} <span className="text-[#BA4811]">{tail}</span>
    </>
  );
};

const ArrowCircle = ({ light = false }: { light?: boolean }) => (
  <div
    className={`flex h-10 w-10 shrink-0 items-center justify-center border transition-all duration-300 ${
      light
        ? "border-white/50 text-white group-hover:bg-white group-hover:text-[#BA4811]"
        : "border-[#BA4811]/50 text-[#BA4811] group-hover:bg-[#BA4811] group-hover:text-white"
    }`}
  >
    <HugeiconsIcon icon={ArrowUpRight01Icon} size={17} />
  </div>
);

const Programs = () => {
  const t = useTranslations("programs");
  const tNav = useTranslations("header.navigation");
  const locale = useLocale();
  const [programs, setPrograms] = useState<ProgramItem[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);

  const shownPrograms = programs.slice(0, 6);
  const activeProgram = shownPrograms[activeIdx] ?? shownPrograms[0];

  const getFallbackPrograms = (): ProgramItem[] => {
    const items: ProgramItem[] = [];
    const programsData = t.raw("programs");

    for (const level of ["undergraduate", "graduate"] as const) {
      if (programsData?.[level]) {
        Object.values(programsData[level]).forEach((category: any) => {
          category.programs?.forEach((program: any) =>
            items.push({ ...program, level }),
          );
        });
      }
    }
    return items;
  };

  useEffect(() => {
    async function fetchPrograms() {
      try {
        const data = await api.programs.findAll({ status: "active" });
        const formatted: ProgramItem[] = data
          .map((item) => ({
            title: locale === "vi" ? item.nameVi : item.nameEn || item.nameVi,
            code: item.code,
            description:
              locale === "vi"
                ? item.descriptionVi || ""
                : item.descriptionEn || item.descriptionVi || "",
            slug: locale === "vi" ? item.slugVi : item.slugEn || item.slugVi,
            level: item.level,
            banner: item.banner,
          }))
          .sort(
            (a, b) =>
              (PROGRAM_ORDER[`${a.level}:${a.code}`] ?? Number.MAX_SAFE_INTEGER) -
              (PROGRAM_ORDER[`${b.level}:${b.code}`] ?? Number.MAX_SAFE_INTEGER),
          );
        setPrograms(formatted.length > 0 ? formatted : getFallbackPrograms());
      } catch (error) {
        console.error("Failed to fetch programs", error);
        setPrograms(getFallbackPrograms());
      }
    }
    fetchPrograms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale]);

  const programHref = (program: ProgramItem) =>
    program.slug && program.level
      ? locale === "vi"
        ? `/${locale}/chuong-trinh-dao-tao/${
            program.level === "undergraduate"
              ? "dai-hoc"
              : program.level === "postgraduate"
                ? "sau-dai-hoc"
                : program.level
          }/${program.slug}`
        : `/${locale}/programs/${program.level}/${program.slug}`
      : "#";

  const featureIcons = [Mortarboard01Icon, TeacherIcon, MicroscopeIcon];

  // Course structured data for search/AI crawlers, kept in sync with the API list
  const courseListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: shownPrograms.map((program, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Course",
        name: program.title,
        description: stripHtml(program.description).slice(0, 200),
        url: `https://sit.ttu.edu.vn${programHref(program)}`,
        provider: {
          "@type": "CollegeOrUniversity",
          name: "Khoa Công nghệ Thông tin - Đại học Tân Tạo",
          sameAs: "https://sit.ttu.edu.vn",
        },
      },
    })),
  };

  return (
    <>
      {shownPrograms.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(courseListSchema).replace(/</g, "\\u003c"),
          }}
        />
      )}
      {/* Why choose SIT — white, minimal cards like the reference */}
      <section className="relative bg-white py-14 sm:py-16">
        <SectionTab label={tNav("about")} />
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"
          >
            <h2 className="max-w-md text-[1.6rem] font-bold leading-tight tracking-tight text-gray-900 sm:text-[1.9rem]">
              {t("whyChoose")}
            </h2>
            <p className="max-w-xs text-[12px] leading-relaxed text-gray-500">
              {t("subtitle")}
            </p>
          </motion.div>

          <div className="grid gap-5 md:grid-cols-3">
            {featureIcons.map((icon, index) => {
              const isMiddle = index === 1;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="group flex flex-col border border-[#ececec] bg-white p-6 transition-shadow duration-300 hover:shadow-md"
                >
                  {!isMiddle && (
                    <div className="mb-7 flex items-start justify-between">
                      <HugeiconsIcon
                        icon={icon}
                        size={44}
                        strokeWidth={1.2}
                        className="text-gray-900"
                      />
                      <ArrowCircle />
                    </div>
                  )}
                  <h3 className="mb-2 text-[15px] font-bold leading-snug tracking-tight text-gray-900">
                    <HighlightedTitle text={t(`features.${index}.title`)} />
                  </h3>
                  <p className="text-[12px] leading-relaxed text-gray-500">
                    {t(`features.${index}.description`)}
                  </p>
                  {isMiddle && (
                    <div className="mt-7 flex flex-1 items-end justify-between">
                      <HugeiconsIcon
                        icon={icon}
                        size={44}
                        strokeWidth={1.2}
                        className="text-gray-900"
                      />
                      <ArrowCircle />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Programs — list + image-reveal pattern */}
      <section className="relative bg-[#f7f4f1] py-14 sm:py-16">
        <SectionTab label={tNav("programs")} />
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-9 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"
          >
            <h2 className="max-w-md text-[1.6rem] font-bold leading-tight tracking-tight text-gray-900 sm:text-[1.9rem]">
              {t("title")}
              <span className="mt-0.5 block text-[#BA4811]">
                {t("titleHighlight")}
              </span>
            </h2>
            <p className="max-w-xs text-[12px] leading-relaxed text-gray-500">
              {t("programsSubtitle")}
            </p>
          </motion.div>

          {/* List + image reveal: hover a program on the left, right panel follows */}
          <div className="grid items-start gap-10 lg:grid-cols-[1fr_0.9fr] lg:gap-16">
            {/* Program list */}
            <div>
              {shownPrograms.map((program, index) => {
                const isActive = index === activeIdx;
                return (
                  <Link
                    key={program.slug || `${program.code}-${index}`}
                    href={programHref(program)}
                    onMouseEnter={() => setActiveIdx(index)}
                    onFocus={() => setActiveIdx(index)}
                    className={`group flex items-baseline gap-4 border-b border-[#e8e2dc] py-5 transition-colors duration-300 first:pt-0 ${
                      isActive ? "text-gray-900" : "text-gray-400"
                    }`}
                  >
                    <span
                      className={`font-mono text-[11px] font-semibold transition-colors duration-300 ${
                        isActive ? "text-[#BA4811]" : "text-gray-300"
                      }`}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="flex-1 text-[16px] font-bold tracking-tight sm:text-[17px]">
                      {program.title}
                    </span>
                    <span
                      aria-hidden
                      className={`text-[#BA4811] transition-all duration-300 ${
                        isActive
                          ? "translate-x-0 opacity-100"
                          : "-translate-x-1 opacity-0"
                      }`}
                    >
                      <ArrowIcon direction="right" size={16} />
                    </span>
                  </Link>
                );
              })}

              <motion.div
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                viewport={{ once: true }}
                className="pt-8"
              >
                <Link
                  href={
                    locale === "vi"
                      ? `/${locale}/chuong-trinh-dao-tao`
                      : `/${locale}/programs`
                  }
                  className="inline-flex items-center gap-2 bg-[#BA4811] px-6 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#9c3c0e]"
                >
                  {t("viewAll")}
                  <span aria-hidden><ArrowIcon direction="right" size={16} /></span>
                </Link>
              </motion.div>
            </div>

            {/* Reveal panel — follows the hovered program */}
            {activeProgram && (
              <div className="hidden lg:block lg:sticky lg:top-24">
                <motion.div
                  key={activeProgram.slug || activeProgram.code || activeIdx}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }}
                  className="overflow-hidden border border-[#dedad5] border-t-4 border-t-[#BA4811] bg-white shadow-[10px_10px_0_rgba(186,72,17,0.08)]"
                >
                  <div className="relative h-52 overflow-hidden">
                    <img
                      src={programImage(activeProgram)}
                      alt={activeProgram.title}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#BA4811]">
                      {t(
                        activeProgram.level === "undergraduate"
                          ? "undergraduate"
                          : "graduate",
                      )}
                    </span>
                  </div>
                  <div className="p-6">
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="text-[16px] font-bold tracking-tight text-gray-900">
                        {activeProgram.title}
                      </h3>
                      {activeProgram.code && (
                        <span className="font-mono text-[10px] text-gray-400">
                          {activeProgram.code}
                        </span>
                      )}
                    </div>
                    {activeProgram.description && (
                      <p className="mb-4 text-[12px] leading-relaxed text-gray-500">
                        {stripHtml(activeProgram.description).slice(0, 180)}...
                      </p>
                    )}
                    <Link
                      href={programHref(activeProgram)}
                      className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#BA4811] hover:text-[#9c3c0e]"
                    >
                      {t("viewDetails")} <span aria-hidden><ArrowIcon direction="right" size={16} /></span>
                    </Link>
                  </div>
                </motion.div>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default Programs;
