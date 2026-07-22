import NewsDetailPageServer, {
  buildNewsDetailMetadata,
} from "@/components/NewsDetailPageServer";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  return buildNewsDetailMetadata("en", slug);
}

export default async function NewsDetailPage({ params }: PageProps) {
  const { slug } = await params;
  return <NewsDetailPageServer locale="en" slug={slug} />;
}
