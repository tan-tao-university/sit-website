"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X } from "lucide-react";

import { useNewsWizardStore } from "@/store/news-wizard-store";
import { StepWizard } from "@/components/wizard/step-wizard";
import { WizardPageHeader } from "@/components/wizard/wizard-page-header";
import { ImageUploadOverlay } from "@/components/ui/image-upload-overlay";
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
import { useToast } from "@/hooks/use-toast";
import { useImageUpload } from "@/hooks/use-image-upload";
import { api } from "@/lib/api";
import { slugify } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { YooptaEditorComponent } from "@/components/ui/yoopta-editor";

const STEPS = [
  {
    id: 1,
    title: "Thông tin bài viết",
    description: "Tiêu đề, slug, trạng thái và danh mục.",
  },
  {
    id: 2,
    title: "Nội dung & Ảnh bìa",
    description: "Nội dung chi tiết và ảnh đại diện bài viết.",
  },
  {
    id: 3,
    title: "Xem lại & hoàn tất",
    description: "Kiểm tra lại toàn bộ thông tin trước khi tạo.",
  },
] as const;

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
  status: z.enum(["draft", "published", "archived"], {
    required_error: "Vui lòng chọn trạng thái",
  }),
  publishedAt: z.string().optional(),
  content: z.record(z.any()), // Yoopta content
});

type FormData = z.infer<typeof formSchema>;

const STEP_FIELDS: Record<number, (keyof FormData)[]> = {
  1: ["title", "slug", "status", "category", "publishedAt", "summary"],
  2: ["content", "coverImage"],
  3: [],
};

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

export default function CreateNewsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const currentStep = useNewsWizardStore((state) => state.currentStep);
  const setTotalSteps = useNewsWizardStore((state) => state.setTotalSteps);
  const storeGoNext = useNewsWizardStore((state) => state.goNext);
  const storeGoBack = useNewsWizardStore((state) => state.goBack);
  const resetWizard = useNewsWizardStore((state) => state.reset);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
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

  async function goNext() {
    const fieldsToValidate = STEP_FIELDS[currentStep];
    const isValid =
      fieldsToValidate.length > 0 ? await form.trigger(fieldsToValidate) : true;
    if (!isValid) return;
    storeGoNext();
  }

  const watchedValues = form.watch();

  useEffect(() => {
    setTotalSteps(STEPS.length);
    resetWizard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSubmit(values: FormData) {
    const { id, update } = toast({
      title: "Đang tạo tin tức...",
      description: "Vui lòng chờ trong giây lát.",
      duration: Infinity,
    });

    try {
      setIsLoading(true);

      await api.news.create({
        ...values,
        publishedAt: values.publishedAt
          ? new Date(values.publishedAt).toISOString()
          : undefined,
      });

      update({
        id,
        title: "Thành công",
        description: "Tin tức đã được tạo thành công.",
        variant: "default",
        duration: 3000,
      });

      router.push("/news");
    } catch (error) {
      console.error(error);
      update({
        id,
        title: "Lỗi",
        description:
          error instanceof Error ? error.message : "Không thể tạo tin tức",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5 p-8 pt-6 dashboard-reveal">
      <WizardPageHeader
        eyebrow="Tin tức"
        title="Tạo Tin tức mới"
        description="Hoàn thành từng bước để đăng bài viết mới."
        onCancel={() => router.push("/news")}
      />

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
            }
          }}
        >
          <StepWizard
            steps={STEPS}
            currentStep={currentStep}
            isLoading={isLoading}
            submitLabel="Tạo Tin tức"
            confirmTitle="Xác nhận đăng tin tức"
            confirmDescription="Bạn có chắc chắn muốn tạo tin tức này? Vui lòng kiểm tra lại thông tin trước khi xác nhận."
            onBack={storeGoBack}
            onNext={goNext}
          >
            {currentStep === 1 && (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>
                        Tiêu đề <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nhập tiêu đề tin tức..."
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            form.setValue("slug", slugify(e.target.value));
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
                      <FormLabel>
                        Trạng thái <span className="text-destructive">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full shadow-none">
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
                      >
                        <FormControl>
                          <SelectTrigger className="w-full shadow-none">
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
                        Để trống để hệ thống lấy thời điểm bạn submit bài viết.
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
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Nội dung bài viết</h3>
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
                    <FormItem>
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
                              {/* eslint-disable-next-line @next/next/no-img-element */}
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
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="rounded-xl border border-[#e8e2dc] bg-[#fdfbf9] p-5">
                  <h4 className="text-sm font-semibold text-stone-950">
                    Thông tin bài viết
                  </h4>
                  <dl className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <dt className="text-xs text-muted-foreground">
                        Tiêu đề
                      </dt>
                      <dd className="text-sm font-medium text-stone-800">
                        {watchedValues.title || "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">
                        Trạng thái
                      </dt>
                      <dd className="text-sm font-medium text-stone-800">
                        {statusLabels[watchedValues.status] || "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">
                        Danh mục
                      </dt>
                      <dd className="text-sm font-medium text-stone-800">
                        {categoryLabels[watchedValues.category] || "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">
                        Ngày đăng
                      </dt>
                      <dd className="text-sm font-medium text-stone-800">
                        {watchedValues.publishedAt || "Thời điểm submit"}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="rounded-xl border border-[#e8e2dc] bg-[#fdfbf9] p-5">
                  <h4 className="text-sm font-semibold text-stone-950">
                    Ảnh bìa
                  </h4>
                  {coverImageUpload.preview || watchedValues.coverImage ? (
                    <div className="relative mt-4 aspect-video w-full max-w-xs overflow-hidden rounded-lg border">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={coverImageUpload.preview || watchedValues.coverImage}
                        alt="Cover preview"
                        className="h-full w-full object-cover"
                      />
                      <ImageUploadOverlay show={coverImageUpload.isUploading} />
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-muted-foreground">
                      Chưa có ảnh bìa.
                    </p>
                  )}
                </div>
              </div>
            )}
          </StepWizard>
        </form>
      </Form>
    </div>
  );
}
