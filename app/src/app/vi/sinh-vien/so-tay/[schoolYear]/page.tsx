import type { Metadata } from "next";
import StudentHandbookPageServer from "@/components/StudentHandbookPageServer";
import { buildPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ schoolYear: string }>;
}): Promise<Metadata> {
  const { schoolYear } = await params;
  return buildPageMetadata({
    locale: "vi",
    title: `Sổ tay sinh viên ${schoolYear} | SIT - Đại học Tân Tạo`,
    description: `Sổ tay chính thức năm học ${schoolYear}: hướng dẫn học tập, học vụ, dự án, nghiên cứu và hỗ trợ sinh viên Khoa Công nghệ Thông tin, Đại học Tân Tạo.`,
    path: `/vi/sinh-vien/so-tay/${schoolYear}`,
    alternatePath: `/en/students/handbook/${schoolYear}`,
    image: "/assets/ttu/students-library-reading.jpg",
  });
}

export default async function StudentHandbookYearPage({
  params,
}: {
  params: Promise<{ schoolYear: string }>;
}) {
  const { schoolYear } = await params;
  return <StudentHandbookPageServer locale="vi" schoolYear={schoolYear} />;
}
