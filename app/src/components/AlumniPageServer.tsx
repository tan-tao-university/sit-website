import AlumniPageContent from "@/components/AlumniPageContent";
import { api, type Alumni, type AlumniSection } from "@/lib/api";
import type { SiteLocale } from "@/lib/program-pages";
import { absoluteUrl, jsonLd } from "@/lib/seo";

export default async function AlumniPageServer({
  locale,
}: {
  locale: SiteLocale;
}) {
  let alumni: Alumni[] = [];
  let sections: AlumniSection[] = [];

  const [alumniResult, sectionsResult] = await Promise.allSettled([
    api.alumni.findAll(),
    api.alumniSections.findAll(),
  ]);

  if (alumniResult.status === "fulfilled") {
    alumni = alumniResult.value.filter(
      (item) => !item.meta?.visibility || item.meta.visibility === "public",
    );
  } else {
    console.error("Failed to pre-render alumni", alumniResult.reason);
  }

  if (sectionsResult.status === "fulfilled") {
    sections = sectionsResult.value
      .filter((section) => section.isActive !== false)
      .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  } else {
    console.error("Failed to pre-render alumni sections", sectionsResult.reason);
  }

  const path =
    locale === "vi"
      ? "/vi/sinh-vien/cuu-sinh-vien"
      : "/en/students/alumni";
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name:
      locale === "vi"
        ? "Mạng lưới cựu sinh viên SIT"
        : "SIT Alumni Network",
    url: absoluteUrl(path),
    inLanguage: locale === "vi" ? "vi-VN" : "en-US",
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: alumni.length,
      itemListElement: alumni.map((alumnus, index) => {
        const currentCareer = [...(alumnus.careers || [])].sort((a, b) => {
          if (a.endYear == null && b.endYear != null) return -1;
          if (a.endYear != null && b.endYear == null) return 1;
          return (b.startYear || 0) - (a.startYear || 0);
        })[0];

        return {
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "Person",
            name: alumnus.fullName,
            ...(alumnus.shortBio ? { description: alumnus.shortBio } : {}),
            ...(alumnus.avatarUrl ? { image: alumnus.avatarUrl } : {}),
            ...(currentCareer?.role ? { jobTitle: currentCareer.role } : {}),
            ...(currentCareer?.organization
              ? {
                  worksFor: {
                    "@type": "Organization",
                    name: currentCareer.organization,
                  },
                }
              : {}),
            alumniOf: {
              "@type": "CollegeOrUniversity",
              name: "Đại học Tân Tạo",
              url: "https://ttu.edu.vn",
            },
          },
        };
      }),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(collectionSchema)}
      />
      <AlumniPageContent
        locale={locale}
        alumni={alumni}
        sections={sections}
      />
    </>
  );
}
