import EducationLevelPageContent from "@/components/EducationLevelPageContent";
import { notFound } from "next/navigation";
import {
  buildEducationLevelMetadata,
  isValidLevelSegment,
} from "@/lib/program-seo";

type PageProps = {
  params: Promise<{ "education-level": string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { "education-level": level } = await params;
  return buildEducationLevelMetadata("en", level);
}

export default async function EducationLevelPage({ params }: PageProps) {
  const { "education-level": level } = await params;
  if (!isValidLevelSegment("en", level)) notFound();
  return <EducationLevelPageContent locale="en" />;
}
