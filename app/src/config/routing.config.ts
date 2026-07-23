export type Locale = "vi" | "en";

/**
 * Path mappings for language switching
 * Maps Vietnamese paths to English paths
 */
export const PATH_MAPPINGS: Record<string, string> = {
  // Vietnamese to English
  "/gioi-thieu-chung": "/about-us",
  "/chuong-trinh-dao-tao": "/programs",
  "/chuong-trinh-dao-tao/dai-hoc": "/programs/undergraduate",
  "/chuong-trinh-dao-tao/sau-dai-hoc": "/programs/postgraduate",
  "/nghien-cuu": "/research",
  "/nghien-cuu/de-tai-khoa-hoc": "/research/scientific-projects",
  "/nghien-cuu/bai-bao-khoa-hoc": "/research/scientific-publications",
  "/sinh-vien": "/students",
  "/sinh-vien/hoat-dong": "/students/activities",
  "/sinh-vien/viec-lam": "/students/jobs",
  "/sinh-vien/cuu-sinh-vien": "/students/alumni",
  "/tin-tuc": "/news",
  "/giang-vien": "/faculty",
  "/sinh-vien/portfolio": "/students/portfolio",

  // English to Vietnamese (reverse mapping)
  "/about-us": "/gioi-thieu-chung",
  "/programs": "/chuong-trinh-dao-tao",
  "/programs/undergraduate": "/chuong-trinh-dao-tao/dai-hoc",
  "/programs/postgraduate": "/chuong-trinh-dao-tao/sau-dai-hoc",
  "/research": "/nghien-cuu",
  "/research/scientific-projects": "/nghien-cuu/de-tai-khoa-hoc",
  "/research/scientific-publications": "/nghien-cuu/bai-bao-khoa-hoc",
  "/students": "/sinh-vien",
  "/students/activities": "/sinh-vien/hoat-dong",
  "/students/jobs": "/sinh-vien/viec-lam",
  "/students/alumni": "/sinh-vien/cuu-sinh-vien",
  "/news": "/tin-tuc",
  "/faculty": "/giang-vien",
  "/students/portfolio": "/sinh-vien/portfolio",
};

/**
 * Translate path from one locale to another
 * Used by language switcher
 */
export function translatePath(
  currentPath: string,
  fromLocale: Locale,
  toLocale: Locale,
): string {
  // Remove locale prefix
  const pathWithoutLocale = currentPath.startsWith(`/${fromLocale}`)
    ? currentPath.slice(fromLocale.length + 1)
    : currentPath;

  // If switching locales, translate the path
  if (fromLocale !== toLocale) {
    const translatedPath = PATH_MAPPINGS[pathWithoutLocale];
    if (translatedPath) {
      return `/${toLocale}${translatedPath}`;
    }
  }

  // If no translation found or same locale, return home
  return `/${toLocale}`;
}
