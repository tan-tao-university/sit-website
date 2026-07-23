import StudentActivitiesPageServer from "@/components/StudentActivitiesPageServer";
import { buildPageMetadata } from "@/lib/seo";

const title = "SIT Student Activities | Tan Tao University";
const description =
  "Explore workshops, competitions, community activities and upcoming events for students of the School of Information Technology at Tan Tao University.";

export const metadata = buildPageMetadata({
  locale: "en",
  title,
  description,
  path: "/en/students/activities",
  alternatePath: "/vi/sinh-vien/hoat-dong",
  image: "/assets/meeting.png",
});

export default function StudentActivitiesPage() {
  return <StudentActivitiesPageServer locale="en" />;
}
