import StudentPortfolioListPageServer from "@/components/StudentPortfolioListPageServer";
import { buildPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = buildPageMetadata({
  locale: "vi",
  title: "Portfolio Sinh viên | SIT - Đại học Tân Tạo",
  description:
    "Khám phá portfolio cá nhân của những sinh viên Khoa Công nghệ Thông tin đã chủ động giới thiệu dự án, kỹ năng và hành trình học tập của mình.",
  path: "/vi/sinh-vien/portfolio",
  alternatePath: "/en/students/portfolio",
  socialLabel: "PORTFOLIO SINH VIÊN",
});

export default function StudentPortfolioListPage() {
  return <StudentPortfolioListPageServer locale="vi" />;
}
