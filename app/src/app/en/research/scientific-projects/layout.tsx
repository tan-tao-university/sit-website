import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  locale: "en",
  title: "Information Technology Research Projects | SIT",
  description:
    "Explore ongoing and completed scientific research projects from the School of Information Technology at Tan Tao University.",
  path: "/en/research/scientific-projects",
  alternatePath: "/vi/nghien-cuu/de-tai-khoa-hoc",
  image: "/assets/ttu/programs-technology-learning.jpg",
});

export default function ScientificProjectsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
