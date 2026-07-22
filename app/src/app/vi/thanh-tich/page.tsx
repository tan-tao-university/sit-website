import AchievementsPageServer from "@/components/AchievementsPageServer";
import { api } from "@/lib/api";
import { buildPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

const title = "Thành tích sinh viên và giảng viên | SIT - Đại học Tân Tạo";
const description =
  "Khám phá thành tích học thuật, nghiên cứu, học bổng và các cuộc thi của sinh viên, giảng viên Khoa Công nghệ Thông tin, Đại học Tân Tạo.";

export async function generateMetadata() {
  const items = await api.achievements
    .findAll({ visibility: "PUBLIC" })
    .catch(() => []);
  const featured =
    items.find((item) => item.isHighlight && item.coverImage) ||
    items.find((item) => item.coverImage);

  return buildPageMetadata({
    locale: "vi",
    title,
    description,
    path: "/vi/thanh-tich",
    alternatePath: "/en/achievements",
    image: featured?.coverImage,
  });
}

export default function AchievementsPage() {
  return <AchievementsPageServer locale="vi" />;
}
