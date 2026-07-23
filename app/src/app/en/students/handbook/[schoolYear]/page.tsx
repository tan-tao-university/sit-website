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
    locale: "en",
    title: `Student Handbook ${schoolYear} | SIT - Tan Tao University`,
    description: `Official ${schoolYear} study, academic, project, research and student support handbook for the School of Information Technology at Tan Tao University.`,
    path: `/en/students/handbook/${schoolYear}`,
    alternatePath: `/vi/sinh-vien/so-tay/${schoolYear}`,
    image: "/assets/ttu/students-library-reading.jpg",
  });
}

export default async function StudentHandbookYearPage({
  params,
}: {
  params: Promise<{ schoolYear: string }>;
}) {
  const { schoolYear } = await params;
  return <StudentHandbookPageServer locale="en" schoolYear={schoolYear} />;
}
