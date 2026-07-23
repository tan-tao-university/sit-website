import ResearchPageContent from "@/components/ResearchPageContent";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  locale: "en",
  title: "Information Technology Research | SIT - Tan Tao University",
  description:
    "Explore research areas, scientific projects and international publications from the School of Information Technology at Tan Tao University.",
  path: "/en/research",
  alternatePath: "/vi/nghien-cuu",
  image: "/assets/ttu/programs-technology-learning.jpg",
});

export default function ResearchPage() {
  return <ResearchPageContent locale="en" />;
}
