"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CalendarDays, Pencil } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { YooptaRenderer } from "@/components/ui/yoopta-renderer";
import { FormLoading } from "@/components/shared/LoadingStates";
import { useToast } from "@/hooks/use-toast";
import { api, type News } from "@/lib/api";

const categoryLabels: Record<string, string> = {
  general: "Tin tức chung",
  workshop: "Hội thảo",
  achievements: "Thành tích",
  academic: "Học vụ",
  business: "Hợp tác doanh nghiệp",
  events: "Sự kiện",
};

const statusLabels: Record<string, string> = {
  draft: "Bản nháp",
  published: "Công khai",
  archived: "Lưu trữ",
};

export default function ViewNewsPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [news, setNews] = useState<News | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadNews() {
      try {
        const data = await api.news.findOne(params.id as string);
        setNews(data);
      } catch (error) {
        console.error(error);
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: "Không thể tải tin tức",
        });
        router.push("/news");
      } finally {
        setIsLoading(false);
      }
    }
    loadNews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  if (isLoading) {
    return <FormLoading fieldCount={6} />;
  }

  if (!news) return null;

  return (
    <div className="mx-auto w-full max-w-4xl space-y-5 p-8 pt-6 dashboard-reveal">
      <div className="flex items-center justify-between gap-4">
        <Button
          type="button"
          variant="outline"
          className="cursor-pointer"
          onClick={() => router.push("/news")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại
        </Button>
        <Button
          type="button"
          className="cursor-pointer"
          onClick={() => router.push(`/news/${news.id}`)}
        >
          <Pencil className="mr-2 h-4 w-4" />
          Chỉnh sửa
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#e8e2dc] bg-white">
        {news.coverImage && (
          <div className="aspect-[21/9] w-full overflow-hidden bg-[#fdfbf9]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={news.coverImage}
              alt={news.title}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        <div className="space-y-4 p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant={news.status === "published" ? "default" : "secondary"}
            >
              {statusLabels[news.status ?? "draft"] ?? news.status}
            </Badge>
            {news.category && (
              <Badge variant="outline">{categoryLabels[news.category]}</Badge>
            )}
          </div>

          <h1 className="text-2xl font-semibold tracking-[-0.02em] text-stone-950 sm:text-3xl">
            {news.title}
          </h1>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            {news.publishedAt
              ? format(new Date(news.publishedAt), "dd/MM/yyyy HH:mm")
              : "Chưa đăng"}
          </div>

          {news.summary && (
            <p className="text-base leading-relaxed text-stone-600">
              {news.summary}
            </p>
          )}

          <div className="border-t border-[#eee9e4] pt-6">
            <YooptaRenderer value={news.content} />
          </div>
        </div>
      </div>
    </div>
  );
}
