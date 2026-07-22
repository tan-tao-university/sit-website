import AchievementsPageServer from "@/components/AchievementsPageServer";
import { api } from "@/lib/api";
import { buildPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

const title = "Student and Faculty Achievements | SIT - Tan Tao University";
const description =
  "Explore academic, research, scholarship and competition achievements by students and faculty of the School of Information Technology at Tan Tao University.";

export async function generateMetadata() {
  const items = await api.achievements
    .findAll({ visibility: "PUBLIC" })
    .catch(() => []);
  const featured =
    items.find((item) => item.isHighlight && item.coverImage) ||
    items.find((item) => item.coverImage);

  return buildPageMetadata({
    locale: "en",
    title,
    description,
    path: "/en/achievements",
    alternatePath: "/vi/thanh-tich",
    image: featured?.coverImage,
  });
}

export default function AchievementsPage() {
  return <AchievementsPageServer locale="en" />;
}
