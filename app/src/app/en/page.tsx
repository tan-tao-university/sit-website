import HomePageContent from "@/components/HomePageContent";
import { buildPageMetadata } from "@/lib/seo";

const title = "School of Information Technology - Tan Tao University";
const description =
  "The School of Information Technology — formerly the School of Engineering, founded in 2011 — offers Computer Science, Data Science, AI and Information Technology programs at Tan Tao University.";

export const metadata = buildPageMetadata({
  locale: "en",
  title,
  description,
  path: "/en",
  alternatePath: "/vi",
  image: "/assets/ttu/home-students-campus.jpg",
});

export default function HomePage() {
  return <HomePageContent revealOffset={50} />;
}
