import ProgramDetailPageContent from "@/components/ProgramDetailPageContent";
import {
  buildProgramMetadata,
  buildProgramStructuredData,
} from "@/lib/program-seo";
import { jsonLd } from "@/lib/seo";

type PageProps = { params: Promise<{ program: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { program } = await params;
  return buildProgramMetadata("vi", program);
}

export default async function ProgramDetailPage({ params }: PageProps) {
  const { program } = await params;
  const schema = await buildProgramStructuredData("vi", program);

  return (
    <>
      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={jsonLd(schema)}
        />
      )}
      <ProgramDetailPageContent locale="vi" />
    </>
  );
}
