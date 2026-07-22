"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight01Icon,
  Calendar03Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import SectionTab from "@/components/SectionTab";
import { NewsVisual } from "@/components/NewsVisual";
import {
  api,
  type Achievement,
  type Event,
  type News,
  type Research,
} from "@/lib/api";
import { getCategoryDisplay } from "@/lib/news-categories";

import { ArrowIcon } from "@/components/icons/ArrowIcon";

type NewsItem = {
  title: string;
  date: string;
  category: string;
  summary: string;
  image?: string;
  slug?: string;
};

type EventItem = {
  id: string;
  title: string;
  date: string;
  description: string;
};

const formatDate = (date: string, locale: string) => {
  const value = new Date(date);
  if (Number.isNaN(value.getTime())) return "";

  return new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(value);
};

const prepareNewsData = (data: News[], locale: "vi" | "en") => {
  const sortedData = [...data].sort(
    (a, b) =>
      new Date(b.publishedAt || 0).getTime() -
      new Date(a.publishedAt || 0).getTime(),
  );
  const published = sortedData.filter((item) => item.status === "published");
  return published.map((item) => ({
    title: item.title,
    date: item.publishedAt ? formatDate(item.publishedAt, locale) : "",
    category: getCategoryDisplay(item.category || "general", locale),
    summary: item.summary || "",
    image: item.coverImage,
    slug: item.slug,
  }));
};

const prepareEventData = (data: Event[], locale: "vi" | "en") =>
  data.map((event) => ({
    id: event.id,
    title: locale === "en" ? event.titleEn || event.titleVi : event.titleVi,
    date: formatDate(event.startAt, locale),
    description:
      locale === "en"
        ? event.descriptionEn || event.descriptionVi || ""
        : event.descriptionVi || "",
  }));

const NewsPageLoading = () => (
  <main className="min-h-screen animate-pulse bg-white">
    <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:py-16">
      <div className="h-3 w-32 bg-[#eee9e4]" />
      <div className="mt-6 h-12 w-full max-w-xl bg-[#eee9e4]" />
      <div className="mt-10 grid overflow-hidden border border-[#dedad5] lg:grid-cols-2">
        <div className="min-h-[22rem] bg-[#e9e4df]" />
        <div className="space-y-5 p-7 sm:p-10">
          <div className="h-3 w-28 bg-[#eee9e4]" />
          <div className="h-20 bg-[#eee9e4]" />
          <div className="h-16 bg-[#eee9e4]" />
        </div>
      </div>
    </section>
  </main>
);

export default function NewsPageContent({
  locale,
  initialItems,
  initialEvents,
  initialResearch,
  initialAchievements,
}: {
  locale: "vi" | "en";
  initialItems?: News[];
  initialEvents?: Event[];
  initialResearch?: Research[];
  initialAchievements?: Achievement[];
}) {
  const t = useTranslations("news");
  const reduceMotion = useReducedMotion();
  const fallbackNews = useMemo(
    () => (t.raw("newsList") as NewsItem[]) ?? [],
    [t],
  );
  const preparedInitial = useMemo(
    () =>
      initialItems === undefined
        ? undefined
        : prepareNewsData(initialItems, locale),
    [initialItems, locale],
  );
  const preparedInitialEvents = useMemo(
    () =>
      initialEvents === undefined
        ? undefined
        : prepareEventData(initialEvents, locale),
    [initialEvents, locale],
  );
  const [news, setNews] = useState<NewsItem[]>(() =>
    preparedInitial
      ? preparedInitial.length > 0
        ? preparedInitial
        : fallbackNews
      : [],
  );
  const [events, setEvents] = useState<EventItem[]>(
    () => preparedInitialEvents ?? [],
  );
  const [researchItems, setResearchItems] = useState<Research[]>(
    () => initialResearch ?? [],
  );
  const [achievementItems, setAchievementItems] = useState<Achievement[]>(
    () => initialAchievements ?? [],
  );
  const [activeCategory, setActiveCategory] = useState("all");
  const [loading, setLoading] = useState(initialItems === undefined);

  useEffect(() => {
    if (preparedInitial) {
      setNews(preparedInitial.length > 0 ? preparedInitial : fallbackNews);
      setLoading(false);
      return;
    }

    let active = true;

    async function fetchNews() {
      try {
        const data = await api.news.findAll();
        if (!active) return;

        const prepared = prepareNewsData(data, locale);

        setNews(prepared.length > 0 ? prepared : fallbackNews);
      } catch (error) {
        console.error("Failed to fetch news", error);
        if (active) setNews(fallbackNews);
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchNews();
    return () => {
      active = false;
    };
  }, [fallbackNews, locale, preparedInitial]);

  useEffect(() => {
    if (preparedInitialEvents) {
      setEvents(preparedInitialEvents);
      return;
    }

    let active = true;

    api.events
      .findUpcoming(12)
      .then((data) => {
        if (active) setEvents(prepareEventData(data, locale));
      })
      .catch((error) => {
        console.error("Failed to fetch upcoming events", error);
        if (active) setEvents([]);
      });

    return () => {
      active = false;
    };
  }, [locale, preparedInitialEvents]);

  useEffect(() => {
    let active = true;

    if (initialResearch === undefined) {
      api.research
        .findAll()
        .then((data) => {
          if (active) setResearchItems(data);
        })
        .catch((error) =>
          console.error("Failed to fetch research highlights", error),
        );
    }

    if (initialAchievements === undefined) {
      api.achievements
        .findAll({ visibility: "PUBLIC" })
        .then((data) => {
          if (active) setAchievementItems(data);
        })
        .catch((error) =>
          console.error("Failed to fetch achievement highlights", error),
        );
    }

    return () => {
      active = false;
    };
  }, [initialAchievements, initialResearch]);

  const featuredStory = news[0];
  const categories = useMemo(
    () => Array.from(new Set(news.map((item) => item.category))),
    [news],
  );
  const visibleNews = useMemo(() => {
    if (activeCategory === "all") return news.slice(1);
    return news.filter((item) => item.category === activeCategory);
  }, [activeCategory, news]);
  const topicGroups = useMemo(
    () =>
      categories.map((category) => {
        const stories = news.filter((item) => item.category === category);

        return {
          category,
          count: stories.length,
          stories: stories.slice(0, 3),
        };
      }),
    [categories, news],
  );
  const featuredResearch = useMemo(
    () =>
      [...researchItems].sort((a, b) => {
        const yearA =
          a.publicationYear ?? a.endYear ?? a.startYear ??
          new Date(a.createdAt).getFullYear();
        const yearB =
          b.publicationYear ?? b.endYear ?? b.startYear ??
          new Date(b.createdAt).getFullYear();
        return yearB - yearA;
      })[0],
    [researchItems],
  );
  const spotlightAchievements = useMemo(
    () =>
      [...achievementItems]
        .sort((a, b) => {
          if (Boolean(b.isHighlight) !== Boolean(a.isHighlight)) {
            return b.isHighlight ? 1 : -1;
          }
          const yearA = a.achievedYear ?? new Date(a.createdAt).getFullYear();
          const yearB = b.achievedYear ?? new Date(b.createdAt).getFullYear();
          return yearB - yearA;
        })
        .slice(0, 2),
    [achievementItems],
  );
  const quickNews = useMemo(() => news.slice(0, 8), [news]);
  const reveal = {
    hidden: reduceMotion ? { opacity: 1 } : { opacity: 0, y: 22 },
    visible: { opacity: 1, y: 0 },
  };
  const newsHref = (item: NewsItem) =>
    item.slug
      ? locale === "vi"
        ? `/${locale}/tin-tuc/${item.slug}`
        : `/${locale}/news/${item.slug}`
      : "#";
  const exploreLinks = [
    {
      title: t("exploreProgramsTitle"),
      description: t("exploreProgramsDescription"),
      href:
        locale === "vi"
          ? "/vi/chuong-trinh-dao-tao"
          : "/en/programs",
    },
    {
      title: t("exploreResearchTitle"),
      description: t("exploreResearchDescription"),
      href: locale === "vi" ? "/vi/nghien-cuu" : "/en/research",
    },
    {
      title: t("exploreStudentsTitle"),
      description: t("exploreStudentsDescription"),
      href: locale === "vi" ? "/vi/sinh-vien" : "/en/students",
    },
    {
      title: t("exploreFacultyTitle"),
      description: t("exploreFacultyDescription"),
      href: locale === "vi" ? "/vi/giang-vien" : "/en/faculty",
    },
  ];
  const researchHref = locale === "vi" ? "/vi/nghien-cuu" : "/en/research";
  const achievementsHref =
    locale === "vi" ? "/vi/sinh-vien" : "/en/students";
  const featuredResearchYear = featuredResearch
    ? featuredResearch.publicationYear ??
      featuredResearch.endYear ??
      featuredResearch.startYear
    : undefined;

  if (loading) return <NewsPageLoading />;

  return (
    <main className="overflow-hidden bg-white text-[#171b25]">
      <section className="relative bg-white py-12 lg:py-16">
        <SectionTab label={t("title")} />
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={reveal}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="grid gap-5 lg:grid-cols-[0.72fr_1.28fr] lg:items-end"
          >
            <div>
              <div className="mb-5 flex items-center gap-4 text-[0.68rem] font-bold uppercase tracking-[0.2em] text-[#BA4811]">
                <span className="h-px w-10 bg-current" />
                {t("newsroom")}
              </div>
              <h1 className="text-[2.35rem] font-bold leading-[1.05] tracking-[-0.045em] sm:text-[2.75rem] lg:text-[3.15rem]">
                {t("title")}
              </h1>
            </div>
            <p className="max-w-xl text-sm leading-7 text-[#60645f] lg:justify-self-end">
              {t("description")}
            </p>
          </motion.div>

          {featuredStory ? (
            <motion.article
              initial="hidden"
              animate="visible"
              variants={reveal}
              transition={{ duration: 0.7, delay: 0.08 }}
              className="group mt-9 grid overflow-hidden border border-[#dedad5] bg-white lg:grid-cols-[1.08fr_0.92fr]"
            >
              <NewsVisual item={featuredStory} index={0} featured />
              <div className="flex flex-col justify-center p-6 sm:p-9 lg:p-11">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[0.68rem] font-semibold uppercase tracking-[0.13em]">
                  <span className="bg-[#BA4811] px-3 py-1.5 text-white">
                    {t("featuredStory")}
                  </span>
                  <span className="text-[#BA4811]">{featuredStory.category}</span>
                </div>
                <h2 className="mt-6 text-[1.7rem] font-bold leading-[1.15] tracking-[-0.035em] sm:text-[2rem]">
                  {featuredStory.title}
                </h2>
                {featuredStory.summary && (
                  <p className="mt-5 line-clamp-3 text-sm leading-7 text-[#626761]">
                    {featuredStory.summary}
                  </p>
                )}
                <div className="mt-7 flex flex-wrap items-center justify-between gap-5 border-t border-[#dedad5] pt-5">
                  <span className="inline-flex items-center gap-2 text-[0.72rem] text-[#777b76]">
                    <HugeiconsIcon icon={Calendar03Icon} size={15} strokeWidth={1.5} />
                    {featuredStory.date}
                  </span>
                  <a
                    href={newsHref(featuredStory)}
                    className="group/link inline-flex min-h-11 items-center gap-3 bg-[#BA4811] px-5 text-sm font-semibold text-white transition-[background-color,transform] hover:-translate-y-0.5 hover:bg-[#96380d] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#BA4811]"
                  >
                    {t("viewDetails")}
                    <HugeiconsIcon
                      icon={ArrowUpRight01Icon}
                      size={17}
                      strokeWidth={1.7}
                      className="transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5"
                    />
                  </a>
                </div>
              </div>
            </motion.article>
          ) : (
            <div className="mt-9 border border-[#dedad5] px-6 py-16 text-center text-sm text-[#686c67]">
              {t("noNews")}
            </div>
          )}
        </div>
      </section>

      <section className="relative bg-[#f7f4f1] py-14 sm:py-16">
        <SectionTab label={t("latestNews")} />
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-7 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
            <motion.h2
              initial="hidden"
              whileInView="visible"
              variants={reveal}
              viewport={{ once: true }}
              className="text-[1.8rem] font-bold leading-tight tracking-[-0.035em] sm:text-[2.1rem]"
            >
              {t("latestNews")}
            </motion.h2>
            {categories.length > 0 && (
              <div className="flex flex-wrap gap-2 lg:justify-end" aria-label={t("browseByTopic")}>
                {["all", ...categories].map((category) => {
                  const selected = category === activeCategory;
                  return (
                    <button
                      key={category}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setActiveCategory(category)}
                      className={`min-h-10 border px-4 text-[0.7rem] font-semibold uppercase tracking-[0.1em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#BA4811] ${
                        selected
                          ? "border-[#BA4811] bg-[#BA4811] text-white"
                          : "border-[#d7d1cb] bg-white text-[#666a65] hover:border-[#BA4811] hover:text-[#BA4811]"
                      }`}
                    >
                      {category === "all" ? t("allCategories") : category}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {visibleNews.length > 0 ? (
            <div className="mt-9 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {visibleNews.map((story, index) => (
                <motion.a
                  key={`${story.title}-${story.date}`}
                  href={newsHref(story)}
                  initial="hidden"
                  whileInView="visible"
                  variants={reveal}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: (index % 3) * 0.07 }}
                  className="group relative flex flex-col overflow-hidden border border-[#dedad5] bg-white transition-[border-color,transform,box-shadow] duration-300 hover:-translate-y-1 hover:border-[#BA4811] hover:shadow-[0_12px_26px_rgba(55,34,23,0.07)]"
                >
                  <div className="relative overflow-hidden">
                    <NewsVisual item={story} index={index + 1} />
                    <span className="absolute bottom-0 left-0 bg-[#BA4811] px-3.5 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.13em] text-white">
                      {story.category}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-center gap-1.5 text-[0.68rem] text-[#858984]">
                      <HugeiconsIcon icon={Calendar03Icon} size={13} strokeWidth={1.5} />
                      <span>{story.date}</span>
                    </div>
                    <h3 className="mt-4 line-clamp-2 text-[1rem] font-bold leading-[1.4] tracking-[-0.025em] transition-colors group-hover:text-[#BA4811] sm:text-[1.08rem]">
                      {story.title}
                    </h3>
                    {story.summary && (
                      <p className="mt-3 line-clamp-2 text-[0.78rem] leading-6 text-[#686c67]">
                        {story.summary}
                      </p>
                    )}
                    <div className="mt-auto flex items-center justify-between border-t border-[#e6e1dc] pt-5 text-[0.78rem] font-semibold text-[#BA4811]">
                      <span>{t("viewDetails")}</span>
                      <span className="flex h-9 w-9 items-center justify-center border border-[#BA4811]/35 transition-colors group-hover:border-[#BA4811] group-hover:bg-[#BA4811] group-hover:text-white">
                        <HugeiconsIcon
                          icon={ArrowUpRight01Icon}
                          size={16}
                          strokeWidth={1.6}
                          className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        />
                      </span>
                    </div>
                  </div>
                </motion.a>
              ))}
            </div>
          ) : (
            <div className="mt-9 border border-[#dedad5] bg-white px-6 py-14 text-center text-sm text-[#686c67]">
              {t("noNews")}
            </div>
          )}
        </div>
      </section>

      {topicGroups.length > 0 && (
        <section className="relative border-t border-[#dedad5] bg-white py-14 sm:py-16">
          <SectionTab label={t("topicsEyebrow")} />
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="grid gap-7 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
              <motion.div
                initial="hidden"
                whileInView="visible"
                variants={reveal}
                viewport={{ once: true }}
              >
                <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[#BA4811]">
                  {t("topicsEyebrow")}
                </p>
                <h2 className="mt-4 text-[1.8rem] font-bold leading-tight tracking-[-0.035em] sm:text-[2.1rem]">
                  {t("topicsTitle")}
                </h2>
              </motion.div>
              <p className="max-w-xl text-sm leading-7 text-[#686c67] lg:justify-self-end">
                {t("topicsDescription")}
              </p>
            </div>

            <div
              className={`mt-9 grid border-t border-[#dedad5] ${
                topicGroups.length === 2
                  ? "md:grid-cols-2"
                  : topicGroups.length > 2
                    ? "md:grid-cols-2 lg:grid-cols-3"
                    : ""
              }`}
            >
              {topicGroups.map((group, index) => (
                <motion.article
                  key={group.category}
                  initial="hidden"
                  whileInView="visible"
                  variants={reveal}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: (index % 3) * 0.06 }}
                  className={`border-b border-[#dedad5] py-7 md:px-6 ${
                    index % 2 === 1 ? "md:border-l" : ""
                  } ${index % 3 !== 0 ? "lg:border-l" : "lg:border-l-0"}`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-[0.72rem] font-bold uppercase tracking-[0.14em] text-[#BA4811]">
                      {group.category}
                    </h3>
                    <span className="font-mono text-[0.65rem] text-[#858984]">
                      {t("storyCount", { count: group.count })}
                    </span>
                  </div>
                  <div className="mt-5 divide-y divide-[#e6e1dc]">
                    {group.stories.map((story) => (
                      <Link
                        key={`${group.category}-${story.title}`}
                        href={newsHref(story)}
                        className="group block py-4 first:pt-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#BA4811]"
                      >
                        <p className="line-clamp-2 text-[0.92rem] font-semibold leading-6 tracking-[-0.015em] transition-colors group-hover:text-[#BA4811]">
                          {story.title}
                        </p>
                        <p className="mt-2 font-mono text-[0.62rem] uppercase tracking-[0.08em] text-[#8a8e89]">
                          {story.date}
                        </p>
                      </Link>
                    ))}
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>
      )}

      {events.length > 0 && (
        <section className="relative bg-white py-14 sm:py-16">
          <SectionTab label={t("upcomingEvents")} />
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="mb-9 grid gap-4 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
              <h2 className="text-[1.8rem] font-bold leading-tight tracking-[-0.035em] sm:text-[2.1rem]">
                {t("upcomingEvents")}
              </h2>
              <p className="max-w-xl text-sm leading-7 text-[#686c67] lg:justify-self-end">
                {t("description")}
              </p>
            </div>
            <div className="border-t border-[#dedad5]">
              {events.map((event, index) => (
                <motion.article
                  key={event.id}
                  initial="hidden"
                  whileInView="visible"
                  variants={reveal}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.06 }}
                  className="grid gap-5 border-b border-[#dedad5] py-6 sm:grid-cols-[8rem_1fr] sm:py-7 lg:grid-cols-[9rem_0.9fr_1.1fr]"
                >
                  <div className="font-mono text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-[#BA4811]">
                    {event.date}
                  </div>
                  <h3 className="text-base font-bold leading-snug tracking-tight">
                    {event.title}
                  </h3>
                  {event.description && (
                    <p className="text-[0.8rem] leading-6 text-[#686c67]">
                      {event.description}
                    </p>
                  )}
                </motion.article>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="relative bg-[#f7f4f1] py-14 sm:py-16">
        <SectionTab label={t("insightsEyebrow")} />
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-7 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
            <motion.div
              initial="hidden"
              whileInView="visible"
              variants={reveal}
              viewport={{ once: true }}
            >
              <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[#BA4811]">
                {t("insightsEyebrow")}
              </p>
              <h2 className="mt-4 max-w-lg text-[1.8rem] font-bold leading-tight tracking-[-0.035em] sm:text-[2.1rem]">
                {t("insightsTitle")}
              </h2>
            </motion.div>
            <p className="max-w-xl text-sm leading-7 text-[#686c67] lg:justify-self-end">
              {t("insightsDescription")}
            </p>
          </div>

          <div className="mt-9 grid border border-[#dedad5] bg-white lg:grid-cols-[1.08fr_0.92fr]">
            <motion.article
              initial="hidden"
              whileInView="visible"
              variants={reveal}
              viewport={{ once: true }}
              className="flex min-h-[22rem] flex-col border-b border-[#dedad5] p-6 sm:p-8 lg:border-b-0 lg:border-r lg:p-10"
            >
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#dedad5] pb-5">
                <span className="text-[0.7rem] font-bold uppercase tracking-[0.15em] text-[#BA4811]">
                  {t("researchLabel")}
                </span>
                <span className="font-mono text-[0.65rem] uppercase tracking-[0.08em] text-[#858984]">
                  {featuredResearch
                    ? [
                        featuredResearch.type === "PUBLICATION"
                          ? t("publicationLabel")
                          : t("projectLabel"),
                        featuredResearchYear,
                      ]
                        .filter(Boolean)
                        .join(" / ")
                    : t("researchArchiveLabel")}
                </span>
              </div>
              <h3 className="mt-7 max-w-2xl text-[1.35rem] font-bold leading-[1.25] tracking-[-0.03em] sm:text-[1.6rem]">
                {featuredResearch?.title ?? t("researchFallbackTitle")}
              </h3>
              <p className="mt-5 line-clamp-4 max-w-2xl text-[0.85rem] leading-7 text-[#686c67]">
                {featuredResearch?.abstract || t("researchFallbackDescription")}
              </p>
              {featuredResearch &&
                (featuredResearch.researchField ||
                  featuredResearch.journalName ||
                  featuredResearch.sponsor) && (
                  <p className="mt-5 font-mono text-[0.64rem] uppercase tracking-[0.09em] text-[#858984]">
                    {[
                      featuredResearch.researchField,
                      featuredResearch.journalName,
                      featuredResearch.sponsor,
                    ]
                      .filter(Boolean)
                      .join(" / ")}
                  </p>
                )}
              <Link
                href={researchHref}
                className="mt-auto inline-flex w-fit border-b border-[#BA4811] pt-8 pb-1 text-[0.78rem] font-semibold text-[#BA4811] transition-colors hover:border-[#96380d] hover:text-[#96380d] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#BA4811]"
              >
                {t("viewResearch")}
              </Link>
            </motion.article>

            <motion.div
              initial="hidden"
              whileInView="visible"
              variants={reveal}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.08 }}
              className="flex min-h-[22rem] flex-col p-6 sm:p-8 lg:p-10"
            >
              <div className="border-b border-[#dedad5] pb-5">
                <h3 className="text-[0.7rem] font-bold uppercase tracking-[0.15em] text-[#BA4811]">
                  {t("achievementsLabel")}
                </h3>
              </div>

              {spotlightAchievements.length > 0 ? (
                <div className="divide-y divide-[#dedad5]">
                  {spotlightAchievements.map((achievement) => (
                    <article key={achievement.id} className="py-6">
                      <p className="font-mono text-[0.63rem] uppercase tracking-[0.09em] text-[#858984]">
                        {[achievement.rank, achievement.achievedYear]
                          .filter(Boolean)
                          .join(" / ")}
                      </p>
                      <h4 className="mt-3 text-[1rem] font-bold leading-6 tracking-[-0.02em]">
                        {achievement.title}
                      </h4>
                      {(achievement.description ||
                        achievement.projectName ||
                        achievement.organization) && (
                        <p className="mt-3 line-clamp-2 text-[0.78rem] leading-6 text-[#686c67]">
                          {achievement.description ??
                            achievement.projectName ??
                            achievement.organization}
                        </p>
                      )}
                    </article>
                  ))}
                </div>
              ) : (
                <div className="py-7">
                  <h4 className="text-[1rem] font-bold leading-6 tracking-[-0.02em]">
                    {t("achievementsFallbackTitle")}
                  </h4>
                  <p className="mt-3 text-[0.78rem] leading-6 text-[#686c67]">
                    {t("achievementsFallbackDescription")}
                  </p>
                </div>
              )}

              <Link
                href={achievementsHref}
                className="mt-auto inline-flex w-fit border-b border-[#BA4811] pt-6 pb-1 text-[0.78rem] font-semibold text-[#BA4811] transition-colors hover:border-[#96380d] hover:text-[#96380d] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#BA4811]"
              >
                {t("viewAchievements")}
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {quickNews.length > 0 && (
        <section className="relative border-t border-[#dedad5] bg-white py-14 sm:py-16">
          <SectionTab label={t("quickFeedEyebrow")} />
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="grid gap-7 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
              <motion.div
                initial="hidden"
                whileInView="visible"
                variants={reveal}
                viewport={{ once: true }}
              >
                <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[#BA4811]">
                  {t("quickFeedEyebrow")}
                </p>
                <h2 className="mt-4 text-[1.8rem] font-bold leading-tight tracking-[-0.035em] sm:text-[2.1rem]">
                  {t("quickFeedTitle")}
                </h2>
              </motion.div>
              <p className="max-w-xl text-sm leading-7 text-[#686c67] lg:justify-self-end">
                {t("quickFeedDescription")}
              </p>
            </div>

            <div className="mt-9 border-t border-[#dedad5]">
              {quickNews.map((story, index) => (
                <motion.div
                  key={`quick-${story.title}-${story.date}`}
                  initial="hidden"
                  whileInView="visible"
                  variants={reveal}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: (index % 4) * 0.04 }}
                  className="grid gap-3 border-b border-[#dedad5] py-5 sm:grid-cols-[8.5rem_8rem_1fr] sm:items-center sm:gap-5"
                >
                  <time className="font-mono text-[0.64rem] uppercase tracking-[0.06em] text-[#858984]">
                    {story.date}
                  </time>
                  <span className="text-[0.66rem] font-bold uppercase tracking-[0.11em] text-[#BA4811]">
                    {story.category}
                  </span>
                  <Link
                    href={newsHref(story)}
                    className="w-fit text-[0.92rem] font-semibold leading-6 tracking-[-0.015em] transition-colors hover:text-[#BA4811] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#BA4811]"
                  >
                    {story.title}
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="relative border-t border-[#dedad5] bg-white py-14 sm:py-16">
        <SectionTab label={t("exploreSIT")} />
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-7 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
            <motion.div
              initial="hidden"
              whileInView="visible"
              variants={reveal}
              viewport={{ once: true }}
            >
              <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[#BA4811]">
                {t("officialChannel")}
              </p>
              <h2 className="mt-4 max-w-md text-[1.8rem] font-bold leading-tight tracking-[-0.035em] sm:text-[2.1rem]">
                {t("exploreSIT")}
              </h2>
            </motion.div>
            <p className="max-w-xl text-sm leading-7 text-[#686c67] lg:justify-self-end">
              {t("exploreSITDescription")}
            </p>
          </div>

          <div className="mt-9 grid border border-[#dedad5] sm:grid-cols-2 lg:grid-cols-4">
            {exploreLinks.map((item, index) => (
              <motion.div
                key={item.href}
                initial="hidden"
                whileInView="visible"
                variants={reveal}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: index * 0.06 }}
                className={`${index > 0 ? "border-t border-[#dedad5] sm:border-t-0 sm:border-l" : ""} ${
                  index === 2 ? "sm:border-l-0 sm:border-t lg:border-l lg:border-t-0" : ""
                } ${index === 3 ? "sm:border-t lg:border-t-0" : ""}`}
              >
                <Link
                  href={item.href}
                  className="group flex min-h-56 flex-col p-6 transition-colors hover:bg-[#f7f4f1] focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#BA4811]"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[0.62rem] font-semibold text-[#BA4811]">
                      0{index + 1}
                    </span>
                    <span className="h-px w-10 bg-[#BA4811]/35 transition-all duration-300 group-hover:w-16 group-hover:bg-[#BA4811]" />
                  </div>
                  <h3 className="mt-10 text-base font-bold tracking-tight transition-colors group-hover:text-[#BA4811]">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-[0.78rem] leading-6 text-[#686c67]">
                    {item.description}
                  </p>
                  <span className="mt-auto inline-flex items-center gap-2 pt-6 text-[0.75rem] font-semibold text-[#BA4811]">
                    {t("exploreLink")}
                    <span className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                      <ArrowIcon direction="up-right" size={16} />
                    </span>
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
