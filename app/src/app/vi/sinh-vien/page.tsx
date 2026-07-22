import StudentsPageContent from "@/components/StudentsPageContent";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  locale: "vi",
  title: "Đời sống sinh viên Công nghệ Thông tin | SIT",
  description:
    "Thông tin học tập, hoạt động, sổ tay, thực tập, việc làm và mạng lưới cựu sinh viên Khoa Công nghệ Thông tin, Đại học Tân Tạo.",
  path: "/vi/sinh-vien",
  alternatePath: "/en/students",
});

export default function StudentsPage() {
  return <StudentsPageContent locale="vi" />;
}
