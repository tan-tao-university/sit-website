import type { Metadata } from "next";
import NewsDetailPageContent from "@/components/NewsDetailPageContent";
import { api, type News } from "@/lib/api";
import { getCategoryDisplay } from "@/lib/news-categories";
import { extractNewsText, getNewsImage } from "@/lib/news-content";
import type { SiteLocale } from "@/lib/program-pages";
import { absoluteUrl, localizedAlternates, truncateText } from "@/lib/seo";

const SITE_URL = "https://sit.ttu.edu.vn";
const PUBLISHER_NAME = "Khoa Công nghệ Thông tin - Đại học Tân Tạo";

const getNewsPath = (locale: SiteLocale) =>
  locale === "vi" ? "/vi/tin-tuc" : "/en/news";

const getDescription = (news: News) => {
  const text =
    news.summary?.trim() ||
    news.contentText?.trim() ||
    extractNewsText(news.content) ||
    news.title;
  return truncateText(text, 160);
};

export async function buildNewsDetailMetadata(
  locale: SiteLocale,
  slug: string,
): Promise<Metadata> {
  try {
    const news = await api.news.findOne(slug);
    const path = `${getNewsPath(locale)}/${news.slug}`;
    const description = getDescription(news);
    const image = getNewsImage(news) || "/assets/banner-KT2.png";
    const siteName = locale === "vi" ? PUBLISHER_NAME : "School of Information Technology - Tan Tao University";
    const socialDescription = truncateText(description, 125);
    const socialImage = absoluteUrl(image);

    return {
      title: `${truncateText(news.title, 54)} | SIT`,
      description,
      alternates: {
        canonical: path,
        languages: localizedAlternates(
          `/vi/tin-tuc/${news.slug}`,
          `/en/news/${news.slug}`,
        ),
      },
      openGraph: {
        type: "article",
        locale: locale === "vi" ? "vi_VN" : "en_US",
        url: path,
        siteName,
        title: news.title,
        description: socialDescription,
        publishedTime: news.publishedAt,
        modifiedTime: news.updatedAt,
        section: getCategoryDisplay(news.category || "general", locale),
        images: [
          {
            url: socialImage,
            width: 1200,
            height: 630,
            alt: news.title,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: news.title,
        description: socialDescription,
        images: [socialImage],
      },
    };
  } catch {
    return {
      title: locale === "vi" ? "Tin tức | SIT - Đại học Tân Tạo" : "News | SIT - Tan Tao University",
    };
  }
}

export default async function NewsDetailPageServer({
  locale,
  slug,
}: {
  locale: SiteLocale;
  slug: string;
}) {
  const [newsResult, listResult] = await Promise.allSettled([
    api.news.findOne(slug),
    api.news.findAll(),
  ]);
  const news = newsResult.status === "fulfilled" ? newsResult.value : undefined;
  const newsItems = listResult.status === "fulfilled" ? listResult.value : undefined;

  if (!news) {
    return <NewsDetailPageContent locale={locale} slug={slug} initialItems={newsItems} />;
  }

  const path = `${getNewsPath(locale)}/${news.slug}`;
  const articleText = news.contentText?.trim() || extractNewsText(news.content);
  const image = getNewsImage(news);
  const socialImage = absoluteUrl(image || "/assets/banner-KT2.png");
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: news.title,
    description: getDescription(news),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}${path}`,
    },
    url: `${SITE_URL}${path}`,
    inLanguage: locale === "vi" ? "vi-VN" : "en-US",
    articleSection: getCategoryDisplay(news.category || "general", locale),
    datePublished: news.publishedAt,
    dateModified: news.updatedAt,
    wordCount: articleText.split(/\s+/).filter(Boolean).length,
    image: [socialImage],
    isAccessibleForFree: true,
    author: {
      "@type": "Organization",
      name: locale === "vi" ? "Ban Truyền thông SIT" : "SIT Editorial Team",
      url: SITE_URL,
    },
    publisher: {
      "@type": "CollegeOrUniversity",
      name: PUBLISHER_NAME,
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/assets/logo-sit.png`,
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleSchema).replace(/</g, "\\u003c"),
        }}
      />
      <NewsDetailPageContent
        locale={locale}
        slug={slug}
        initialNews={news}
        initialItems={newsItems}
      />
    </>
  );
}
