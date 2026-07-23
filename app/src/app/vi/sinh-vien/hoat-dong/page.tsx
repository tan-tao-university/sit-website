import StudentActivitiesPageServer from "@/components/StudentActivitiesPageServer";
import { buildPageMetadata } from "@/lib/seo";

const title = "Hoạt động sinh viên SIT | Đại học Tân Tạo";
const description =
  "Khám phá workshop, cuộc thi, hoạt động cộng đồng và lịch sự kiện dành cho sinh viên Khoa Công nghệ Thông tin, Đại học Tân Tạo.";

export const metadata = buildPageMetadata({
  locale: "vi",
  title,
  description,
  path: "/vi/sinh-vien/hoat-dong",
  alternatePath: "/en/students/activities",
  image: "/assets/meeting.png",
});

export default function StudentActivitiesPage() {
  return <StudentActivitiesPageServer locale="vi" />;
}
