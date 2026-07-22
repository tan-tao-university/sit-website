import ProgramsPageContent from "@/components/ProgramsPageContent";
import { api } from "@/lib/api";
import { programImage } from "@/lib/program-pages";
import { buildPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const programs = await api.programs
    .findAll({ status: "active" })
    .catch(() => []);

  return buildPageMetadata({
    locale: "vi",
    title: "Chương trình đào tạo Công nghệ Thông tin | SIT",
    description:
      "Khám phá các chương trình đại học và sau đại học về Công nghệ Thông tin, Khoa học Máy tính, Khoa học Dữ liệu và AI tại Đại học Tân Tạo.",
    path: "/vi/chuong-trinh-dao-tao",
    alternatePath: "/en/programs",
    image: programs[0] ? programImage(programs[0]) : undefined,
  });
}

export default function ProgramsPage() {
  return <ProgramsPageContent locale="vi" />;
}
