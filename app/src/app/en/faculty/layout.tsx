import { api } from "@/lib/api";
import { buildPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const faculty = await api.faculty.findAll().catch(() => []);
  const featuredSummary = faculty.find(
    (item) => item.isActive !== false && item.avatarUrl,
  );
  const featured = featuredSummary
    ? await api.faculty
        .findBySlug(featuredSummary.slug)
        .catch(() => featuredSummary)
    : undefined;

  return buildPageMetadata({
    locale: "en",
    title: "Information Technology Faculty | SIT - Tan Tao University",
    description:
      "Meet the faculty and researchers of the School of Information Technology at Tan Tao University and explore their academic expertise.",
    path: "/en/faculty",
    image: featured?.avatarUrl,
  });
}

export default function FacultyLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
