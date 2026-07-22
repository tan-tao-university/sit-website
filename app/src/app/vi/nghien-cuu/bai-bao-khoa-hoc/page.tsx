"use client";

import { Search01FreeIcons } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";

import { ArrowIcon } from "@/components/icons/ArrowIcon";
import { api, type Research } from "@/lib/api";

type PublicationItem = {
  id: string;
  title: string;
  authors: string;
  journal: string;
  publisher?: string;
  year?: number;
  doi?: string;
  pdfUrl?: string;
  keywords: string[];
};

const normalizeSearch = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const getPublicationHref = (publication: PublicationItem) => {
  if (publication.doi) {
    return publication.doi.startsWith("http")
      ? publication.doi
      : `https://doi.org/${publication.doi}`;
  }

  return publication.pdfUrl;
};

export default function ScientificPublicationsPage() {
  const t = useTranslations("researchPublications");
  const reduceMotion = useReducedMotion();
  const [researchPublications, setResearchPublications] = useState<Research[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState("all");

  useEffect(() => {
    let active = true;

    api.research
      .findAll("PUBLICATION")
      .then((data) => {
        if (active) setResearchPublications(data);
      })
      .catch((error) => {
        console.error("Failed to fetch research publications:", error);
        if (active) setLoadError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const publications = useMemo<PublicationItem[]>(() => {
    return researchPublications
      .map((publication) => ({
        id: publication.id,
        title: publication.title,
        authors: publication.authors || "Chưa cập nhật tác giả",
        journal:
          publication.journalName ||
          publication.publisher ||
          "Chưa cập nhật nơi công bố",
        publisher: publication.publisher,
        year: publication.publicationYear,
        doi: publication.doi,
        pdfUrl: publication.pdfUrl,
        keywords: publication.keywords
          ? publication.keywords
              .split(",")
              .map((keyword) => keyword.trim())
              .filter(Boolean)
          : [],
      }))
      .sort((a, b) => (b.year || 0) - (a.year || 0));
  }, [researchPublications]);

  const years = useMemo(
    () =>
      Array.from(
        new Set(
          publications
            .map((publication) => publication.year)
            .filter((year): year is number => Boolean(year)),
        ),
      ).sort((a, b) => b - a),
    [publications],
  );

  const filteredPublications = useMemo(() => {
    const normalizedQuery = normalizeSearch(query.trim());

    return publications.filter((publication) => {
      const matchesYear =
        selectedYear === "all" || publication.year?.toString() === selectedYear;
      const searchableText = normalizeSearch(
        [
          publication.title,
          publication.authors,
          publication.journal,
          publication.publisher,
          publication.doi,
          publication.keywords.join(" "),
        ]
          .filter(Boolean)
          .join(" "),
      );

      return matchesYear && searchableText.includes(normalizedQuery);
    });
  }, [publications, query, selectedYear]);

  const groupedPublications = useMemo(() => {
    const groups = new Map<string, PublicationItem[]>();

    filteredPublications.forEach((publication) => {
      const year = publication.year?.toString() || "Khác";
      groups.set(year, [...(groups.get(year) || []), publication]);
    });

    return Array.from(groups.entries());
  }, [filteredPublications]);

  const journalCount = new Set(publications.map((publication) => publication.journal)).size;
  const latestYear = years[0];

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
              <h1 className="max-w-[10ch] text-[clamp(3.25rem,8vw,6.8rem)] font-bold leading-[0.92] tracking-[-0.065em] text-balance">
                {t("title")}
              </h1>
              <div className="border-t-2 border-[#171b25] pt-5">
                <p className="max-w-xl text-base leading-8 text-[#656963] sm:text-lg">
                  {t("subtitle")}
                </p>
                <p className="mt-6 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-[#8a8e88]">
                  Thư mục công bố · SIT
                </p>
              </div>
            </div>
          </motion.div>

          <div className="mt-14 grid border-y border-[#d8d3ce] sm:grid-cols-3">
            {[
              [publications.length, t("labels.totalPublications")],
              [latestYear || "—", "Năm công bố mới nhất"],
              [journalCount, t("labels.journals")],
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
                Kho học thuật
              </p>
              <h2 className="mt-4 text-[2.35rem] font-bold leading-none tracking-[-0.05em] sm:text-[3.15rem]">
                Tra cứu công bố
              </h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_9rem] lg:justify-self-end">
              <label className="flex min-h-14 items-center border border-[#cfc9c3] bg-white transition-colors focus-within:border-[#ba4811]">
                <span className="grid h-14 w-14 shrink-0 place-items-center border-r border-[#cfc9c3] text-[#ba4811]">
                  <HugeiconsIcon icon={Search01FreeIcons} size={21} strokeWidth={1.7} />
                </span>
                <span className="sr-only">Tìm bài báo khoa học</span>
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Tên bài báo, tác giả hoặc tạp chí"
                  className="h-14 w-full min-w-0 bg-transparent px-4 text-sm text-[#171b25] outline-none placeholder:text-[#979a95] sm:w-[25rem]"
                />
              </label>

              <label className="relative flex min-h-14 items-center border border-[#cfc9c3] bg-white focus-within:border-[#ba4811]">
                <span className="sr-only">Lọc theo năm</span>
                <select
                  value={selectedYear}
                  onChange={(event) => setSelectedYear(event.target.value)}
                  className="h-14 w-full cursor-pointer appearance-none bg-transparent px-4 font-mono text-[0.66rem] font-semibold uppercase tracking-[0.12em] text-[#555a55] outline-none"
                >
                  <option value="all">Tất cả năm</option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                <ArrowIcon direction="down" size={15} className="pointer-events-none absolute right-4" />
              </label>
            </div>
          </div>

          {loading ? (
            <div className="divide-y divide-[#d8d3ce]" aria-label="Đang tải bài báo">
              {[0, 1, 2].map((item) => (
                <div key={item} className="grid animate-pulse gap-7 py-9 lg:grid-cols-[8rem_1fr]">
                  <div className="h-12 w-24 bg-[#ece7e2]" />
                  <div className="space-y-4">
                    <div className="h-7 max-w-3xl bg-[#ece7e2]" />
                    <div className="h-4 max-w-xl bg-[#f2eeea]" />
                  </div>
                </div>
              ))}
            </div>
          ) : loadError ? (
            <div className="border-b border-[#d8d3ce] py-20 text-center">
              <p className="text-xl font-bold">Không thể tải dữ liệu bài báo</p>
              <p className="mt-3 text-sm text-[#696d68]">Vui lòng thử tải lại trang sau ít phút.</p>
            </div>
          ) : groupedPublications.length > 0 ? (
            <div>
              {groupedPublications.map(([year, items]) => (
                <section
                  key={year}
                  className="grid border-b border-[#d8d3ce] lg:grid-cols-[9rem_minmax(0,1fr)]"
                >
                  <div className="py-9 lg:border-r lg:border-[#d8d3ce] lg:pr-8">
                    <p className="font-mono text-[0.58rem] uppercase tracking-[0.16em] text-[#8d918c]">
                      Năm công bố
                    </p>
                    <p className="mt-2 text-[2.75rem] font-bold leading-none tracking-[-0.06em] text-[#ba4811]">
                      {year}
                    </p>
                  </div>

                  <div className="divide-y divide-[#d8d3ce] lg:pl-10">
                    {items.map((publication, index) => {
                      const href = getPublicationHref(publication);

                      return (
                        <article
                          key={publication.id}
                          className="group grid gap-5 py-9 transition-colors hover:bg-[#faf8f6] sm:px-4 lg:grid-cols-[2.5rem_minmax(0,1fr)_auto] lg:gap-7"
                        >
                          <span className="font-mono text-[0.62rem] text-[#ba4811]">
                            {String(index + 1).padStart(2, "0")}
                          </span>

                          <div>
                            <h3 className="max-w-4xl text-[1.55rem] font-bold leading-[1.18] tracking-[-0.03em] text-balance sm:text-[1.9rem]">
                              {publication.title}
                            </h3>
                            <p className="mt-4 text-sm font-semibold leading-6 text-[#343933]">
                              {publication.authors}
                            </p>
                            <p className="mt-2 text-sm leading-6 text-[#70746f]">
                              {publication.journal}
                            </p>
                            {publication.keywords.length > 0 && (
                              <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 font-mono text-[0.56rem] uppercase tracking-[0.1em] text-[#8b8f89]">
                                {publication.keywords.map((keyword) => (
                                  <span key={keyword}>{keyword}</span>
                                ))}
                              </div>
                            )}
                          </div>

                          {href && (
                            <a
                              href={href}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex min-h-11 items-center self-start border-b border-[#ba4811] text-sm font-semibold text-[#ba4811] transition-colors hover:text-[#96380d] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ba4811]"
                            >
                              {publication.doi ? "Mở DOI" : "Đọc toàn văn"}
                              <ArrowIcon direction="up-right" size={16} className="ml-3" />
                            </a>
                          )}
                        </article>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <div className="border-b border-[#d8d3ce] py-20 text-center">
              <p className="text-xl font-bold">
                {publications.length === 0 ? "Chưa có bài báo được công bố" : "Không tìm thấy bài báo phù hợp"}
              </p>
              {publications.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setSelectedYear("all");
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
