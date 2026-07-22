import NewsPageContent from "@/components/NewsPageContent";
import {
  api,
  type Achievement,
  type Event,
  type News,
  type Research,
} from "@/lib/api";

const seoCopy = {
  vi: {
    name: "Tin tức & Sự kiện - Khoa Công nghệ Thông tin",
    description:
      "Tin tức, hoạt động học thuật, nghiên cứu, thành tích sinh viên và sự kiện chính thức của Khoa Công nghệ Thông tin, Đại học Tân Tạo.",
    home: "Trang chủ",
    news: "Tin tức & Sự kiện",
    path: "/vi/tin-tuc",
  },
  en: {
    name: "News & Events - School of Information Technology",
    description:
      "Official news, academic activities, research, student achievements and events from the School of Information Technology at Tan Tao University.",
    home: "Home",
    news: "News & Events",
    path: "/en/news",
  },
} as const;

export default async function NewsPageServer({
  locale,
}: {
  locale: "vi" | "en";
}) {
  let initialItems: News[] | undefined;
  let initialEvents: Event[] | undefined;
  let initialResearch: Research[] | undefined;
  let initialAchievements: Achievement[] | undefined;

  const [newsResult, eventsResult, researchResult, achievementsResult] =
    await Promise.allSettled([
      api.news.findAll(),
      api.events.findUpcoming(12),
      api.research.findAll(),
      api.achievements.findAll({ visibility: "PUBLIC" }),
    ]);

  if (newsResult.status === "fulfilled") {
    initialItems = newsResult.value;
  } else {
    console.error("Failed to pre-render news listing", newsResult.reason);
  }

  if (eventsResult.status === "fulfilled") {
    initialEvents = eventsResult.value;
  } else {
    console.error("Failed to pre-render upcoming events", eventsResult.reason);
  }

  if (researchResult.status === "fulfilled") {
    initialResearch = researchResult.value;
  } else {
    console.error(
      "Failed to pre-render research highlights",
      researchResult.reason,
    );
  }

  if (achievementsResult.status === "fulfilled") {
    initialAchievements = achievementsResult.value;
  } else {
    console.error(
      "Failed to pre-render achievement highlights",
      achievementsResult.reason,
    );
  }

  const copy = seoCopy[locale];
  const baseUrl = "https://sit.ttu.edu.vn";
  const publishedNews = (initialItems ?? [])
    .filter((item) => item.status === "published")
    .sort(
      (a, b) =>
        new Date(b.publishedAt || 0).getTime() -
        new Date(a.publishedAt || 0).getTime(),
    );
  const itemList = publishedNews.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    url: `${baseUrl}${copy.path}/${item.slug}`,
    name: item.title,
  }));
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: copy.name,
    description: copy.description,
    url: `${baseUrl}${copy.path}`,
    inLanguage: locale === "vi" ? "vi-VN" : "en-US",
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: copy.home,
          item: `${baseUrl}/${locale}`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: copy.news,
          item: `${baseUrl}${copy.path}`,
        },
      ],
    },
    ...(itemList.length > 0
      ? {
          mainEntity: {
            "@type": "ItemList",
            itemListElement: itemList,
          },
        }
      : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(collectionSchema).replace(/</g, "\\u003c"),
        }}
      />
      <NewsPageContent
        locale={locale}
        initialItems={initialItems}
        initialEvents={initialEvents}
        initialResearch={initialResearch}
        initialAchievements={initialAchievements}
      />
    </>
  );
}
