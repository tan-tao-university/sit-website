import NewsPageServer from "@/components/NewsPageServer";
import { api } from "@/lib/api";
import { getNewsImage } from "@/lib/news-content";
import { buildPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

const title = "Tin tức & Sự kiện Công nghệ Thông tin | SIT - Đại học Tân Tạo";
const description =
  "Cập nhật tin tức, hoạt động học thuật, nghiên cứu, thành tích sinh viên và sự kiện chính thức từ Khoa Công nghệ Thông tin, Đại học Tân Tạo.";

export async function generateMetadata() {
  const items = await api.news.findAll().catch(() => []);
  const latest = items
    .filter((item) => item.status === "published")
    .sort(
      (a, b) =>
        new Date(b.publishedAt || 0).getTime() -
        new Date(a.publishedAt || 0).getTime(),
    )
    .find((item) => getNewsImage(item));

  return buildPageMetadata({
    locale: "vi",
    title,
    description,
    path: "/vi/tin-tuc",
    alternatePath: "/en/news",
    image: latest ? getNewsImage(latest) : undefined,
  });
}

export default function NewsPage() {
  return <NewsPageServer locale="vi" />;
}
