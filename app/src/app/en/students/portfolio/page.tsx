import StudentPortfolioListPageServer from "@/components/StudentPortfolioListPageServer";
import { api } from "@/lib/api";
import { buildPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const portfolios = await api.studentPortfolio.findAll().catch(() => []);
  const featured = portfolios.find((item) => item.avatarUrl);

  return buildPageMetadata({
    locale: "en",
    title: "Student Portfolios | SIT - Tan Tao University",
    description:
      "Explore the personal portfolio pages of School of Information Technology students who chose to showcase their projects, skills and learning journey.",
    path: "/en/students/portfolio",
    alternatePath: "/vi/sinh-vien/portfolio",
    image: featured?.avatarUrl || "/assets/ttu/students-campus-learning.jpg",
  });
}

export default function StudentPortfolioListPage() {
  return <StudentPortfolioListPageServer locale="en" />;
}
