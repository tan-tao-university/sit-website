import type { Metadata } from "next";

export const SITE_URL = "https://sit.ttu.edu.vn";
export const DEFAULT_CONTENT_IMAGE = "/assets/banner-KT2.png";

export type SeoLocale = "vi" | "en";

const openGraphLocale = (locale: SeoLocale) =>
  locale === "vi" ? "vi_VN" : "en_US";

export const siteName = (locale: SeoLocale) =>
  locale === "vi"
    ? "Khoa Công nghệ Thông tin - Đại học Tân Tạo"
    : "School of Information Technology - Tan Tao University";

export const absoluteUrl = (path: string) =>
  path.startsWith("http://") || path.startsWith("https://")
    ? path
    : `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;

export const truncateText = (value: string, maxLength: number) => {
  const text = value.replace(/\s+/g, " ").trim();
  if (text.length <= maxLength) return text;

  const shortened = text.slice(0, maxLength - 1);
  const lastSpace = shortened.lastIndexOf(" ");
  return `${shortened.slice(0, lastSpace > maxLength / 2 ? lastSpace : undefined).trim()}…`;
};

export const localizedAlternates = (viPath: string, enPath: string) => ({
  "vi-VN": absoluteUrl(viPath),
  "en-US": absoluteUrl(enPath),
  "x-default": absoluteUrl(viPath),
});

type PageMetadataOptions = {
  locale: SeoLocale;
  title: string;
  description: string;
  path: string;
  alternatePath?: string;
  image?: string;
};

export function buildPageMetadata({
  locale,
  title,
  description,
  path,
  alternatePath,
  image = DEFAULT_CONTENT_IMAGE,
}: PageMetadataOptions): Metadata {
  const metaDescription = truncateText(description, 160);
  const socialDescription = truncateText(metaDescription, 125);
  const imageUrl = absoluteUrl(image);
  const languages = alternatePath
    ? localizedAlternates(
        locale === "vi" ? path : alternatePath,
        locale === "en" ? path : alternatePath,
      )
    : undefined;

  return {
    title,
    description: metaDescription,
    alternates: {
      canonical: absoluteUrl(path),
      languages,
    },
    openGraph: {
      type: "website",
      locale: openGraphLocale(locale),
      alternateLocale: alternatePath
        ? [openGraphLocale(locale === "vi" ? "en" : "vi")]
        : undefined,
      url: absoluteUrl(path),
      siteName: siteName(locale),
      title,
      description: socialDescription,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: socialDescription,
      images: [imageUrl],
    },
  };
}

export const jsonLd = (value: unknown) => ({
  __html: JSON.stringify(value).replace(/</g, "\\u003c"),
});
