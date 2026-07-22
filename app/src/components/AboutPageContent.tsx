"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  Target02Icon,
  VisionIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import SectionTab from "@/components/SectionTab";

import { ArrowIcon } from "@/components/icons/ArrowIcon";

const AboutPageContent = () => {
  const t = useTranslations("about");
  const locale = useLocale();
  const reduceMotion = useReducedMotion();

  const programsHref =
    locale === "vi" ? `/${locale}/chuong-trinh-dao-tao` : `/${locale}/programs`;
  const educationItems = [
    {
      title: t("liberalArtsTitle"),
      description: t("liberalArtsDescription"),
    },
    {
      title: t("lifelongLearningTitle"),
      description: t("lifelongLearningDescription"),
    },
    {
      title: t("qualityAssuranceTitle"),
      description: t("qualityAssuranceDescription"),
    },
  ];
  const operatingItems = [
    {
      title: t("organizationalStructureTitle"),
      description: t("organizationText"),
    },
    {
      title: t("facultyExcellenceTitle"),
      description: t("facultyText"),
    },
    {
      title: t("technologyIntegrationTitle"),
      description: t("technologyIntegrationDescription"),
    },
    {
      title: t("transparentEnvironmentTitle"),
      description: t("transparentEnvironmentDescription"),
    },
  ];
  const values = t.raw("valuesList") as string[];
  const reveal = {
    hidden: reduceMotion ? { opacity: 1 } : { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <main className="overflow-hidden bg-white text-[#171b25]">
      <section className="relative bg-white">
        <SectionTab label={t("title")} />
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[1.02fr_0.98fr] lg:gap-16 lg:py-16 2xl:grid-cols-[0.98fr_1.02fr] 2xl:gap-20 2xl:py-20">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={reveal}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="mb-6 flex items-center gap-4 text-[0.68rem] font-bold uppercase tracking-[0.2em] text-[#BA4811]">
              <span className="h-px w-10 bg-current" />
              {t("title")}
            </div>
            <h1 className="max-w-[13ch] text-[2.35rem] font-bold leading-[1.06] tracking-[-0.04em] text-balance sm:text-[2.75rem] lg:text-[3.15rem] 2xl:text-[3.6rem]">
              {t("subtitle")}
            </h1>
            <p className="mt-6 max-w-[38rem] text-sm leading-7 text-[#60645f] sm:text-[0.95rem] 2xl:text-base 2xl:leading-8">
              {t("description")}
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-x-7 gap-y-4">
              <Link
                href={programsHref}
                className="group inline-flex min-h-12 items-center gap-4 bg-[#BA4811] px-6 text-sm font-semibold text-white transition-[background-color,transform] duration-300 hover:-translate-y-0.5 hover:bg-[#96380d] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#BA4811] active:translate-y-0"
              >
                {t("explorePrograms")}
                <span className="text-lg transition-transform group-hover:translate-x-1"><ArrowIcon direction="up-right" size={16} /></span>
              </Link>
              <a
                href="#history"
                className="group inline-flex min-h-12 items-center gap-3 text-sm font-semibold text-[#5b321f] underline decoration-[#BA4811]/40 underline-offset-8 transition-colors hover:text-[#BA4811] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#BA4811]"
              >
                {t("history")}
                <span className="transition-transform group-hover:translate-x-1"><ArrowIcon direction="down" size={16} /></span>
              </a>
            </div>

            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-2 border-t border-[#171b25]/15 pt-5">
              {[t("philosophyText"), t("values"), t("vision")].map(
                (topic, index) => (
                  <span
                    key={topic}
                    className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-[#70736f]"
                  >
                    <span className="mr-2 font-mono text-[#BA4811]">0{index + 1}</span>
                    {topic}
                  </span>
                ),
              )}
            </div>
          </motion.div>

          <motion.div
            initial={
              reduceMotion
                ? { opacity: 1 }
                : { opacity: 0, clipPath: "inset(0 0 0 18%)" }
            }
            animate={{ opacity: 1, clipPath: "inset(0 0 0 0%)" }}
            transition={{
              duration: 0.85,
              delay: 0.08,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="relative isolate mx-auto aspect-[4/3] w-full max-w-[34rem] lg:justify-self-end 2xl:max-w-[40rem]"
          >
            <div
              aria-hidden="true"
              className="absolute inset-0 -translate-y-3 translate-x-3 bg-[#BA4811] [clip-path:polygon(12%_0,100%_0,100%_82%,88%_100%,0_100%,0_18%)]"
            />
            <div className="absolute inset-0 overflow-hidden bg-[#BA4811] [clip-path:polygon(12%_0,100%_0,100%_82%,88%_100%,0_100%,0_18%)]">
              <Image
                src="/assets/ttu/about-tan-tao-campus.jpg"
                alt={t("heroImageAlt")}
                fill
                priority
                sizes="(min-width: 1024px) 48vw, 100vw"
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,16,24,0.02)_38%,rgba(12,16,24,0.68)_100%)]" />
              <div className="absolute inset-x-6 bottom-6 text-white sm:inset-x-8 sm:bottom-8">
                <div className="max-w-[27rem] border-l-2 border-[#e96a2d] pl-4 sm:pl-5">
                  <p className="font-mono text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-white/70">
                    {t("heroMediaEyebrow")}
                  </p>
                  <p className="mt-2 text-xl font-semibold leading-tight tracking-[-0.025em] text-balance sm:text-2xl">
                    {t("heroMediaTitle")}
                  </p>
                  <p className="mt-3 text-[0.7rem] leading-5 text-white/75 sm:text-xs">
                    {t("heroMediaDescription")}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="border-y border-[#171b25]/15 bg-white">
          <div className="mx-auto grid max-w-7xl grid-cols-2 sm:grid-cols-4">
            {[
              ["2011", t("founded")],
              ["100%", t("facultyLevel")],
              ["05", t("programs")],
              ["2030", t("visionYear")],
            ].map(([value, label], index) => (
              <div
                key={label}
                className={`px-5 py-6 sm:px-7 lg:px-8 ${
                  index % 2 !== 0 ? "border-l border-[#171b25]/15" : ""
                } ${index > 1 ? "border-t border-[#171b25]/15 sm:border-t-0" : ""} ${
                  index > 0 ? "sm:border-l sm:border-[#171b25]/15" : ""
                }`}
              >
                <div className="text-2xl font-bold tracking-[-0.04em] sm:text-3xl">
                  {value}
                </div>
                <p className="mt-2 text-[0.7rem] leading-5 text-[#70716c]">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="history" className="relative bg-[#f7f4f1] py-14 sm:py-16">
        <SectionTab label={t("history")} />
        <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
          <motion.div
            initial="hidden"
            whileInView="visible"
            variants={reveal}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="max-w-sm text-[1.8rem] font-bold leading-tight tracking-[-0.035em] sm:text-[2.1rem]">
              {t("history")}
            </h2>
            <div className="mt-8 text-[4.5rem] font-bold leading-none tracking-[-0.07em] text-[#BA4811] sm:text-[6rem]">
              2011
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            variants={reveal}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="border-t-2 border-[#BA4811] pt-6"
          >
            <p className="max-w-3xl text-base leading-8 text-[#343a43] sm:text-lg">
              {t("historyText")}
            </p>
            <div className="mt-8 grid gap-5 border-t border-[#d9d4cf] pt-6 sm:grid-cols-2">
              <div>
                <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-[#8b8f96]">
                  {t("whatWeDo")}
                </p>
                <p className="mt-3 text-sm leading-7 text-[#646863]">{t("description")}</p>
              </div>
              <div>
                <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-[#8b8f96]">
                  {t("faculty")}
                </p>
                <p className="mt-3 text-sm leading-7 text-[#646863]">{t("facultyText")}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="relative bg-white py-14 sm:py-16">
        <SectionTab label={t("howWeEducate")} />
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            variants={reveal}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-10 grid gap-5 lg:grid-cols-[1fr_0.7fr] lg:items-end"
          >
            <h2 className="max-w-xl text-[1.8rem] font-bold leading-tight tracking-[-0.035em] sm:text-[2.1rem]">
              {t("howWeDoIt")}
            </h2>
            <p className="max-w-md text-sm leading-7 text-[#686c67] lg:justify-self-end">
              {t("philosophyDetails.liberalArts.description")}
            </p>
          </motion.div>

          <div className="grid gap-5 md:grid-cols-3">
            {educationItems.map((item, index) => (
              <motion.article
                key={item.title}
                initial="hidden"
                whileInView="visible"
                variants={reveal}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="group flex min-h-64 flex-col border border-[#dedad5] bg-white p-6 transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-[#BA4811] hover:shadow-[8px_8px_0_#eadfd6]"
              >
                <div className="mb-10 flex items-center justify-between">
                  <span className="font-mono text-[0.68rem] font-semibold text-[#BA4811]">
                    0{index + 1}
                  </span>
                  <span className="h-px w-10 bg-[#BA4811]/45 transition-all duration-300 group-hover:w-16" />
                </div>
                <h3 className="text-lg font-bold tracking-tight">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#686c67]">{item.description}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative bg-[#f7f4f1] py-14 sm:py-16">
        <SectionTab label={t("mission")} />
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mb-10 grid gap-5 lg:grid-cols-[0.75fr_1.25fr] lg:items-end">
            <h2 className="text-[1.8rem] font-bold leading-tight tracking-[-0.035em] sm:text-[2.1rem]">
              {t("mission")} &amp; {t("vision")}
            </h2>
            <p className="max-w-xl text-sm leading-7 text-[#686c67] lg:justify-self-end">
              {t("valuesText")}
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <motion.article
              initial="hidden"
              whileInView="visible"
              variants={reveal}
              viewport={{ once: true }}
              className="border border-[#dedad5] bg-white p-7 sm:p-9"
            >
              <div className="flex h-11 w-11 items-center justify-center border border-[#BA4811]/50 text-[#BA4811]">
                <HugeiconsIcon icon={Target02Icon} size={20} strokeWidth={1.5} />
              </div>
              <h3 className="mt-8 text-xl font-bold tracking-tight">{t("mission")}</h3>
              <p className="mt-4 text-sm leading-7 text-[#60645f]">{t("missionText")}</p>
            </motion.article>

            <motion.article
              initial="hidden"
              whileInView="visible"
              variants={reveal}
              viewport={{ once: true }}
              transition={{ delay: 0.08 }}
              className="relative overflow-hidden bg-[#BA4811] p-7 text-white [clip-path:polygon(0_0,100%_0,100%_84%,94%_100%,0_100%)] sm:p-9"
            >
              <div className="flex h-11 w-11 items-center justify-center border border-white/45">
                <HugeiconsIcon icon={VisionIcon} size={20} strokeWidth={1.5} />
              </div>
              <h3 className="mt-8 text-xl font-bold tracking-tight">{t("vision")}</h3>
              <p className="mt-4 max-w-xl text-sm leading-7 text-white/80">{t("visionText")}</p>
            </motion.article>
          </div>

          <div className="mt-5 grid border border-[#dedad5] bg-white sm:grid-cols-2 lg:grid-cols-7">
            {values.map((value, index) => (
              <div
                key={value}
                className={`flex min-h-24 items-center gap-3 px-5 py-5 ${
                  index > 0 ? "border-t border-[#dedad5] lg:border-l lg:border-t-0" : ""
                } ${index % 2 !== 0 ? "sm:border-l" : "sm:border-l-0"} ${
                  index > 1 ? "sm:border-t" : "sm:border-t-0"
                }`}
              >
                <span className="font-mono text-[0.62rem] text-[#BA4811]">0{index + 1}</span>
                <span className="text-[12px] font-semibold leading-5 text-[#4f544f]">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative bg-white py-14 sm:py-16">
        <SectionTab label={t("howWeOperate")} />
        <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
          <motion.div
            initial="hidden"
            whileInView="visible"
            variants={reveal}
            viewport={{ once: true }}
          >
            <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[#BA4811]">
              {t("ourPhilosophy")}
            </p>
            <h2 className="mt-4 text-[1.8rem] font-bold leading-tight tracking-[-0.035em] sm:text-[2.1rem]">
              {t("howWeOperate")}
            </h2>
            <div className="mt-8 border-l-2 border-[#BA4811] pl-5">
              <p className="text-xl font-bold tracking-tight text-[#BA4811]">{t("philosophyText")}</p>
              <p className="mt-3 text-sm leading-7 text-[#686c67]">
                {t("philosophyDetails.lifelongLearning.description")}
              </p>
            </div>
          </motion.div>

          <div className="border-t border-[#dedad5]">
            {operatingItems.map((item, index) => {
              return (
                <motion.article
                  key={item.title}
                  initial="hidden"
                  whileInView="visible"
                  variants={reveal}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.06 }}
                  className="grid grid-cols-[2.5rem_1fr] gap-3 border-b border-[#dedad5] py-6 sm:gap-5"
                >
                  <span className="pt-0.5 font-mono text-[0.62rem] text-[#BA4811]">
                    0{index + 1}
                  </span>
                  <div>
                    <h3 className="text-base font-bold tracking-tight">{item.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-[#686c67]">{item.description}</p>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-white px-5 pb-16 sm:px-8">
        <div className="relative mx-auto grid max-w-7xl gap-8 overflow-hidden bg-[#BA4811] px-7 py-10 text-white [clip-path:polygon(0_0,100%_0,100%_78%,96%_100%,0_100%)] sm:px-10 lg:grid-cols-[1fr_auto] lg:items-center lg:px-12">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{t("readyToStart")}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/75">{t("joinEcosystem")}</p>
          </div>
          <a
            href="https://www.facebook.com/sit.ttu.edu.vn"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-12 w-fit items-center gap-4 border border-white bg-white px-6 text-sm font-semibold text-[#BA4811] transition-colors hover:bg-transparent hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            {t("contactUs")}
            <span><ArrowIcon direction="up-right" size={16} /></span>
          </a>
        </div>
      </section>
    </main>
  );
};

export default AboutPageContent;
