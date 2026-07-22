import { jsonLd, SITE_URL } from "@/lib/seo";

const siteIdentitySchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: `${SITE_URL}/`,
      name: "SIT - Đại học Tân Tạo",
      alternateName: [
        "SIT",
        "Khoa Công nghệ Thông tin - Đại học Tân Tạo",
        "sit.ttu.edu.vn",
      ],
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
    {
      "@type": "CollegeOrUniversity",
      "@id": `${SITE_URL}/#organization`,
      name: "Khoa Công nghệ Thông tin - Đại học Tân Tạo",
      alternateName: "School of Information Technology - Tan Tao University",
      url: `${SITE_URL}/`,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/assets/logo-sit.png`,
        contentUrl: `${SITE_URL}/assets/logo-sit.png`,
        width: 1875,
        height: 1875,
      },
      email: "sit@ttu.edu.vn",
      telephone: "+84-272-376-9216",
      parentOrganization: {
        "@type": "CollegeOrUniversity",
        name: "Đại học Tân Tạo",
        alternateName: "Tan Tao University",
        url: "https://ttu.edu.vn/",
      },
      address: {
        "@type": "PostalAddress",
        streetAddress: "Đại lộ Đại học Tân Tạo, Tân Đức E.City",
        addressLocality: "Đức Hòa",
        addressRegion: "Tây Ninh",
        addressCountry: "VN",
      },
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+84-272-376-9216",
        email: "sit@ttu.edu.vn",
        contactType: "admissions",
        availableLanguage: ["Vietnamese", "English"],
      },
      sameAs: ["https://www.facebook.com/sit.ttu.edu.vn"],
    },
  ],
};

export default function SiteIdentityJsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={jsonLd(siteIdentitySchema)}
    />
  );
}
