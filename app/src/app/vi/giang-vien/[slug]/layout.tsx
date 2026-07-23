import type { Metadata } from "next";
import { cache } from "react";
import { api } from "@/lib/api";
import { absoluteUrl, buildPageMetadata, jsonLd, truncateText } from "@/lib/seo";

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
};

const getFaculty = cache((slug: string) => api.faculty.findBySlug(slug));

const facultyDescription = (faculty: Awaited<ReturnType<typeof getFaculty>>) => {
  if (faculty.bioShort?.trim()) return truncateText(faculty.bioShort, 160);

  const credential = faculty.academicTitle
    ? `${faculty.academicTitle.replace(/\.$/, "")}. `
    : "";
  const publications = faculty.publications?.filter((item) => item.title).length || 0;
  const role = faculty.position || "giảng viên";
  const workplace = /khoa/i.test(role)
    ? "Đại học Tân Tạo"
    : `${faculty.department || "Khoa Công nghệ Thông tin"}, Đại học Tân Tạo`;
  const publicationText = publications
    ? ` Xem hồ sơ đào tạo và ${publications} công bố khoa học.`
    : " Xem hồ sơ đào tạo, chuyên môn và hoạt động học thuật.";

  return truncateText(
    `${credential}${faculty.fullName}, ${role} tại ${workplace}.${publicationText}`,
    160,
  );
};

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const faculty = await getFaculty(slug);
    const credential = faculty.academicTitle
      ? `${faculty.academicTitle.replace(/\.$/, "")}. `
      : "";

    return buildPageMetadata({
      locale: "vi",
      title: `${credential}${faculty.fullName} | Giảng viên SIT - TTU`,
      description: facultyDescription(faculty),
      path: `/vi/giang-vien/${faculty.slug}`,
      image: faculty.avatarUrl,
    });
  } catch {
    return {
      title: "Không tìm thấy giảng viên",
      robots: { index: false, follow: false },
    };
  }
}

export default async function FacultyDetailLayout({
  children,
  params,
}: LayoutProps) {
  const { slug } = await params;
  const faculty = await getFaculty(slug).catch(() => undefined);
  if (!faculty) return children;

  const path = `/vi/giang-vien/${faculty.slug}`;
  const sameAs = (faculty.contacts || [])
    .filter(
      (contact) =>
        contact.visibility !== "internal" &&
        ["website", "scholar", "linkedin", "researchgate", "orcid"].includes(
          contact.type || "",
        ) &&
        /^https?:\/\//.test(contact.value || ""),
    )
    .map((contact) => contact.value as string);
  const alumniOf = (faculty.academicTimeline || [])
    .filter((item) => item.institution)
    .map((item) => ({
      "@type": "CollegeOrUniversity",
      name: item.institution,
    }));
  const knowsAbout = (faculty.researchAreas || [])
    .map((item) => item.title?.trim())
    .filter(Boolean);
  const profileSchema = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    name: `${faculty.fullName} - Giảng viên SIT`,
    url: absoluteUrl(path),
    dateCreated: faculty.createdAt,
    dateModified: faculty.meta?.lastUpdatedAt || faculty.updatedAt,
    mainEntity: {
      "@type": "Person",
      "@id": `${absoluteUrl(path)}#person`,
      name: faculty.fullName,
      description: facultyDescription(faculty),
      ...(faculty.academicTitle
        ? { honorificPrefix: faculty.academicTitle }
        : {}),
      ...(faculty.position ? { jobTitle: faculty.position } : {}),
      ...(faculty.avatarUrl ? { image: faculty.avatarUrl } : {}),
      ...(knowsAbout.length ? { knowsAbout } : {}),
      ...(alumniOf.length ? { alumniOf } : {}),
      ...(sameAs.length ? { sameAs } : {}),
      worksFor: {
        "@type": "CollegeOrUniversity",
        name: "Khoa Công nghệ Thông tin - Đại học Tân Tạo",
        url: "https://sit.ttu.edu.vn",
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(profileSchema)}
      />
      {children}
    </>
  );
}
