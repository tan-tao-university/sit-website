import AchievementsPageContent from "@/components/AchievementsPageContent";
import { api, type Achievement } from "@/lib/api";
import type { SiteLocale } from "@/lib/program-pages";
import { absoluteUrl, jsonLd } from "@/lib/seo";

export default async function AchievementsPageServer({
  locale,
}: {
  locale: SiteLocale;
}) {
  let items: Achievement[] = [];

  try {
    items = await api.achievements.findAll({ visibility: "PUBLIC" });
  } catch (error) {
    console.error("Failed to pre-render achievements", error);
  }

  const path = locale === "vi" ? "/vi/thanh-tich" : "/en/achievements";
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name:
      locale === "vi"
        ? "Thành tích sinh viên và giảng viên SIT"
        : "SIT Student and Faculty Achievements",
    url: absoluteUrl(path),
    inLanguage: locale === "vi" ? "vi-VN" : "en-US",
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: items.length,
      itemListElement: items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Thing",
          name: item.title,
          ...(item.description ? { description: item.description } : {}),
          ...(item.coverImage ? { image: item.coverImage } : {}),
        },
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(collectionSchema)}
      />
      <AchievementsPageContent locale={locale} items={items} />
    </>
  );
}
