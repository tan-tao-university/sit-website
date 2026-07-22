import HomePageContent from "@/components/HomePageContent";
import SiteIdentityJsonLd from "@/components/SiteIdentityJsonLd";
import { buildPageMetadata } from "@/lib/seo";

const title = "Khoa Công nghệ Thông tin - Đại học Tân Tạo";
const description =
  "Khoa Công nghệ Thông tin — tiền thân là Khoa Kỹ thuật, thành lập năm 2011 — đào tạo Khoa học Máy tính, Khoa học Dữ liệu, Trí tuệ nhân tạo và Công nghệ thông tin tại Đại học Tân Tạo.";

export const metadata = buildPageMetadata({
  locale: "vi",
  title,
  description,
  path: "/vi",
  alternatePath: "/en",
  image: "/assets/ttu/home-students-campus.jpg",
});

export default function HomePage() {
  return (
    <>
      <SiteIdentityJsonLd />
      <HomePageContent revealOffset={40} />
    </>
  );
}
