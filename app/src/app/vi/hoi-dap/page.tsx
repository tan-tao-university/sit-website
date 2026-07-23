import FaqPageContent from "@/components/FaqPageContent";
import { buildPageMetadata } from "@/lib/seo";

const title = "Hỏi & Đáp - Khoa Công nghệ Thông tin - Đại học Tân Tạo";
const description =
  "Câu hỏi thường gặp về tuyển sinh, học phí, chương trình đào tạo và đời sống sinh viên tại Khoa Công nghệ Thông tin, Đại học Tân Tạo.";

export const metadata = buildPageMetadata({
  locale: "vi",
  title,
  description,
  path: "/vi/hoi-dap",
  alternatePath: "/en/faq",
  image: "/assets/meeting.png",
});

export default function FaqPage() {
  return <FaqPageContent />;
}
