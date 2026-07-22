import CurriculumDetailPageContent from "@/components/CurriculumDetailPageContent";
import {
  buildCurriculumMetadata,
  buildCurriculumStructuredData,
} from "@/lib/program-seo";
import { jsonLd } from "@/lib/seo";

type PageProps = {
  params: Promise<{ program: string; slug: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { program, slug } = await params;
  return buildCurriculumMetadata("en", program, slug);
}

export default async function CurriculumDetailPage({ params }: PageProps) {
  const { program, slug } = await params;
  const schema = await buildCurriculumStructuredData("en", program, slug);

  return (
    <>
      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={jsonLd(schema)}
        />
      )}
      <CurriculumDetailPageContent locale="en" />
    </>
  );
}
