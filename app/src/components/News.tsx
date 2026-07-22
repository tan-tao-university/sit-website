"use client";

import { useTranslations, useLocale } from "next-intl";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Calendar03Icon,
  Clock01Icon,
  Location01Icon,
  ArrowUpRight01Icon,
} from "@hugeicons/core-free-icons";
import { motion } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { api, type Event as ApiEvent } from "@/lib/api";
import { formatVietnameseDate } from "@/utils/common";
import { getCategoryDisplay } from "@/lib/news-categories";
import SectionTab from "@/components/SectionTab";
import { NewsVisual } from "@/components/NewsVisual";

type NewsItem = {
  title: string;
  date: string;
  category: string;
  summary: string;
  image?: string;
  slug?: string;
};

export default function News() {
  const t = useTranslations("news");
  const tNav = useTranslations("header.navigation");
  const locale = useLocale();
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [events, setEvents] = useState<ApiEvent[]>([]);

  const fallbackNews = useMemo(
    () => (t.raw("newsList") as NewsItem[]) ?? [],
    [t],
  );

  useEffect(() => {
    async function fetchHomeContent() {
      const [newsResult, eventsResult] = await Promise.allSettled([
        api.news.findAll(),
        api.events.findUpcoming(3),
      ]);

      if (newsResult.status === "fulfilled") {
        const data = newsResult.value;
        const formatted: NewsItem[] = data
          .filter((item) => item.status === "published")
          .sort(
            (a, b) =>
              new Date(b.publishedAt || b.createdAt).getTime() -
              new Date(a.publishedAt || a.createdAt).getTime(),
          )
          .slice(0, 5)
          .map((item) => ({
            title: item.title,
            date: item.publishedAt
              ? formatVietnameseDate(item.publishedAt, "dd MMMM, yyyy")
              : "",
            category: getCategoryDisplay(
              item.category || "general",
              locale as "vi" | "en",
            ),
            summary: item.summary || "",
            image: item.coverImage,
            slug: item.slug,
          }));
        setNewsItems(formatted.length > 0 ? formatted : fallbackNews);
      } else {
        console.error("Failed to fetch news", newsResult.reason);
        setNewsItems(fallbackNews);
      }

      if (eventsResult.status === "fulfilled") {
        setEvents(eventsResult.value);
      } else {
        console.error("Failed to fetch upcoming events", eventsResult.reason);
        setEvents([]);
      }
    }
    fetchHomeContent();
  }, [locale, fallbackNews]);

  const eventTitle = (event: ApiEvent) =>
    locale === "en" ? event.titleEn || event.titleVi : event.titleVi;
  const eventDescription = (event: ApiEvent) =>
    locale === "en"
      ? event.descriptionEn || event.descriptionVi
      : event.descriptionVi;
  const eventLocation = (event: ApiEvent) =>
    locale === "en" ? event.locationEn || event.locationVi : event.locationVi;
  const formatEventDate = (value: string) =>
    new Intl.DateTimeFormat(locale === "en" ? "en-US" : "vi-VN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(new Date(value));
  const formatEventTime = (event: ApiEvent) => {
    const formatter = new Intl.DateTimeFormat(
      locale === "en" ? "en-US" : "vi-VN",
      {
        hour: "2-digit",
        minute: "2-digit",
      },
    );
    const start = formatter.format(new Date(event.startAt));
    return event.endAt
      ? `${start} - ${formatter.format(new Date(event.endAt))}`
      : start;
  };

  const newsHref = (item: NewsItem) =>
    item.slug
      ? locale === "vi"
        ? `/${locale}/tin-tuc/${item.slug}`
        : `/${locale}/news/${item.slug}`
      : "#";
  const newsIndexHref = locale === "vi" ? "/vi/tin-tuc" : "/en/news";

  return (
    <section className="relative bg-white py-14 sm:py-16">
      <SectionTab label={tNav("news")} />
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-12 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between"
        >
          <h2 className="max-w-md text-[1.6rem] font-bold leading-tight tracking-tight text-gray-900 sm:text-[1.9rem]">
            {t("latestNews")}
          </h2>
          <p className="max-w-xs text-[12px] leading-relaxed text-gray-500">
            {t("description")}
          </p>
        </motion.div>

        {/* Cards grid — same style as the /tin-tuc listing cards (NewsVisual image treatment,
            bottom-left category badge, line-clamp copy, boxed arrow footer) */}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {newsItems.map((item, index) => (
            <motion.a
              key={`${item.title}-${item.date}`}
              href={newsHref(item)}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: (index % 3) * 0.1 }}
              viewport={{ once: true }}
              className={`group relative flex flex-col overflow-hidden border border-[#dedad5] bg-white transition-[border-color,transform,box-shadow] duration-300 hover:-translate-y-1 hover:border-[#BA4811] hover:shadow-[0_12px_26px_rgba(55,34,23,0.07)] ${
                index === 0 ? "md:col-span-2 md:flex-row" : ""
              }`}
            >
              <div
                className={`relative overflow-hidden ${
                  index === 0 ? "md:w-1/2 md:shrink-0" : ""
                }`}
              >
                <NewsVisual item={item} index={index} featured={index === 0} />
                <span className="absolute bottom-0 left-0 bg-[#BA4811] px-3.5 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.13em] text-white">
                  {item.category}
                </span>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-center gap-1.5 text-[0.68rem] text-[#858984]">
                  <HugeiconsIcon icon={Calendar03Icon} size={13} strokeWidth={1.5} />
                  <span>{item.date}</span>
                </div>
                <h3 className="mt-4 line-clamp-2 text-[1rem] font-bold leading-[1.4] tracking-[-0.025em] text-gray-900 transition-colors group-hover:text-[#BA4811] sm:text-[1.08rem]">
                  {item.title}
                </h3>
                {item.summary && (
                  <p className="mt-3 line-clamp-2 text-[0.78rem] leading-6 text-[#686c67]">
                    {item.summary}
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

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          viewport={{ once: true }}
          className="mt-10 text-center"
        >
          <Link
            href={newsIndexHref}
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#BA4811] underline underline-offset-4 transition-colors hover:text-[#9c3c0e] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#BA4811]"
          >
            {t("viewAllNews")}
          </Link>
        </motion.div>

        {events.length > 0 && (
          <>
            <motion.h3
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="mb-7 mt-14 text-xl font-bold tracking-tight text-gray-900"
            >
              {t("upcomingEvents")}
            </motion.h3>
            <div className="grid gap-5 md:grid-cols-3">
              {events.map((event, index) => (
                <motion.article
                  key={event.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="border-l-2 border-[#BA4811] py-1 pl-5"
                >
                  <div className="mb-2 inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#BA4811]">
                    <HugeiconsIcon icon={Calendar03Icon} size={13} />
                    {formatEventDate(event.startAt)}
                  </div>
                  <h4 className="mb-1.5 text-[15px] font-bold leading-snug tracking-tight text-gray-900">
                    {eventTitle(event)}
                  </h4>
                  {eventDescription(event) && (
                    <p className="mb-4 text-[13px] leading-relaxed text-gray-500">
                      {eventDescription(event)}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-gray-400">
                    <span className="inline-flex items-center gap-1">
                      <HugeiconsIcon icon={Clock01Icon} size={13} />
                      {formatEventTime(event)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <HugeiconsIcon icon={Location01Icon} size={13} />
                      {eventLocation(event)}
                    </span>
                  </div>
                  {event.registrationUrl && (
                    <a
                      href={event.registrationUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-flex items-center gap-1 text-[12px] font-semibold text-[#BA4811] underline decoration-[#BA4811]/35 underline-offset-4 transition-colors hover:decoration-[#BA4811]"
                    >
                      {t("viewDetails")}
                      <HugeiconsIcon icon={ArrowUpRight01Icon} size={14} />
                    </a>
                  )}
                </motion.article>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
