import StudentPortfolioListPageServer from "@/components/StudentPortfolioListPageServer";
import { api } from "@/lib/api";
import { buildPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const portfolios = await api.studentPortfolio.findAll().catch(() => []);
  const featured = portfolios.find((item) => item.avatarUrl);

  return buildPageMetadata({
    locale: "vi",
    title: "Portfolio Sinh viên | SIT - Đại học Tân Tạo",
    description:
      "Khám phá portfolio cá nhân của những sinh viên Khoa Công nghệ Thông tin đã chủ động giới thiệu dự án, kỹ năng và hành trình học tập của mình.",
    path: "/vi/sinh-vien/portfolio",
    alternatePath: "/en/students/portfolio",
    image: featured?.avatarUrl || "/assets/ttu/students-campus-learning.jpg",
  });
}

export default function StudentPortfolioListPage() {
  return <StudentPortfolioListPageServer locale="vi" />;
}
