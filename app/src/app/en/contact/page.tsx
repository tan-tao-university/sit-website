import ContactPageContent from "@/components/ContactPageContent";
import { buildPageMetadata } from "@/lib/seo";

const title = "Contact the School of Information Technology - Tan Tao University";
const description =
  "Contact details, office hours, and support channels for the School of Information Technology at Tan Tao University, for students and applicants.";

export const metadata = buildPageMetadata({
  locale: "en",
  title,
  description,
  path: "/en/contact",
  alternatePath: "/vi/lien-he",
  image: "/assets/banner-ttu.png",
});

export default function ContactPage() {
  return <ContactPageContent />;
}
