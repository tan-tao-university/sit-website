import AlumniPageServer from "@/components/AlumniPageServer";
import { api } from "@/lib/api";
import { buildPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

const title = "Cựu sinh viên SIT | Đại học Tân Tạo";
const description =
  "Khám phá hồ sơ, hành trình nghề nghiệp và những dấu ấn của cựu sinh viên Khoa Công nghệ Thông tin, Đại học Tân Tạo.";

export async function generateMetadata() {
  const alumni = await api.alumni.findAll().catch(() => []);
  const featured =
    alumni.find((item) =>
      item.sectionMembers?.some((member) => member.isFeatured),
    ) || alumni.find((item) => item.avatarUrl);

  return buildPageMetadata({
    locale: "vi",
    title,
    description,
    path: "/vi/sinh-vien/cuu-sinh-vien",
    alternatePath: "/en/students/alumni",
    image: featured?.avatarUrl,
  });
}

export default function AlumniPage() {
  return <AlumniPageServer locale="vi" />;
}
