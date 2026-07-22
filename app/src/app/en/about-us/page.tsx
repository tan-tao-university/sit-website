import AboutPageContent from "@/components/AboutPageContent";
import { buildPageMetadata } from "@/lib/seo";

const title = "School of Information Technology | Tan Tao University";
const description =
  "Learn about Tan Tao University's School of Information Technology, including its history since 2011, mission, 2030 vision, faculty and academic programs.";

export const metadata = buildPageMetadata({
  locale: "en",
  title,
  description,
  path: "/en/about-us",
  alternatePath: "/vi/gioi-thieu-chung",
  image: "/assets/ttu/about-tan-tao-campus.jpg",
});

const aboutPageSchema = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  name: title,
  description,
  url: "https://sit.ttu.edu.vn/en/about-us",
  inLanguage: "en-US",
  mainEntity: {
    "@type": "CollegeOrUniversity",
    name: "School of Information Technology - Tan Tao University",
    alternateName: "SIT - TTU",
    foundingDate: "2011-01-04",
    url: "https://sit.ttu.edu.vn/",
    parentOrganization: {
      "@type": "CollegeOrUniversity",
      name: "Tan Tao University",
      url: "https://ttu.edu.vn/",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+84-272-376-9216",
      email: "sit@ttu.edu.vn",
      contactType: "admissions and academic information",
    },
  },
};

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(aboutPageSchema).replace(/</g, "\\u003c"),
        }}
      />
      <AboutPageContent />
    </>
  );
}
