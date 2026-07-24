"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { ArrowIcon } from "@/components/icons/ArrowIcon";
import { api } from "@/lib/api";

const Hero = () => {
  const t = useTranslations("hero");
  const tStats = useTranslations("stats");
  const locale = useLocale();
  const reduceMotion = useReducedMotion();

  const dynamicTexts: string[] = t.raw("dynamicTexts");
  const stats: { number: string; label: string }[] = tStats.raw("items");
  const [projectCount, setProjectCount] = useState<number | null>(null);
  const [publicationCount, setPublicationCount] = useState<number | null>(null);
  const programsHref =
    locale === "vi" ? `/${locale}/chuong-trinh-dao-tao` : `/${locale}/programs`;
  const aboutHref =
    locale === "vi" ? `/${locale}/gioi-thieu-chung` : `/${locale}/about-us`;

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

  const displayStats = stats.map((stat, index) => {
    if (index === 1) {
      return {
        ...stat,
        number: projectCount?.toString() ?? "—",
      };
    }

    if (index === 2) {
      return {
        ...stat,
        number: publicationCount?.toString() ?? "—",
      };
    }

    return stat;
  });

  const reveal = {
    hidden: reduceMotion ? { opacity: 1 } : { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section className="relative overflow-hidden bg-white text-[#171b25]">
      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[1.04fr_0.96fr] lg:gap-16 lg:py-16 2xl:grid-cols-[0.98fr_1.02fr] 2xl:gap-20 2xl:py-20">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={reveal}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col justify-center"
        >
          <div className="mb-6 flex items-center gap-4 text-[0.68rem] font-bold uppercase tracking-[0.2em] text-[#a84316]">
            <span className="h-px w-10 bg-current" />
            {t("welcome")}
          </div>

          <h1 className="max-w-[14ch] text-[2.35rem] font-bold leading-[1.06] tracking-[-0.04em] text-balance sm:text-[2.75rem] lg:text-[3.15rem]">
            {t("title")}
            <span className="mt-1 block font-bold text-[#b74717]">
              {dynamicTexts[0]}
            </span>
          </h1>

          <p className="mt-6 max-w-[36rem] text-sm leading-7 text-[#5f625f] sm:text-[0.95rem]">
            {t("subtitle")}
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-x-7 gap-y-4">
            <Link
              href={programsHref}
              className="group inline-flex min-h-12 items-center gap-4 bg-[#ba4911] px-6 text-sm font-semibold text-white transition-[background-color,transform] duration-300 hover:-translate-y-0.5 hover:bg-[#96380d] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ba4911] active:translate-y-0"
            >
              {t("explore")}
              <ArrowIcon
                direction="up-right"
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                strokeWidth={2.2}
              />
            </Link>
            <Link
              href={aboutHref}
              className="group inline-flex min-h-12 items-center gap-3 text-sm font-semibold text-[#5b321f] underline decoration-[#b74717]/40 decoration-1 underline-offset-8 transition-colors hover:text-[#b74717] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#b74717]"
            >
              {t("watchVideo")}
              <ArrowIcon
                direction="right"
                size={16}
                className="transition-transform group-hover:translate-x-1"
                strokeWidth={2.2}
              />
            </Link>
          </div>

          <div className="mt-9 flex flex-wrap gap-x-6 gap-y-2 border-t border-[#171b25]/15 pt-5">
            {dynamicTexts.slice(1, 4).map((topic, index) => (
              <span
                key={topic}
                className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[#6f716c]"
              >
                <span className="mr-2 font-mono text-[#b74717]">0{index + 1}</span>
                {topic}
              </span>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={reduceMotion ? { opacity: 1 } : { opacity: 0, clipPath: "inset(0 0 0 18%)" }}
          animate={{ opacity: 1, clipPath: "inset(0 0 0 0%)" }}
          transition={{ duration: 0.85, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="relative isolate mx-auto aspect-[4/3] w-full max-w-[32rem] lg:justify-self-end 2xl:max-w-[40rem]"
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 -translate-y-3 translate-x-3 bg-[#ba4911] [clip-path:polygon(12%_0,100%_0,100%_82%,88%_100%,0_100%,0_18%)]"
          />
          <div className="absolute inset-0 overflow-hidden bg-[#b74717] [clip-path:polygon(12%_0,100%_0,100%_82%,88%_100%,0_100%,0_18%)]">
            <Image
              src="/assets/ttu/home-students-campus.jpg"
              alt={t("welcome")}
              fill
              priority
              sizes="(min-width: 1024px) 55vw, 100vw"
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,16,24,0.03)_35%,rgba(12,16,24,0.72)_100%)]" />
            <div className="absolute inset-x-6 bottom-6 max-w-[27rem] text-white sm:inset-x-8 sm:bottom-8">
              <div className="flex items-center gap-3">
                <span className="h-px w-8 bg-[#e66a2c]" />
                <p className="font-mono text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-white/80">
                  {t("imageEyebrow")}
                </p>
              </div>
              <p className="mt-3 text-lg font-semibold leading-[1.25] tracking-[-0.02em] text-balance sm:text-xl">
                {t("imageTitle")}
              </p>
              <p className="mt-2 max-w-[36rem] text-[0.72rem] leading-5 text-white/75 sm:text-xs">
                {t("imageDescription")}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="relative border-y border-[#171b25]/15 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 sm:grid-cols-4">
          {displayStats.map((stat, index) => {
            const hasPlus = stat.number.endsWith("+");
            return (
              <div
                key={stat.label}
                className={`px-5 py-6 sm:px-7 lg:px-8 ${index % 2 !== 0 ? "border-l border-[#171b25]/15" : ""} ${index > 1 ? "border-t border-[#171b25]/15 sm:border-t-0" : ""} ${index > 0 ? "sm:border-l sm:border-[#171b25]/15" : ""}`}
              >
                <div className="text-2xl font-bold tracking-[-0.04em] text-[#171b25] sm:text-3xl 2xl:text-[2rem]">
                  {hasPlus ? stat.number.slice(0, -1) : stat.number}
                  {hasPlus && <span className="text-[#b74717]">+</span>}
                </div>
                <p className="mt-2 max-w-[13rem] text-[0.7rem] leading-5 text-[#70716c]">
                  {stat.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Hero;
