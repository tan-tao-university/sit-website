"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WizardPageHeader } from "@/components/wizard/wizard-page-header";
import { EditPageCard } from "@/components/wizard/edit-page-card";
import { ImageUploadOverlay } from "@/components/ui/image-upload-overlay";
import { useToast } from "@/hooks/use-toast";
import { useImageUpload } from "@/hooks/use-image-upload";
import { FormLoading } from "@/components/shared/LoadingStates";
import { api } from "@/lib/api";
import { slugify } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { YooptaEditorComponent } from "@/components/ui/yoopta-editor";

const formSchema = z.object({
  title: z.string().min(1, "Tiêu đề là bắt buộc").max(255),
  slug: z.string().min(1, "Slug là bắt buộc").max(255),
  summary: z.string().optional(),
  coverImage: z.string().url("Phải là URL hợp lệ").optional().or(z.literal("")),
  category: z
    .enum([
      "workshop",
      "achievements",
      "academic",
      "business",
      "events",
      "general",
    ])
    .default("general"),
  status: z.enum(["draft", "published", "archived"]),
  publishedAt: z.string().optional(),
  content: z.record(z.any()), // Yoopta content
});

type FormData = z.infer<typeof formSchema>;

const toLocalDateTime = (value: string) => {
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

export default function EditNewsPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const form = useForm<FormData>({
    defaultValues: {
      title: "",
      slug: "",
      summary: "",
      category: "general" as const,
      status: "draft" as const,
      publishedAt: "",
      content: {},
    },
  });

  const coverImageUpload = useImageUpload({
    folder: "news-covers",
    onUploaded: (url) => form.setValue("coverImage", url),
  });

  // Fetch news data on mount
  useEffect(() => {
    const fetchNews = async () => {
      try {
        setIsFetching(true);
        const newsId = params.id as string;
        const news = await api.news.findOne(newsId);

        form.reset({
          title: news.title,
          slug: news.slug,
          summary: news.summary || "",
          category: news.category || "general",
          status: news.status || "draft",
          publishedAt: news.publishedAt
            ? toLocalDateTime(news.publishedAt)
            : "",
          content: news.content || {},
          coverImage: news.coverImage || "",
        });

        if (news.coverImage) {
          coverImageUpload.setPreview(news.coverImage);
        }
      } catch (error) {
        console.error(error);
        toast({
          variant: "destructive",
          title: "Lỗi",
          description:
            error instanceof Error ? error.message : "Không thể tải tin tức",
        });
        router.push("/news");
      } finally {
        setIsFetching(false);
      }
    };

    fetchNews();
  }, [params.id, form, toast, router]);

  async function onSubmit(values: FormData) {
    const { id: toastId, update } = toast({
      title: "Đang cập nhật...",
      description: "Vui lòng chờ trong giây lát.",
      duration: Infinity,
    });

    try {
      setIsLoading(true);

      // Manually validate with Zod
      const result = formSchema.safeParse(values);

      if (!result.success) {
        // Handle validation errors
        const errors = result.error.flatten().fieldErrors;
        Object.entries(errors).forEach(([field, messages]) => {
          if (messages && messages.length > 0) {
            form.setError(field as keyof FormData, {
              type: "manual",
              message: messages[0],
            });
          }
        });
        setIsLoading(false);
        update({
          id: toastId,
          title: "Lỗi",
          description: "Vui lòng kiểm tra lại thông tin.",
          variant: "destructive",
          duration: 3000,
        });
        return;
      }

      const newsId = params.id as string;
      await api.news.update(newsId, {
        ...result.data,
        publishedAt: result.data.publishedAt
          ? new Date(result.data.publishedAt).toISOString()
          : undefined,
      });

      update({
        id: toastId,
        title: "Thành công",
        description: "Tin tức đã được cập nhật thành công.",
        variant: "default",
        duration: 3000,
      });

      router.push("/news");
    } catch (error) {
      console.error(error);
      update({
        id: toastId,
        title: "Lỗi",
        description:
          error instanceof Error ? error.message : "Không thể cập nhật tin tức",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (isFetching) {
    return <FormLoading fieldCount={7} />;
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5 p-8 pt-6 dashboard-reveal">
      <WizardPageHeader
        eyebrow="Tin tức"
        title="Chỉnh sửa Tin tức"
        description="Cập nhật thông tin bài viết."
        onCancel={() => router.push("/news")}
      />

      <EditPageCard>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Tiêu đề</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nhập tiêu đề tin tức..."
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            // Auto generate slug
                            const slug = slugify(e.target.value);
                            form.setValue("slug", slug);
                          }}
                          className="shadow-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trạng thái</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="shadow-none">
                            <SelectValue placeholder="Chọn trạng thái" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="draft">Bản nháp</SelectItem>
                          <SelectItem value="published">Công khai</SelectItem>
                          <SelectItem value="archived">Lưu trữ</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Danh mục</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="shadow-none">
                            <SelectValue placeholder="Chọn danh mục" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="general">Tin tức chung</SelectItem>
                          <SelectItem value="workshop">Hội thảo</SelectItem>
                          <SelectItem value="achievements">
                            Thành tích
                          </SelectItem>
                          <SelectItem value="academic">Học vụ</SelectItem>
                          <SelectItem value="business">
                            Hợp tác doanh nghiệp
                          </SelectItem>
                          <SelectItem value="events">Sự kiện</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="publishedAt"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Ngày đăng</FormLabel>
                      <FormControl>
                        <Input
                          type="datetime-local"
                          {...field}
                          className="max-w-sm shadow-none"
                        />
                      </FormControl>
                      <FormDescription>
                        Có thể chọn lại ngày cũ để đăng lại bài viết theo đúng
                        thời điểm mong muốn.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="summary"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Tóm tắt</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Nhập tóm tắt..."
                          className="shadow-none min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Yoopta Editor for Main Content */}
                <div className="md:col-span-2 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Nội dung bài viết</h3>
                  </div>
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="border rounded-md p-4 bg-white min-h-[500px]">
                            <YooptaEditorComponent
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="coverImage"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Ảnh bìa</FormLabel>
                      <FormControl>
                        <div className="space-y-4">
                          <Input
                            type="file"
                            accept="image/*"
                            className="shadow-none cursor-pointer"
                            disabled={coverImageUpload.isUploading}
                            onChange={coverImageUpload.handleFileChange}
                          />
                          {coverImageUpload.preview && (
                            <div className="relative mt-2 aspect-video w-full max-w-md overflow-hidden rounded-lg border">
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute right-2 top-2 z-10"
                                disabled={coverImageUpload.isUploading}
                                onClick={() => {
                                  coverImageUpload.reset();
                                  field.onChange("");
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                              <img
                                src={coverImageUpload.preview}
                                alt="Cover preview"
                                className="h-full w-full object-cover"
                              />
                              <ImageUploadOverlay show={coverImageUpload.isUploading} />
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  className="cursor-pointer"
                  onClick={() => router.push("/news")}
                  disabled={isLoading}
                >
                  Hủy
                </Button>
                <Button
                  className="cursor-pointer"
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Cập nhật Tin tức
                </Button>
              </div>
            </form>
          </Form>
      </EditPageCard>
    </div>
  );
}
