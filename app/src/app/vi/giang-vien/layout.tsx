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
    locale: "vi",
    title: "Đội ngũ giảng viên Công nghệ Thông tin | SIT",
    description:
      "Tìm hiểu học vị, chuyên môn, hướng nghiên cứu và công bố khoa học của đội ngũ giảng viên Khoa Công nghệ Thông tin, Đại học Tân Tạo.",
    path: "/vi/giang-vien",
    image: featured?.avatarUrl,
  });
}

export default function FacultyLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
