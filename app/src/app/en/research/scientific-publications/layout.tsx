import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  locale: "en",
  title: "Scientific Publications in Information Technology | SIT",
  description:
    "Browse journal articles, conference papers and research publications from the School of Information Technology at Tan Tao University.",
  path: "/en/research/scientific-publications",
  alternatePath: "/vi/nghien-cuu/bai-bao-khoa-hoc",
  image: "/assets/ttu/programs-technology-learning.jpg",
});

export default function ScientificPublicationsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
