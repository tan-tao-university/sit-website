"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  AiBrain01Icon,
  Analytics01Icon,
  SecurityLockIcon,
  SourceCodeIcon,
  ArrowUpRight01Icon,
} from "@hugeicons/core-free-icons";
import { motion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { useEffect, useState } from "react";
import SectionTab from "@/components/SectionTab";
import { api } from "@/lib/api";

type Highlight = { value: string; label: string; description: string };
type Area = { title: string; description: string; projects: string[] };

// ponytail: icon order matches the fixed 4 research areas in i18n (AI, Data, Security, SE)
const AREA_ICONS = [
  AiBrain01Icon,
  Analytics01Icon,
  SecurityLockIcon,
  SourceCodeIcon,
];

// Color the part after "&" when present — one accent keyword per title, like the reference
const AreaTitle = ({ text }: { text: string }) => {
  const parts = text.split(" & ");
  if (parts.length < 2) return <>{text}</>;
  return (
    <>
      {parts[0]} & <span className="text-[#BA4811]">{parts[1]}</span>
    </>
  );
};

const ResearchAreas = () => {
  const t = useTranslations("research");
  const tNav = useTranslations("header.navigation");
  const locale = useLocale();
  const [projectCount, setProjectCount] = useState<number | null>(null);
  const [publicationCount, setPublicationCount] = useState<number | null>(null);

  const highlights: Highlight[] = t.raw("highlights");
  const areas: Area[] = t.raw("areas");

  const researchHref =
    locale === "vi" ? `/${locale}/nghien-cuu` : `/${locale}/research`;

  useEffect(() => {
    let active = true;

    Promise.allSettled([
      api.research.findAll("PROJECT"),
      api.research.findAll("PUBLICATION"),
    ]).then(([projectResult, publicationResult]) => {
      if (!active) return;

      if (projectResult.status === "fulfilled") {
        setProjectCount(projectResult.value.length);
      }

      if (publicationResult.status === "fulfilled") {
        setPublicationCount(publicationResult.value.length);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  const displayHighlights = highlights.map((highlight, index) => {
    if (index === 1) {
      return {
        ...highlight,
        value: projectCount?.toString() ?? "—",
      };
    }

    if (index === 2) {
      return {
        ...highlight,
        value: publicationCount?.toString() ?? "—",
        label: locale === "vi" ? "Bài báo khoa học" : "Scientific publications",
      };
    }

    return highlight;
  });

  return (
    <section className="relative bg-white py-14 sm:py-16">
      <SectionTab label={tNav("research")} />
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"
        >
          <h2 className="max-w-md text-[1.6rem] font-bold leading-tight tracking-tight text-gray-900 sm:text-[1.9rem]">
            {t("title")}
          </h2>
          <p className="max-w-xs text-[12px] leading-relaxed text-gray-500">
            {t("subtitle")}
          </p>
        </motion.div>

        {/* Bento grid: featured area tile (2 cols) + brand stats tile, then 3 small area tiles */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {/* Featured tile — first research area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="sm:col-span-2"
          >
            <Link
              href={researchHref}
              className="group flex h-full flex-col border border-[#dedad5] border-t-4 border-t-[#BA4811] bg-white p-7 transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[8px_8px_0_#f0e5dc] sm:p-8"
            >
              <div className="mb-8 flex items-start justify-between">
                <HugeiconsIcon
                  icon={AREA_ICONS[0]}
                  size={48}
                  strokeWidth={1.2}
                  className="text-gray-900"
                />
                <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-[#BA4811]/50 text-[#BA4811] transition-all duration-300 group-hover:bg-[#BA4811] group-hover:text-white">
                  <HugeiconsIcon icon={ArrowUpRight01Icon} size={17} />
                </div>
              </div>
              <h3 className="mb-2 text-lg font-bold leading-snug tracking-tight text-gray-900 sm:text-xl">
                <AreaTitle text={areas[0].title} />
              </h3>
              <p className="mb-5 max-w-md flex-1 text-[12px] leading-relaxed text-gray-500">
                {areas[0].description}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {areas[0].projects.map((project) => (
                  <span
                    key={project}
                    className="rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-medium text-gray-600"
                  >
                    {project}
                  </span>
                ))}
              </div>
            </Link>
          </motion.div>

          {/* Stats tile — the single brand-color tile in the grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-x-4 gap-y-6 bg-[#BA4811] p-8 text-white [clip-path:polygon(8%_0,100%_0,100%_88%,92%_100%,0_100%,0_12%)]"
          >
            {displayHighlights.map((item) => (
              <div key={item.label}>
                <div className="text-2xl font-bold tracking-tight">
                  {item.value}
                </div>
                <div className="mt-1 text-[11px] leading-snug text-white/70">
                  {item.label}
                </div>
              </div>
            ))}
          </motion.div>

          {/* Remaining area tiles */}
          {areas.slice(1).map((area, index) => (
            <motion.div
              key={area.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Link
                href={researchHref}
                className="group flex h-full flex-col border border-[#dedad5] border-t-2 border-t-transparent bg-white p-6 transition-[border-color,transform,box-shadow] duration-300 hover:-translate-y-1 hover:border-t-[#BA4811] hover:shadow-[6px_6px_0_#f0e5dc]"
              >
                <div className="mb-6 flex items-start justify-between">
                  <HugeiconsIcon
                    icon={AREA_ICONS[(index + 1) % AREA_ICONS.length]}
                    size={38}
                    strokeWidth={1.2}
                    className="text-gray-900"
                  />
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-[#BA4811]/50 text-[#BA4811] transition-all duration-300 group-hover:bg-[#BA4811] group-hover:text-white">
                    <HugeiconsIcon icon={ArrowUpRight01Icon} size={15} />
                  </div>
                </div>
                <h3 className="mb-2 text-[15px] font-bold leading-snug tracking-tight text-gray-900">
                  <AreaTitle text={area.title} />
                </h3>
                <p className="flex-1 text-[12px] leading-relaxed text-gray-500">
                  {area.description}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ResearchAreas;
