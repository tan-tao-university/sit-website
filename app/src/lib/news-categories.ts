export const NEWS_CATEGORIES = {
  workshop: {
    id: "workshop",
    nameVi: "Hội thảo",
    nameEn: "Workshop",
  },
  achievements: {
    id: "achievements",
    nameVi: "Thành tích",
    nameEn: "Achievements",
  },
  academic: {
    id: "academic",
    nameVi: "Học vụ",
    nameEn: "Academic",
  },
  business: {
    id: "business",
    nameVi: "Hợp tác doanh nghiệp",
    nameEn: "Business Cooperation",
  },
  events: {
    id: "events",
    nameVi: "Sự kiện",
    nameEn: "Events",
  },
  general: {
    id: "general",
    nameVi: "Tin tức chung",
    nameEn: "General News",
  },
} as const;

export type NewsCategoryId = keyof typeof NEWS_CATEGORIES;

export function getCategoryDisplay(
  categoryId: string,
  locale: "vi" | "en" = "vi"
): string {
  const category = NEWS_CATEGORIES[categoryId as NewsCategoryId];
  if (!category) {
    return categoryId;
  }
  return locale === "vi" ? category.nameVi : category.nameEn;
}
