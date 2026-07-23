import StudentHandbookPageServer from "@/components/StudentHandbookPageServer";
import { buildPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

const title = "Sổ tay sinh viên Khoa Công nghệ Thông tin | SIT";
const description =
  "Hướng dẫn học tập, dự án, nghiên cứu, hỗ trợ và các đường dẫn cần thiết dành cho sinh viên Khoa Công nghệ Thông tin, Đại học Tân Tạo.";

export const metadata = buildPageMetadata({
  locale: "vi",
  title,
  description,
  path: "/vi/sinh-vien/so-tay",
  alternatePath: "/en/students/handbook",
  image: "/assets/ttu/students-library-reading.jpg",
});

export default function StudentHandbookPage() {
  return <StudentHandbookPageServer locale="vi" />;
}
