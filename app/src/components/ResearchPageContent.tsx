"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import SectionTab from "@/components/SectionTab";
import { api, type Research } from "@/lib/api";
import type { SiteLocale } from "@/lib/program-pages";

type ResearchHighlight = {
  value: string;
  label: string;
  description: string;
};

type ResearchArea = {
  title: string;
  description: string;
  projects: string[];
};

export default function ResearchPageContent({ locale }: { locale: SiteLocale }) {
  const t = useTranslations("research");
  const tProjects = useTranslations("researchProjects");
  const tPublications = useTranslations("researchPublications");
  const reduceMotion = useReducedMotion();
  const [projects, setProjects] = useState<Research[]>([]);
  const [publications, setPublications] = useState<Research[]>([]);
  const [researchLoading, setResearchLoading] = useState(true);
  const [projectLoadFailed, setProjectLoadFailed] = useState(false);
  const [publicationLoadFailed, setPublicationLoadFailed] = useState(false);

  useEffect(() => {
    let active = true;

    Promise.allSettled([
      api.research.findAll("PROJECT"),
      api.research.findAll("PUBLICATION"),
    ]).then(([projectResult, publicationResult]) => {
      if (!active) return;
      if (projectResult.status === "fulfilled") setProjects(projectResult.value);
      else setProjectLoadFailed(true);
      if (publicationResult.status === "fulfilled") setPublications(publicationResult.value);
      else setPublicationLoadFailed(true);
      setResearchLoading(false);
    });

    return () => {
      active = false;
    };
  }, []);

  const highlights = t.raw("highlights") as ResearchHighlight[];
  const areas = t.raw("areas") as ResearchArea[];
  const collaborations = t.raw("collaborationList") as string[];
  const projectPath =
    locale === "vi"
      ? "/vi/nghien-cuu/de-tai-khoa-hoc"
      : "/en/research/scientific-projects";
  const publicationPath =
    locale === "vi"
      ? "/vi/nghien-cuu/bai-bao-khoa-hoc"
      : "/en/research/scientific-publications";
  const facultyPath = locale === "vi" ? "/vi/giang-vien" : "/en/faculty";
  const copy =
    locale === "vi"
      ? {
          index: "Chỉ mục nghiên cứu",
          portfolio: "Hệ sinh thái nghiên cứu",
          priorities: "04 hướng nghiên cứu trọng điểm",
          projects: "Đề tài đang được triển khai",
          projectsDescription:
            "Từ bài toán thực tiễn đến nguyên mẫu, mỗi đề tài kết nối giảng viên, sinh viên và đối tác.",
          publications: "Công bố & tri thức",
          publicationsDescription:
            "Theo dõi các bài báo, kỷ yếu và kết quả học thuật mới nhất của SIT.",
          viewProjects: "Xem toàn bộ đề tài",
          viewPublications: "Mở kho công bố",
          field: "Lĩnh vực",
          lead: "Chủ nhiệm",
          partners: "Mạng lưới đồng hành",
          researchers: "Đội ngũ nghiên cứu",
          loading: "Đang tải dữ liệu từ kho nghiên cứu…",
          noProjects: "Chưa có đề tài được công bố.",
          noPublications: "Chưa có bài báo được công bố.",
          loadFailed: "Không thể tải dữ liệu nghiên cứu lúc này.",
        }
      : {
          index: "Research index",
          portfolio: "Research ecosystem",
          priorities: "04 priority research directions",
          projects: "Research in progress",
          projectsDescription:
            "Each initiative connects real-world questions with faculty, students and external partners.",
          publications: "Publications & knowledge",
          publicationsDescription:
            "Follow SIT journal articles, proceedings and recent academic outputs.",
          viewProjects: "View all projects",
          viewPublications: "Open publication archive",
          field: "Field",
          lead: "Lead",
          partners: "Partner network",
          researchers: "Research team",
          loading: "Loading data from the research archive…",
          noProjects: "No research projects have been published yet.",
          noPublications: "No scientific publications have been published yet.",
          loadFailed: "Research data is currently unavailable.",
        };

  const projectItems = useMemo(
    () =>
      [...projects]
        .filter((project) => project.status === "ONGOING")
        .sort((a, b) => {
          const yearDifference =
            (b.endYear ?? b.startYear ?? 0) - (a.endYear ?? a.startYear ?? 0);

          if (yearDifference !== 0) return yearDifference;
          if (a.status !== b.status) return a.status === "ONGOING" ? -1 : 1;

          return (b.startYear ?? 0) - (a.startYear ?? 0);
        })
        .map((project) => ({
          title: project.title,
          leaders: project.principalInvestigator || "—",
          focus: project.researchField || "—",
          summary: project.abstract || "",
          timeline:
            project.startYear && project.endYear
              ? `${project.startYear} — ${project.endYear}`
              : project.startYear?.toString() || "—",
          status:
            project.status === "COMPLETED"
              ? tPublications("labels.statusCompleted")
              : tPublications("labels.statusOngoing"),
        })),
    [projects, tPublications],
  );

  const publicationItems = useMemo(
    () =>
      [...publications]
        .sort(
          (a, b) => (b.publicationYear ?? 0) - (a.publicationYear ?? 0),
        )
        .map((publication) => ({
          title: publication.title,
          authors: publication.authors || "—",
          where:
            [publication.journalName, publication.publicationYear]
              .filter(Boolean)
              .join(", ") || "—",
          href: publication.doi
            ? publication.doi.startsWith("http")
              ? publication.doi
              : `https://doi.org/${publication.doi}`
            : publication.pdfUrl,
        })),
    [publications],
  );

  const highlightItems = useMemo(
    () =>
      highlights.map((highlight, index) => {
        if (index === 1) {
          return {
            ...highlight,
            value:
              researchLoading || projectLoadFailed
                ? "—"
                : projects.length.toString(),
            label: locale === "vi" ? "Đề tài khoa học" : "Scientific projects",
          };
        }

        if (index === 2) {
          return {
            ...highlight,
            value:
              researchLoading || publicationLoadFailed
                ? "—"
                : publications.length.toString(),
            label:
              locale === "vi"
                ? "Bài báo khoa học"
                : "Scientific publications",
          };
        }

        return highlight;
      }),
    [
      highlights,
      locale,
      projectLoadFailed,
      projects,
      publicationLoadFailed,
      publications.length,
      researchLoading,
    ],
  );

  const reveal = {
    hidden: reduceMotion ? { opacity: 1 } : { opacity: 0, y: 22 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <main className="overflow-hidden bg-white text-[#171b25]">
      <section className="border-b border-[#171b25]/15 bg-white">
        <div className="mx-auto max-w-7xl px-5 pb-14 pt-10 sm:px-8 lg:pb-20 lg:pt-14">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={reveal}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end lg:gap-20"
          >
            <div>
              <div className="flex items-center gap-4 font-mono text-[0.64rem] font-semibold uppercase tracking-[0.2em] text-[#BA4811]">
                <span className="h-px w-12 bg-current" />
                {t("heroBadge")}
              </div>
              <h1 className="mt-7 max-w-[13ch] text-[2.9rem] font-bold leading-[1.02] tracking-[-0.05em] text-balance sm:text-[3.75rem] lg:text-[4.5rem]">
                {t("title")}
              </h1>
              <p className="mt-7 max-w-3xl text-base leading-8 text-[#626661] sm:text-lg">
                {t("description")}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href={projectPath}
                  className="inline-flex min-h-12 items-center gap-4 bg-[#BA4811] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#96380d] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#BA4811]"
                >
                  {t("heroCtaPrimary")}
                  <HugeiconsIcon icon={ArrowUpRight01Icon} size={17} />
                </Link>
                <Link
                  href={facultyPath}
                  className="inline-flex min-h-12 items-center border border-[#171b25]/20 px-6 text-sm font-semibold transition-colors hover:border-[#BA4811] hover:text-[#BA4811] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#BA4811]"
                >
                  {t("heroCtaSecondary")}
                </Link>
              </div>
            </div>

            <aside className="border-t-2 border-[#171b25] pt-5">
              <p className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[#BA4811]">
                {copy.index}
              </p>
              <div className="mt-5">
                {areas.map((area, index) => (
                  <div
                    key={area.title}
                    className="grid grid-cols-[2rem_1fr] gap-3 border-t border-[#d8d3ce] py-3.5 first:border-t-0"
                  >
                    <span className="font-mono text-[0.58rem] text-[#BA4811]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="text-sm font-semibold leading-5">{area.title}</span>
                  </div>
                ))}
              </div>
            </aside>
          </motion.div>

          <div className="mt-14 grid border-y border-[#d8d3ce] sm:grid-cols-2 lg:grid-cols-4">
            {highlightItems.map((highlight) => (
              <div
                key={highlight.label}
                className="border-b border-[#d8d3ce] py-6 sm:px-6 sm:[&:nth-last-child(-n+2)]:border-b-0 lg:border-b-0 lg:border-r lg:first:pl-0 lg:last:border-r-0 lg:last:pr-0"
              >
                <p className="text-3xl font-bold tracking-[-0.05em]">{highlight.value}</p>
                <p className="mt-1 text-sm font-semibold">{highlight.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative bg-[#f7f4f1] py-16 sm:py-20 lg:py-24">
        <SectionTab label={copy.portfolio} />
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-6 border-b-2 border-[#171b25] pb-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <p className="font-mono text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-[#BA4811]">
                {t("researchAreas")}
              </p>
              <h2 className="mt-4 max-w-xl text-[2.25rem] font-bold leading-tight tracking-[-0.045em] sm:text-[3rem]">
                {copy.priorities}
              </h2>
            </div>
            <p className="max-w-xl text-base leading-8 text-[#686c67] lg:justify-self-end">
              {t("impactDescription")}
            </p>
          </div>

          <div className="grid lg:grid-cols-2">
            {areas.map((area, index) => (
              <motion.article
                key={area.title}
                initial="hidden"
                whileInView="visible"
                variants={reveal}
                viewport={{ once: true, margin: "-50px" }}
                className={`border-b border-[#d2ccc6] py-9 lg:min-h-80 lg:p-10 ${index % 2 === 0 ? "lg:border-r" : ""}`}
              >
                <div className="flex items-start justify-between gap-6">
                  <span className="text-[3.4rem] font-bold leading-none tracking-[-0.07em] text-[#d4cec7]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="mt-2 h-px w-12 bg-[#BA4811]" />
                </div>
                <h3 className="mt-8 max-w-lg text-2xl font-bold leading-tight tracking-[-0.035em]">
                  {area.title}
                </h3>
                <p className="mt-4 max-w-xl text-sm leading-7 text-[#686c67]">{area.description}</p>
                <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 font-mono text-[0.6rem] uppercase tracking-[0.1em] text-[#777b76]">
                  {area.projects.map((project) => (
                    <span key={project}>{project}</span>
                  ))}
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative bg-white py-16 sm:py-20 lg:py-24">
        <SectionTab label={tProjects("badge")} />
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
            <div>
              <p className="font-mono text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-[#BA4811]">
                {tProjects("spotlight.title")}
              </p>
              <h2 className="mt-5 max-w-md text-[2.25rem] font-bold leading-[1.05] tracking-[-0.045em] sm:text-[3rem]">
                {copy.projects}
              </h2>
              <p className="mt-6 max-w-md text-sm leading-7 text-[#686c67]">{copy.projectsDescription}</p>
              <Link
                href={projectPath}
                className="mt-8 inline-flex min-h-11 items-center gap-3 border-b border-[#BA4811] text-sm font-semibold text-[#BA4811] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#BA4811]"
              >
                {copy.viewProjects}
                <HugeiconsIcon icon={ArrowUpRight01Icon} size={17} />
              </Link>
            </div>

            <div className="border-t-2 border-[#171b25]">
              {researchLoading ? (
                <p className="border-b border-[#d8d3ce] py-10 text-sm text-[#686c67]">{copy.loading}</p>
              ) : projectLoadFailed ? (
                <p className="border-b border-[#d8d3ce] py-10 text-sm text-[#686c67]">{copy.loadFailed}</p>
              ) : projectItems.length === 0 ? (
                <p className="border-b border-[#d8d3ce] py-10 text-sm text-[#686c67]">{copy.noProjects}</p>
              ) : (
                projectItems.slice(0, 4).map((project, index) => (
                  <article key={`${project.title}-${index}`} className="grid gap-4 border-b border-[#d8d3ce] py-7 sm:grid-cols-[3rem_1fr_7rem]">
                    <span className="font-mono text-[0.64rem] font-semibold text-[#BA4811]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3 className="text-lg font-bold leading-snug tracking-[-0.025em] sm:text-xl">{project.title}</h3>
                      {project.summary && <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#686c67]">{project.summary}</p>}
                      <p className="mt-4 font-mono text-[0.58rem] uppercase tracking-[0.1em] text-[#858984]">
                        {copy.lead}: {project.leaders} · {copy.field}: {project.focus}
                      </p>
                    </div>
                    <div className="font-mono text-[0.58rem] uppercase tracking-[0.1em] text-[#777b76] sm:text-right">
                      <p>{project.timeline}</p>
                      <p className="mt-2 text-[#BA4811]">{project.status}</p>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="relative border-y border-[#171b25]/15 bg-white py-16 sm:py-20 lg:py-24">
        <SectionTab label={tPublications("badge")} />
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-col gap-6 border-b-2 border-[#171b25] pb-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="font-mono text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-[#BA4811]">{t("publications")}</p>
              <h2 className="mt-4 text-[2.25rem] font-bold leading-tight tracking-[-0.045em] sm:text-[3rem]">{copy.publications}</h2>
            </div>
            <p className="max-w-xl text-base leading-8 text-[#686c67]">{copy.publicationsDescription}</p>
          </div>

          <div>
            {researchLoading ? (
              <p className="border-b border-[#d8d3ce] py-10 text-sm text-[#686c67]">{copy.loading}</p>
            ) : publicationLoadFailed ? (
              <p className="border-b border-[#d8d3ce] py-10 text-sm text-[#686c67]">{copy.loadFailed}</p>
            ) : publicationItems.length === 0 ? (
              <p className="border-b border-[#d8d3ce] py-10 text-sm text-[#686c67]">{copy.noPublications}</p>
            ) : publicationItems.slice(0, 4).map((publication, index) => {
              const content = (
                <>
                  <span className="font-mono text-[0.64rem] font-semibold text-[#BA4811]">{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className="text-lg font-bold leading-snug tracking-[-0.025em] transition-colors group-hover:text-[#BA4811] sm:text-xl">{publication.title}</h3>
                    <p className="mt-3 text-sm text-[#686c67]">{publication.authors}</p>
                  </div>
                  <span className="font-mono text-[0.6rem] uppercase tracking-[0.1em] text-[#777b76] lg:text-right">{publication.where}</span>
                  <HugeiconsIcon icon={ArrowUpRight01Icon} size={17} className="justify-self-end text-[#BA4811]" />
                </>
              );

              return publication.href ? (
                <a key={`${publication.title}-${index}`} href={publication.href} target="_blank" rel="noreferrer" className="group grid gap-4 border-b border-[#d8d3ce] py-7 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#BA4811] sm:grid-cols-[3rem_1fr] lg:grid-cols-[3rem_1fr_16rem_2rem] lg:items-center">
                  {content}
                </a>
              ) : (
                <article key={`${publication.title}-${index}`} className="group grid gap-4 border-b border-[#d8d3ce] py-7 sm:grid-cols-[3rem_1fr] lg:grid-cols-[3rem_1fr_16rem_2rem] lg:items-center">
                  {content}
                </article>
              );
            })}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-6">
            <Link href={publicationPath} className="inline-flex min-h-11 items-center gap-3 border-b border-[#BA4811] text-sm font-semibold text-[#BA4811] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#BA4811]">
              {copy.viewPublications}
              <HugeiconsIcon icon={ArrowUpRight01Icon} size={17} />
            </Link>
            <div className="flex flex-wrap items-center gap-x-7 gap-y-3 font-mono text-[0.58rem] uppercase tracking-[0.12em] text-[#777b76]">
              <span className="text-[#BA4811]">{copy.partners}</span>
              {collaborations.slice(0, 4).map((partner) => <span key={partner}>{partner}</span>)}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-8 bg-[#BA4811] p-9 sm:p-12 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-white/70">{copy.researchers}</p>
            <h2 className="mt-4 max-w-2xl text-2xl font-bold tracking-[-0.035em] text-white sm:text-3xl">{t("ctaTitle")}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/80">{t("ctaDescription")}</p>
          </div>
          <a href="mailto:sit@ttu.edu.vn" className="inline-flex min-h-12 shrink-0 items-center gap-4 bg-white px-6 text-sm font-semibold text-[#BA4811] transition-colors hover:bg-[#fff7f2] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
            {t("ctaPrimary")}
            <HugeiconsIcon icon={ArrowUpRight01Icon} size={17} />
          </a>
        </div>
      </section>
    </main>
  );
}
