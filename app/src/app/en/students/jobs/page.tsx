import StudentCareersPageContent from "@/components/StudentCareersPageContent";
import { api } from "@/lib/api";
import { buildPageMetadata } from "@/lib/seo";

const title = "Jobs and Internships for SIT Students | Tan Tao University";
const description =
  "Career preparation, internship opportunities and employer connections for students of the School of Information Technology at Tan Tao University.";

export const metadata = buildPageMetadata({
  locale: "en",
  title,
  description,
  path: "/en/students/jobs",
  alternatePath: "/vi/sinh-vien/viec-lam",
  image: "/assets/ttu/programs-academic-partnership.jpg",
});

export default async function StudentJobsPage() {
  const opportunities = await api.careerOpportunities.findAll().catch(() => []);
  return (
    <StudentCareersPageContent locale="en" opportunities={opportunities} />
  );
}
