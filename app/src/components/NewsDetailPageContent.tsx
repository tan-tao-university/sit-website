"use client";

import { useEffect, useMemo, useState } from "react";
import { Facebook, Linkedin, Link as LinkIcon } from "lucide-react";
import { ArrowLeft02Icon, ArrowUpRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import YooptaRenderer from "@/components/YooptaRenderer";
import { api, type News } from "@/lib/api";
import { getCategoryDisplay } from "@/lib/news-categories";
import { extractNewsText, getNewsImage } from "@/lib/news-content";
import type { SiteLocale } from "@/lib/program-pages";

const LoadingState = ({ locale }: { locale: SiteLocale }) => (
  <main className="min-h-screen animate-pulse bg-white">
    <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:py-16">
      <div className="h-3 w-40 bg-[#e7e2dd]" />
      <div className="mt-12 h-32 max-w-4xl bg-[#ece7e2]" />
      <div className="mt-8 h-16 max-w-2xl bg-[#f1ede9]" />
      <p className="sr-only">{locale === "vi" ? "Đang tải bài viết" : "Loading article"}</p>
    </section>
  </main>
);

const formatNewsDate = (date: string | undefined, locale: SiteLocale) => {
  if (!date) return "";
  return new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
};

const NewsRecommendationCard = ({
  item,
  locale,
  index,
}: {
  item: News;
  locale: SiteLocale;
  index: number;
}) => {
  const newsPath = locale === "vi" ? "/vi/tin-tuc" : "/en/news";
  const image = getNewsImage(item);

  return (
    <article className="group border-t-2 border-[#171b25] pt-4">
      <Link
        href={`${newsPath}/${item.slug}`}
        className="block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#BA4811]"
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-[#eee9e4]">
          {image ? (
            <img
              src={image}
              alt={item.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.035]"
            />
          ) : (
            <div className="flex h-full items-end justify-between bg-[#f3efeb] p-5">
              <span className="font-mono text-[0.58rem] uppercase tracking-[0.16em] text-[#BA4811]">SIT News</span>
              <span className="font-mono text-5xl font-bold text-[#171b25]/10">{String(index + 1).padStart(2, "0")}</span>
            </div>
          )}
        </div>
        <div className="flex items-start justify-between gap-5 py-5">
          <div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[0.55rem] uppercase tracking-[0.12em] text-[#898c87]">
              <span className="text-[#BA4811]">{getCategoryDisplay(item.category || "general", locale)}</span>
              <span aria-hidden>·</span>
              <time dateTime={item.publishedAt}>{formatNewsDate(item.publishedAt, locale)}</time>
            </div>
            <h3 className="mt-3 text-lg font-bold leading-snug tracking-[-0.025em] transition-colors group-hover:text-[#BA4811] sm:text-xl">
              {item.title}
            </h3>
          </div>
          <HugeiconsIcon icon={ArrowUpRight01Icon} size={19} className="mt-1 shrink-0 text-[#BA4811]" />
        </div>
      </Link>
    </article>
  );
};

const NewsLinkRow = ({ item, locale }: { item: News; locale: SiteLocale }) => {
  const newsPath = locale === "vi" ? "/vi/tin-tuc" : "/en/news";

  return (
    <Link
      href={`${newsPath}/${item.slug}`}
      className="group grid min-h-24 grid-cols-[5.25rem_1fr_auto] items-start gap-4 border-t border-[#d8d3ce] py-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#BA4811]"
    >
      <time dateTime={item.publishedAt} className="font-mono text-[0.54rem] uppercase leading-5 tracking-[0.1em] text-[#8a8d88]">
        {formatNewsDate(item.publishedAt, locale)}
      </time>
      <span className="font-semibold leading-6 tracking-[-0.015em] transition-colors group-hover:text-[#BA4811]">{item.title}</span>
      <HugeiconsIcon icon={ArrowUpRight01Icon} size={17} className="mt-1 text-[#BA4811]" />
    </Link>
  );
};

export default function NewsDetailPageContent({
  locale,
  slug,
  initialNews,
  initialItems,
}: {
  locale: SiteLocale;
  slug: string;
  initialNews?: News;
  initialItems?: News[];
}) {
  const [news, setNews] = useState<News | null>(initialNews ?? null);
  const [allItems, setAllItems] = useState<News[]>(initialItems ?? []);
  const [recentlyViewed, setRecentlyViewed] = useState<News[]>([]);
  const [loading, setLoading] = useState(initialNews === undefined);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (initialNews !== undefined) {
      setNews(initialNews);
      setLoading(false);
      setError(false);
      return;
    }

    let active = true;

    async function fetchNews() {
      try {
        const data = await api.news.findOne(slug);
        if (active) setNews(data);
      } catch (fetchError) {
        console.error("Failed to fetch news detail", fetchError);
        if (active) setError(true);
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchNews();
    return () => {
      active = false;
    };
  }, [initialNews, slug]);

  useEffect(() => {
    if (initialItems !== undefined) {
      setAllItems(initialItems);
      return;
    }

    let active = true;
    api.news
      .findAll()
      .then((items) => {
        if (active) setAllItems(items);
      })
      .catch((fetchError) => console.error("Failed to fetch article recommendations", fetchError));

    return () => {
      active = false;
    };
  }, [initialItems]);

  const publishedItems = useMemo(
    () =>
      [...allItems]
        .filter((item) => item.status === "published" && item.category !== "events")
        .sort(
          (a, b) =>
            new Date(b.publishedAt || 0).getTime() -
            new Date(a.publishedAt || 0).getTime(),
        ),
    [allItems],
  );

  const relatedItems = useMemo(() => {
    if (!news) return [];
    return publishedItems
      .filter((item) => item.slug !== news.slug && item.category === news.category)
      .slice(0, 3);
  }, [news, publishedItems]);

  const latestItems = useMemo(() => {
    if (!news) return [];
    const relatedSlugs = new Set(relatedItems.map((item) => item.slug));
    return publishedItems
      .filter((item) => item.slug !== news.slug && !relatedSlugs.has(item.slug))
      .slice(0, 4);
  }, [news, publishedItems, relatedItems]);

  const recentItemsForDisplay = useMemo(() => {
    const visibleSlugs = new Set(
      [...relatedItems, ...latestItems].map((item) => item.slug),
    );
    return recentlyViewed.filter((item) => !visibleSlugs.has(item.slug));
  }, [latestItems, recentlyViewed, relatedItems]);

  useEffect(() => {
    if (!news || publishedItems.length === 0) return;

    const storageKey = `sit-recent-news-${locale}`;
    try {
      const saved = JSON.parse(window.localStorage.getItem(storageKey) || "[]");
      const previousSlugs = Array.isArray(saved)
        ? saved.filter((item: unknown): item is string => typeof item === "string")
        : [];
      const bySlug = new Map(publishedItems.map((item) => [item.slug, item]));
      setRecentlyViewed(
        previousSlugs
          .filter((itemSlug) => itemSlug !== news.slug)
          .map((itemSlug) => bySlug.get(itemSlug))
          .filter((item): item is News => Boolean(item))
          .slice(0, 3),
      );
      window.localStorage.setItem(
        storageKey,
        JSON.stringify([news.slug, ...previousSlugs.filter((itemSlug) => itemSlug !== news.slug)].slice(0, 8)),
      );
    } catch (storageError) {
      console.error("Failed to update recently viewed news", storageError);
    }
  }, [locale, news, publishedItems]);

  if (loading) return <LoadingState locale={locale} />;

  const newsPath = locale === "vi" ? "/vi/tin-tuc" : "/en/news";
  const copy =
    locale === "vi"
      ? {
          breadcrumb: "Tin tức",
          editorial: "Ban Truyền thông SIT",
          published: "Ngày đăng",
          author: "Biên tập",
          readTime: "Thời gian đọc",
          minute: "phút",
          share: "Chia sẻ bài viết",
          copyLink: "Sao chép liên kết",
          copied: "Đã sao chép",
          articleInfo: "Thông tin bài viết",
          category: "Chuyên mục",
          back: "Trở lại trang tin tức",
          next: "Tiếp tục khám phá SIT",
          nextDescription: "Theo dõi các hoạt động học thuật, thành tích và câu chuyện mới từ cộng đồng SIT.",
          related: "Bài viết liên quan",
          relatedDescription: "Các bài viết trong cùng chuyên mục với nội dung bạn đang đọc.",
          latest: "Tin mới nhất",
          latestDescription: "Những cập nhật mới từ cộng đồng SIT.",
          recent: "Đã xem gần đây",
          recentDescription: "Quay lại những bài viết bạn vừa đọc trên thiết bị này.",
          notFound: "Không tìm thấy bài viết này",
        }
      : {
          breadcrumb: "News",
          editorial: "SIT Editorial Team",
          published: "Published",
          author: "Editorial",
          readTime: "Read time",
          minute: "min",
          share: "Share article",
          copyLink: "Copy link",
          copied: "Copied",
          articleInfo: "Article information",
          category: "Category",
          back: "Back to news",
          next: "Continue exploring SIT",
          nextDescription: "Follow academic activities, achievements and new stories from the SIT community.",
          related: "Related stories",
          relatedDescription: "More articles from the same section as the story you are reading.",
          latest: "Latest news",
          latestDescription: "Recent updates from the SIT community.",
          recent: "Recently viewed",
          recentDescription: "Return to stories recently opened on this device.",
          notFound: "This article could not be found",
        };

  if (error || !news) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-white px-5">
        <div className="max-w-lg border-l-4 border-[#BA4811] bg-[#f7f4f1] p-8">
          <p className="text-xl font-bold tracking-tight">{copy.notFound}</p>
          <Link href={newsPath} className="mt-6 inline-flex min-h-11 items-center gap-3 bg-[#BA4811] px-6 text-sm font-semibold text-white">
            <HugeiconsIcon icon={ArrowLeft02Icon} size={17} />
            {copy.back}
          </Link>
        </div>
      </main>
    );
  }

  const articleText = news.contentText?.trim() || extractNewsText(news.content);
  const wordCount = articleText.split(/\s+/).filter(Boolean).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));
  const category = news.category
    ? getCategoryDisplay(news.category, locale)
    : locale === "vi"
      ? "Tin tức"
      : "News";
  const publishedDate = news.publishedAt
    ? new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-US", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }).format(new Date(news.publishedAt))
    : "—";

  const shareUrl = () => window.location.href;
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl());
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch (copyError) {
      console.error("Failed to copy link", copyError);
    }
  };
  const openShare = (network: "facebook" | "linkedin") => {
    const url = encodeURIComponent(shareUrl());
    const shareHref =
      network === "facebook"
        ? `https://www.facebook.com/sharer/sharer.php?u=${url}`
        : `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
    window.open(shareHref, "_blank", "noopener,noreferrer");
  };

  const shareButtons = (
    <div className="flex flex-wrap gap-2 lg:flex-col">
      <button
        type="button"
        onClick={handleCopyLink}
        title={copy.copyLink}
        aria-label={copy.copyLink}
        className="flex h-11 w-11 items-center justify-center border border-[#171b25]/20 text-[#555a55] transition-colors hover:border-[#BA4811] hover:bg-[#BA4811] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#BA4811]"
      >
        <LinkIcon className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => openShare("facebook")}
        title="Facebook"
        aria-label="Facebook"
        className="flex h-11 w-11 items-center justify-center border border-[#171b25]/20 text-[#555a55] transition-colors hover:border-[#BA4811] hover:bg-[#BA4811] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#BA4811]"
      >
        <Facebook className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => openShare("linkedin")}
        title="LinkedIn"
        aria-label="LinkedIn"
        className="flex h-11 w-11 items-center justify-center border border-[#171b25]/20 text-[#555a55] transition-colors hover:border-[#BA4811] hover:bg-[#BA4811] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#BA4811]"
      >
        <Linkedin className="h-4 w-4" />
      </button>
    </div>
  );

  return (
    <main className="min-h-screen overflow-hidden bg-white text-[#171b25]">
      <section className="border-b border-[#171b25]/15 bg-white">
        <div className="mx-auto max-w-7xl px-5 pb-12 pt-7 sm:px-8 lg:pb-16">
          <header className="max-w-5xl">
            <div className="flex items-center gap-4 font-mono text-[0.64rem] font-semibold uppercase tracking-[0.2em] text-[#BA4811]">
              <span className="h-px w-12 bg-current" />
              {category}
            </div>
            <h1 className="mt-7 max-w-[26ch] text-[1.9rem] font-bold leading-[1.22] tracking-[-0.018em] text-balance sm:text-[2.6rem] sm:leading-[1.2] lg:text-[3rem]">
              {news.title}
            </h1>
            {news.summary && (
              <p className="mt-7 max-w-3xl text-base leading-8 text-[#626661] sm:text-lg">{news.summary}</p>
            )}
          </header>

          <div className="mt-10 grid border-y border-[#d8d3ce] sm:grid-cols-3">
            {[
              [copy.published, publishedDate],
              [copy.author, copy.editorial],
              [copy.readTime, `${readTime} ${copy.minute}`],
            ].map(([label, value], index) => (
              <div key={label} className={`border-b border-[#d8d3ce] py-5 sm:border-b-0 sm:px-6 ${index < 2 ? "sm:border-r" : ""} ${index === 0 ? "sm:pl-0" : ""}`}>
                <p className="font-mono text-[0.56rem] uppercase tracking-[0.14em] text-[#8a8d88]">{label}</p>
                <p className="mt-2 text-sm font-semibold leading-6">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-14 sm:py-20 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[5rem_minmax(0,48rem)_minmax(12rem,1fr)] lg:items-start lg:gap-14">
          <aside className="hidden lg:block">
            <div className="sticky top-28">
              <p className="mb-4 font-mono text-[0.55rem] uppercase tracking-[0.14em] text-[#8a8d88]">{copy.share}</p>
              {shareButtons}
              {copied && <p className="mt-3 font-mono text-[0.52rem] uppercase tracking-[0.1em] text-[#BA4811]">{copy.copied}</p>}
            </div>
          </aside>

          <article>
            <div className="mb-9 border-y border-[#d8d3ce] py-5 lg:hidden">
              <p className="mb-4 font-mono text-[0.55rem] uppercase tracking-[0.14em] text-[#8a8d88]">{copy.share}</p>
              {shareButtons}
              {copied && <p className="mt-3 font-mono text-[0.52rem] uppercase tracking-[0.1em] text-[#BA4811]">{copy.copied}</p>}
            </div>

            <YooptaRenderer
              value={news.content}
              className="[&_h1]:mt-12 [&_h1]:border-0 [&_h1]:pb-0 [&_h1]:!text-[1.75rem] [&_h1]:!leading-[1.32] [&_h1]:!tracking-[-0.01em] sm:[&_h1]:!text-[1.9rem] [&_h2]:mt-11 [&_h2]:text-[1.6rem] [&_h2]:leading-tight [&_h2]:tracking-[-0.025em] [&_h3]:mt-9 [&_h3]:text-[1.25rem] [&_h3]:leading-tight [&_p]:text-[1.02rem] [&_p]:leading-8 [&_p]:text-[#555a55] [&_a]:text-[#BA4811] [&_blockquote]:border-l-2 [&_blockquote]:border-[#BA4811] [&_blockquote]:pl-6 [&_img]:my-0 [&_img]:rounded-none"
            />

            <div className="mt-14 border-t-2 border-[#171b25] pt-6">
              <Link href={newsPath} className="inline-flex min-h-11 items-center gap-3 text-sm font-semibold text-[#BA4811] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#BA4811]">
                <HugeiconsIcon icon={ArrowLeft02Icon} size={17} />
                {copy.back}
              </Link>
            </div>
          </article>

          <aside className="hidden lg:block">
            <div className="sticky top-28 border-t-2 border-[#171b25] pt-5">
              <p className="font-mono text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-[#BA4811]">{copy.articleInfo}</p>
              <dl className="mt-5">
                {[
                  [copy.category, category],
                  [copy.published, publishedDate],
                  [copy.author, copy.editorial],
                  [copy.readTime, `${readTime} ${copy.minute}`],
                ].map(([label, value]) => (
                  <div key={label} className="border-t border-[#d8d3ce] py-4 first:border-t-0">
                    <dt className="font-mono text-[0.54rem] uppercase tracking-[0.12em] text-[#8a8d88]">{label}</dt>
                    <dd className="mt-2 text-sm font-semibold leading-6">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </aside>
        </div>
      </section>

      {(relatedItems.length > 0 || latestItems.length > 0 || recentItemsForDisplay.length > 0) && (
        <section className="border-t border-[#171b25]/15 bg-white px-5 py-14 sm:px-8 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-7xl">
            {relatedItems.length > 0 && (
              <div>
                <div className="mb-7 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <h3 className="text-2xl font-bold tracking-[-0.035em] sm:text-3xl">{copy.related}</h3>
                  <p className="max-w-lg text-sm leading-6 text-[#6c706b] sm:text-right">{copy.relatedDescription}</p>
                </div>
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {relatedItems.map((item, index) => (
                    <NewsRecommendationCard key={item.id} item={item} locale={locale} index={index} />
                  ))}
                </div>
              </div>
            )}

            <div className={`mt-12 grid gap-12 border-t border-[#d8d3ce] pt-10 ${recentItemsForDisplay.length > 0 ? "lg:grid-cols-2 lg:gap-16" : ""}`}>
              {latestItems.length > 0 && (
                <div>
                  <div className="mb-4">
                    <h3 className="text-2xl font-bold tracking-[-0.035em]">{copy.latest}</h3>
                    <p className="mt-2 text-sm leading-6 text-[#6c706b]">{copy.latestDescription}</p>
                  </div>
                  <div>
                    {latestItems.map((item) => (
                      <NewsLinkRow key={item.id} item={item} locale={locale} />
                    ))}
                  </div>
                </div>
              )}

              {recentItemsForDisplay.length > 0 && (
                <div>
                  <div className="mb-4">
                    <h3 className="text-2xl font-bold tracking-[-0.035em]">{copy.recent}</h3>
                    <p className="mt-2 text-sm leading-6 text-[#6c706b]">{copy.recentDescription}</p>
                  </div>
                  <div>
                    {recentItemsForDisplay.map((item) => (
                      <NewsLinkRow key={item.id} item={item} locale={locale} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      <section className="border-t border-[#171b25]/15 bg-[#f7f4f1] px-5 py-14 sm:px-8 sm:py-16">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-[#BA4811]">SIT News</p>
            <h2 className="mt-3 text-2xl font-bold tracking-[-0.035em] sm:text-3xl">{copy.next}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#686c67]">{copy.nextDescription}</p>
          </div>
          <Link href={newsPath} className="inline-flex min-h-12 shrink-0 items-center gap-4 bg-[#BA4811] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#96380d] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#BA4811]">
            {copy.breadcrumb}
            <HugeiconsIcon icon={ArrowUpRight01Icon} size={17} />
          </Link>
        </div>
      </section>
    </main>
  );
}
