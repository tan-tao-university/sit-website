import AlumniPageServer from "@/components/AlumniPageServer";
import { api } from "@/lib/api";
import { buildPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

const title = "SIT Alumni | Tan Tao University";
const description =
  "Explore the profiles, career journeys and milestones of alumni from the School of Information Technology at Tan Tao University.";

export async function generateMetadata() {
  const alumni = await api.alumni.findAll().catch(() => []);
  const featured =
    alumni.find((item) =>
      item.sectionMembers?.some((member) => member.isFeatured),
    ) || alumni.find((item) => item.avatarUrl);

  return buildPageMetadata({
    locale: "en",
    title,
    description,
    path: "/en/students/alumni",
    alternatePath: "/vi/sinh-vien/cuu-sinh-vien",
    image: featured?.avatarUrl,
  });
}

export default function AlumniPage() {
  return <AlumniPageServer locale="en" />;
}
