import StudentPortfolioListPageServer from "@/components/StudentPortfolioListPageServer";
import { buildPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = buildPageMetadata({
  locale: "en",
  title: "Student Portfolios | SIT - Tan Tao University",
  description:
    "Explore the personal portfolio pages of School of Information Technology students who chose to showcase their projects, skills and learning journey.",
  path: "/en/students/portfolio",
  alternatePath: "/vi/sinh-vien/portfolio",
  socialLabel: "STUDENT PORTFOLIOS",
});

export default function StudentPortfolioListPage() {
  return <StudentPortfolioListPageServer locale="en" />;
}
