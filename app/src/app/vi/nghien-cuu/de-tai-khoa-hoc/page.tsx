"use client";

import { Search01FreeIcons } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";

import { api, type Research } from "@/lib/api";

type ProjectItem = {
  id: string;
  title: string;
  leaders: string;
  focus: string;
  summary: string;
  timeline: string;
  status: string;
  tags: string[];
  completed: boolean;
  ongoing: boolean;
};

type StatusFilter = "all" | "ongoing" | "completed";

const normalizeSearch = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

export default function ScientificProjectsPage() {
  const t = useTranslations("researchProjects");
  const reduceMotion = useReducedMotion();
  const [researchProjects, setResearchProjects] = useState<Research[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  useEffect(() => {
    let active = true;

    api.research
      .findAll("PROJECT")
      .then((data) => {
        if (active) setResearchProjects(data);
      })
      .catch((error) => {
        console.error("Failed to fetch research projects:", error);
        if (active) setLoadError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const projects = useMemo<ProjectItem[]>(() => {
    return [...researchProjects]
      .sort((a, b) => {
        const yearDifference =
          (b.endYear ?? b.startYear ?? 0) - (a.endYear ?? a.startYear ?? 0);

        if (yearDifference !== 0) return yearDifference;
        if (a.status !== b.status) return a.status === "ONGOING" ? -1 : 1;

        return (b.startYear ?? 0) - (a.startYear ?? 0);
      })
      .map((project) => ({
        id: project.id,
        title: project.title,
        leaders: project.principalInvestigator || "Chưa cập nhật",
        focus: project.researchField || "Nghiên cứu liên ngành",
        summary: project.abstract || "",
        timeline:
          project.startYear && project.endYear
            ? `${project.startYear} — ${project.endYear}`
            : project.startYear?.toString() || "Đang cập nhật",
        status:
          project.status === "COMPLETED"
            ? t("labels.statusCompleted")
            : project.status === "ONGOING"
              ? t("labels.statusOngoing")
              : "Chưa cập nhật",
        completed: project.status === "COMPLETED",
        ongoing: project.status === "ONGOING",
        tags: project.keywords
          ? project.keywords
              .split(",")
              .map((keyword) => keyword.trim())
              .filter(Boolean)
          : [],
      }));
  }, [researchProjects, t]);

  const filteredProjects = useMemo(() => {
    const normalizedQuery = normalizeSearch(query.trim());

    return projects.filter((project) => {
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "completed" && project.completed) ||
        (statusFilter === "ongoing" && project.ongoing);
      const searchableText = normalizeSearch(
        [
          project.title,
          project.leaders,
          project.focus,
          project.summary,
          project.tags.join(" "),
        ].join(" "),
      );

      return matchesStatus && searchableText.includes(normalizedQuery);
    });
  }, [projects, query, statusFilter]);

  const completedCount = projects.filter((project) => project.completed).length;
  const ongoingCount = projects.filter((project) => project.ongoing).length;

  const reveal = {
    hidden: reduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <main className="overflow-hidden bg-white text-[#171b25]">
      <section className="border-b border-[#d8d3ce] bg-white">
        <div className="mx-auto max-w-7xl px-5 pb-14 pt-10 sm:px-8 lg:pb-20 lg:pt-16">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={reveal}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center gap-4 font-mono text-[0.64rem] font-semibold uppercase tracking-[0.2em] text-[#ba4811]">
              <span className="h-px w-12 bg-current" />
              {t("badge")}
            </div>

            <div className="mt-8 grid gap-9 lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)] lg:items-end lg:gap-20">
              <h1 className="max-w-[11ch] text-[clamp(3.25rem,8vw,6.8rem)] font-bold leading-[0.92] tracking-[-0.065em] text-balance">
                {t("title")}
              </h1>
              <div className="border-t-2 border-[#171b25] pt-5">
                <p className="max-w-xl text-base leading-8 text-[#656963] sm:text-lg">
                  {t("subtitle")}
                </p>
                <p className="mt-6 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-[#8a8e88]">
                  Danh mục nghiên cứu · SIT
                </p>
              </div>
            </div>
          </motion.div>

          <div className="mt-14 grid border-y border-[#d8d3ce] sm:grid-cols-3">
            {[
              [projects.length, "Tổng đề tài"],
              [ongoingCount, t("labels.ongoing")],
              [completedCount, t("labels.completed")],
            ].map(([value, label], index) => (
              <div
                key={String(label)}
                className="grid grid-cols-[2.25rem_1fr] items-end gap-3 border-b border-[#d8d3ce] py-5 last:border-b-0 sm:border-b-0 sm:border-r sm:px-6 sm:first:pl-0 sm:last:border-r-0"
              >
                <span className="font-mono text-[0.6rem] text-[#ba4811]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <p className="text-3xl font-bold tracking-[-0.05em]">{value}</p>
                  <p className="mt-1 text-sm text-[#6d716c]">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-14 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-8 border-b-2 border-[#171b25] pb-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
            <div>
              <p className="font-mono text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-[#ba4811]">
                Chỉ mục đề tài
              </p>
              <h2 className="mt-4 text-[2.35rem] font-bold leading-none tracking-[-0.05em] sm:text-[3.15rem]">
                Tìm theo hướng nghiên cứu
              </h2>
            </div>

            <div className="space-y-4 lg:justify-self-end">
              <label className="flex min-h-14 items-center border border-[#cfc9c3] bg-white transition-colors focus-within:border-[#ba4811]">
                <span className="grid h-14 w-14 shrink-0 place-items-center border-r border-[#cfc9c3] text-[#ba4811]">
                  <HugeiconsIcon icon={Search01FreeIcons} size={21} strokeWidth={1.7} />
                </span>
                <span className="sr-only">Tìm đề tài khoa học</span>
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Tên đề tài, chủ nhiệm hoặc lĩnh vực"
                  className="h-14 w-full min-w-0 bg-transparent px-4 text-sm text-[#171b25] outline-none placeholder:text-[#979a95] sm:w-[30rem]"
                />
              </label>
              <div className="flex flex-wrap gap-x-5 gap-y-2">
                {([
                  ["all", "Tất cả"],
                  ["ongoing", t("labels.ongoing")],
                  ["completed", t("labels.completed")],
                ] as const).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setStatusFilter(value)}
                    className={`cursor-pointer border-b py-1 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ba4811] ${
                      statusFilter === value
                        ? "border-[#ba4811] text-[#ba4811]"
                        : "border-transparent text-[#696d68] hover:text-[#ba4811]"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="divide-y divide-[#d8d3ce]" aria-label="Đang tải đề tài">
              {[0, 1, 2].map((item) => (
                <div key={item} className="grid animate-pulse gap-6 py-9 lg:grid-cols-[4rem_1.25fr_0.75fr]">
                  <div className="h-4 w-8 bg-[#ece7e2]" />
                  <div className="space-y-4">
                    <div className="h-7 max-w-xl bg-[#ece7e2]" />
                    <div className="h-4 max-w-2xl bg-[#f2eeea]" />
                  </div>
                  <div className="h-14 bg-[#f2eeea]" />
                </div>
              ))}
            </div>
          ) : loadError ? (
            <div className="border-b border-[#d8d3ce] py-20 text-center">
              <p className="text-xl font-bold">Không thể tải dữ liệu đề tài</p>
              <p className="mt-3 text-sm text-[#696d68]">Vui lòng thử tải lại trang sau ít phút.</p>
            </div>
          ) : filteredProjects.length > 0 ? (
            <div className="divide-y divide-[#d8d3ce]">
              {filteredProjects.map((project, index) => (
                <article
                  key={project.id}
                  className="group grid gap-6 py-9 transition-colors hover:bg-[#faf8f6] sm:px-4 lg:grid-cols-[4rem_minmax(0,1.25fr)_minmax(15rem,0.75fr)] lg:gap-10"
                >
                  <span className="font-mono text-[0.68rem] text-[#ba4811]">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className={`border px-2.5 py-1 font-mono text-[0.56rem] font-semibold uppercase tracking-[0.12em] ${
                          project.completed
                            ? "border-[#a8aca7] text-[#646863]"
                            : "border-[#e4a17f] text-[#ba4811]"
                        }`}
                      >
                        {project.status}
                      </span>
                      <span className="font-mono text-[0.58rem] uppercase tracking-[0.12em] text-[#858984]">
                        {project.timeline}
                      </span>
                    </div>
                    <h3 className="mt-5 max-w-3xl text-[1.65rem] font-bold leading-[1.15] tracking-[-0.035em] text-balance sm:text-[2rem]">
                      {project.title}
                    </h3>
                    {project.summary && (
                      <p className="mt-4 max-w-3xl text-sm leading-7 text-[#676b66] sm:text-base sm:leading-8">
                        {project.summary}
                      </p>
                    )}
                    {project.tags.length > 0 && (
                      <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 font-mono text-[0.58rem] uppercase tracking-[0.1em] text-[#858984]">
                        {project.tags.map((tag) => (
                          <span key={tag}>{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  <dl className="grid content-start gap-5 border-t border-[#d8d3ce] pt-5 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
                    <div>
                      <dt className="font-mono text-[0.56rem] uppercase tracking-[0.14em] text-[#969994]">
                        Chủ nhiệm
                      </dt>
                      <dd className="mt-2 text-sm font-semibold leading-6">{project.leaders}</dd>
                    </div>
                    <div>
                      <dt className="font-mono text-[0.56rem] uppercase tracking-[0.14em] text-[#969994]">
                        Lĩnh vực
                      </dt>
                      <dd className="mt-2 text-sm leading-6 text-[#656963]">{project.focus}</dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>
          ) : (
            <div className="border-b border-[#d8d3ce] py-20 text-center">
              <p className="text-xl font-bold">
                {projects.length === 0 ? "Chưa có đề tài được công bố" : "Không tìm thấy đề tài phù hợp"}
              </p>
              {projects.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setStatusFilter("all");
                  }}
                  className="mt-5 cursor-pointer border-b border-[#ba4811] pb-1 text-sm font-semibold text-[#ba4811]"
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
