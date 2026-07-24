"use client";

import { motion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import { useEffect, useState } from "react";
import { api, type Achievement } from "@/lib/api";
import Link from "next/link";
import SectionTab from "@/components/SectionTab";

const Achievements = () => {
  const t = useTranslations("achievements");
  const locale = useLocale();
  const [items, setItems] = useState<Achievement[]>([]);

  useEffect(() => {
    api.achievements
      .findAll({ visibility: "PUBLIC" })
      .then((data) => {
        // Keep highlighted achievements first, then favour entries with a
        // curated cover image before sorting by year.
        const sorted = [...data].sort((a, b) => {
          if (!!b.isHighlight !== !!a.isHighlight)
            return b.isHighlight ? 1 : -1;
          if (!!b.coverImage !== !!a.coverImage) return b.coverImage ? 1 : -1;
          return (b.achievedYear ?? 0) - (a.achievedYear ?? 0);
        });
        setItems(sorted.slice(0, 4));
      })
      .catch((error) => console.error("Failed to fetch achievements", error));
  }, []);

  // ponytail: no static fallback exists for achievements — hide when API is empty
  if (items.length === 0) return null;

  const achievementsHref =
    locale === "vi" ? `/${locale}/thanh-tich` : `/${locale}/achievements`;

  return (
    <section className="relative bg-[#f7f4f1] py-14 sm:py-16">
      <SectionTab label={t("badge")} />
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

        {/* Achievement cards */}
        <div
          className={
            items.length === 1
              ? "grid"
              : "grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
          }
        >
          {items.map((item, index) => {
            const isSingle = items.length === 1;
            return (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: (index % 4) * 0.1 }}
                viewport={{ once: true }}
                className={`group overflow-hidden border border-[#dedad5] bg-white transition-[border-color,box-shadow] duration-300 hover:border-[#c9b8aa] hover:shadow-[8px_8px_0_#eadfd6] ${
                  isSingle
                    ? "grid sm:grid-cols-[minmax(17rem,0.9fr)_1.1fr]"
                    : "flex flex-col"
                }`}
              >
                <figure
                  className={`relative overflow-hidden bg-[#eee5de] ${
                    isSingle ? "min-h-64" : "aspect-[4/3]"
                  }`}
                >
                  {item.coverImage ? (
                    <img
                      src={item.coverImage}
                      alt={item.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035]"
                    />
                  ) : (
                    <div className="relative flex h-full min-h-48 flex-col justify-between overflow-hidden bg-[#eee5de] p-5">
                      <span className="relative z-10 max-w-[12rem] text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9c3c0e]">
                        {item.type.replaceAll("_", " ")}
                      </span>
                      <span className="relative z-10 font-mono text-[2.8rem] font-medium leading-none tracking-[-0.07em] text-[#BA4811]">
                        {item.achievedYear ?? "SIT"}
                      </span>
                      <span className="absolute -bottom-10 -right-6 h-40 w-40 rounded-full border border-[#BA4811]/20" />
                      <span className="absolute -bottom-4 right-9 h-24 w-24 rounded-full border border-[#BA4811]/25" />
                    </div>
                  )}
                  {item.level && item.coverImage && (
                    <span className="absolute left-4 top-4 bg-white/95 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.13em] text-[#9c3c0e] shadow-sm backdrop-blur-sm">
                      {t(`levels.${item.level}`)}
                    </span>
                  )}
                </figure>

                <div
                  className={`flex flex-1 flex-col ${
                    isSingle ? "p-7 sm:p-9" : "p-5"
                  }`}
                >
                  <div className="mb-4 flex items-center justify-between gap-3 border-b border-[#ebe6e1] pb-3 font-mono text-[9px] uppercase tracking-[0.12em]">
                    <span className="text-[#BA4811]">
                      {item.level ? t(`levels.${item.level}`) : item.type}
                    </span>
                    {item.achievedYear && (
                      <span className="text-gray-400">{item.achievedYear}</span>
                    )}
                  </div>

                  <h3
                    className={`mb-3 line-clamp-3 font-bold tracking-tight text-gray-900 ${
                      isSingle
                        ? "max-w-2xl text-xl leading-snug sm:text-2xl"
                        : "text-[15px] leading-[1.42]"
                    }`}
                  >
                    {item.rank ? `${item.rank} — ${item.title}` : item.title}
                  </h3>
                  {item.projectName && (
                    <p className="line-clamp-2 text-[12px] leading-relaxed text-gray-500">
                      {item.projectName}
                    </p>
                  )}
                </div>
              </motion.article>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          viewport={{ once: true }}
          className="mt-10 text-center"
        >
          <Link
            href={achievementsHref}
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#BA4811] underline underline-offset-4 hover:text-[#9c3c0e]"
          >
            {t("viewAll")}
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default Achievements;
