import StudentsPageContent from "@/components/StudentsPageContent";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  locale: "en",
  title: "Information Technology Student Life | SIT - Tan Tao University",
  description:
    "Study guidance, activities, internships, careers and alumni resources for students at Tan Tao University's School of Information Technology.",
  path: "/en/students",
  alternatePath: "/vi/sinh-vien",
  image: "/assets/ttu/students-campus-learning.jpg",
});

export default function StudentsPage() {
  return <StudentsPageContent locale="en" />;
}
