"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, X, Languages } from "lucide-react";

import { useProgramWizardStore } from "@/store/program-wizard-store";
import { StepWizard } from "@/components/wizard/step-wizard";
import { WizardPageHeader } from "@/components/wizard/wizard-page-header";
import { ImageUploadOverlay } from "@/components/ui/image-upload-overlay";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
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
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { YooptaEditorComponent } from "@/components/ui/yoopta-editor";

const STEPS = [
  {
    id: 1,
    title: "Thông tin chung",
    description: "Mã, tên, cấp độ và trạng thái chương trình.",
  },
  {
    id: 2,
    title: "Slug & Mô tả",
    description: "Đường dẫn và mô tả tóm tắt chương trình.",
  },
  {
    id: 3,
    title: "Nội dung & Banner",
    description: "Nội dung chi tiết và ảnh đại diện chương trình.",
  },
  {
    id: 4,
    title: "Xem lại & hoàn tất",
    description: "Kiểm tra lại toàn bộ thông tin trước khi tạo.",
  },
] as const;

const formSchema = z.object({
  code: z.string().min(1, "Mã chương trình là bắt buộc").max(50),
  nameVi: z.string().min(1, "Tên chương trình là bắt buộc").max(255),
  nameEn: z.string().max(255).optional(),
  slugVi: z.string().min(1, "Slug (Tiếng Việt) là bắt buộc").max(255),
  slugEn: z.string().min(1, "Slug (Tiếng Anh) là bắt buộc").max(255),
  level: z.enum(["undergraduate", "postgraduate"], {
    required_error: "Vui lòng chọn cấp độ",
  }),
  majorCode: z.string().max(20).optional(),
  descriptionVi: z.string().optional(),
  descriptionEn: z.string().optional(),
  banner: z.string().url("Phải là URL hợp lệ").optional().or(z.literal("")),
  status: z.enum(["active", "inactive"], {
    required_error: "Vui lòng chọn trạng thái",
  }),
  content: z.record(z.any()), // Yoopta content
});

type FormData = z.infer<typeof formSchema>;

const STEP_FIELDS: Record<number, (keyof FormData)[]> = {
  1: ["code", "status", "nameVi", "nameEn", "level", "majorCode"],
  2: ["slugVi", "slugEn", "descriptionVi", "descriptionEn"],
  3: ["content", "banner"],
  4: [],
};

export default function CreateProgramPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isTranslating, setIsTranslating] = useState<Record<string, boolean>>(
    {},
  );
  const currentStep = useProgramWizardStore((state) => state.currentStep);
  const setTotalSteps = useProgramWizardStore((state) => state.setTotalSteps);
  const storeGoNext = useProgramWizardStore((state) => state.goNext);
  const storeGoBack = useProgramWizardStore((state) => state.goBack);
  const resetWizard = useProgramWizardStore((state) => state.reset);

  const handleTranslate = async (
    sourceField: keyof FormData,
    targetField: keyof FormData,
  ) => {
    const sourceText = form.getValues(sourceField);
    if (!sourceText || typeof sourceText !== "string") {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Vui lòng nhập nội dung tiếng Việt trước khi dịch.",
      });
      return;
    }

    try {
      setIsTranslating((prev) => ({ ...prev, [targetField]: true }));
      toast({
        title: "Đang dịch...",
        description: "Hệ thống đang dịch nội dung sang tiếng Anh.",
      });

      const res = await api.translation.translate(sourceText as string, "en");
      form.setValue(targetField, res.translatedText as any, {
        shouldDirty: true,
      });

      toast({
        title: "Thành công",
        description: "Dịch nội dung thành công.",
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể dịch nội dung. Vui lòng thử lại.",
      });
    } finally {
      setIsTranslating((prev) => ({ ...prev, [targetField]: false }));
    }
  };

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
      nameVi: "",
      nameEn: "",
      slugVi: "",
      slugEn: "",
      level: "undergraduate" as const,
      majorCode: "",
      descriptionVi: "",
      descriptionEn: "",
      banner: "",
      content: {},
    },
  });

  const bannerUpload = useImageUpload({
    folder: "banners",
    onUploaded: (url) => form.setValue("banner", url),
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
      title: "Đang tạo chương trình...",
      description: "Vui lòng chờ trong giây lát.",
      duration: Infinity,
    });

    try {
      setIsLoading(true);

      await api.programs.create(values);

      update({
        id,
        title: "Thành công",
        description: "Chương trình đã được tạo thành công.",
        variant: "default",
        duration: 3000,
      });

      router.push("/programs");
    } catch (error: any) {
      console.error(error);

      // Handle field-specific errors (e.g., duplicate slug)
      if (error.field) {
        // Map database field names to form field names
        const fieldMap: Record<string, keyof FormData> = {
          slugEn: "slugEn",
          slugVi: "slugVi",
          code: "code",
          slug_en: "slugEn",
          slug_vi: "slugVi",
        };

        const formField = fieldMap[error.field] || error.field;

        // Set error on the specific field with the value that's duplicated
        const duplicateValue = error.value || form.getValues(formField);
        form.setError(formField, {
          type: "manual",
          message: `Giá trị "${duplicateValue}" đã tồn tại. Vui lòng sử dụng giá trị khác.`,
        });

        // Show toast with field name in Vietnamese
        const fieldNameVi = getVietnameseFieldName(formField);
        update({
          id,
          title: "Lỗi trùng lặp dữ liệu",
          description: `${fieldNameVi} "${duplicateValue}" đã được sử dụng trong hệ thống. Vui lòng chọn giá trị khác.`,
          variant: "destructive",
          duration: 5000,
        });
      } else {
        // Generic error
        update({
          id,
          title: "Lỗi",
          description:
            error instanceof Error
              ? error.message
              : "Không thể tạo chương trình",
          variant: "destructive",
          duration: 5000,
        });
      }
    } finally {
      setIsLoading(false);
    }
  }

  // Helper function to get Vietnamese field names
  function getVietnameseFieldName(field: keyof FormData): string {
    const fieldNames: Record<string, string> = {
      slugEn: "Slug (Tiếng Anh)",
      slugVi: "Slug (Tiếng Việt)",
      code: "Mã chương trình",
      nameEn: "Tên (Tiếng Anh)",
      nameVi: "Tên (Tiếng Việt)",
    };
    return fieldNames[field] || field;
  }

  const levelLabels: Record<string, string> = {
    undergraduate: "Đại học",
    postgraduate: "Sau đại học",
  };
  const statusLabels: Record<string, string> = {
    active: "Hoạt động",
    inactive: "Không hoạt động",
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5 p-8 pt-6 dashboard-reveal">
      <WizardPageHeader
        eyebrow="Chương trình đào tạo"
        title="Tạo Chương trình Đào tạo"
        description="Hoàn thành từng bước để tạo chương trình đào tạo mới."
        onCancel={() => router.push("/programs")}
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
            submitLabel="Tạo Chương trình"
            confirmTitle="Xác nhận tạo chương trình đào tạo"
            confirmDescription="Bạn có chắc chắn muốn tạo chương trình này? Vui lòng kiểm tra lại thông tin trước khi xác nhận."
            onBack={storeGoBack}
            onNext={goNext}
          >
            {currentStep === 1 && (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Mã Chương trình{" "}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="KHMT"
                          {...field}
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
                          <SelectItem value="active">Hoạt động</SelectItem>
                          <SelectItem value="inactive">
                            Không hoạt động
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nameVi"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Tên (Tiếng Việt){" "}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Khoa học máy tính"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            const slug = slugify(e.target.value);
                            form.setValue("slugVi", slug);
                            if (!form.getValues("nameEn")) {
                              form.setValue("slugEn", slug);
                            }
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
                  name="nameEn"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>Tên (Tiếng Anh)</FormLabel>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs border cursor-pointer"
                          disabled={isTranslating["nameEn"]}
                          onClick={() => handleTranslate("nameVi", "nameEn")}
                        >
                          {isTranslating["nameEn"] ? (
                            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                          ) : (
                            <Languages className="mr-1 h-3 w-3" />
                          )}
                          Dịch bằng AI
                        </Button>
                      </div>
                      <FormControl>
                        <Input
                          placeholder="Computer Science"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            form.setValue(
                              "slugEn",
                              slugify(e.target.value),
                            );
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
                  name="level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Cấp độ <span className="text-destructive">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full shadow-none">
                            <SelectValue placeholder="Chọn cấp độ" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="undergraduate">
                            Đại học
                          </SelectItem>
                          <SelectItem value="postgraduate">
                            Sau đại học
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="majorCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mã Ngành</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="7480101"
                          {...field}
                          className="shadow-none"
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
                <FormField
                  control={form.control}
                  name="descriptionVi"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mô tả (Tiếng Việt - Tóm tắt)</FormLabel>
                      <FormControl>
                        <RichTextEditor
                          value={field.value || ""}
                          onChange={field.onChange}
                          placeholder="Mô tả chương trình..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="descriptionEn"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>Mô tả (Tiếng Anh - Tóm tắt)</FormLabel>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs border cursor-pointer"
                          disabled={isTranslating["descriptionEn"]}
                          onClick={() =>
                            handleTranslate("descriptionVi", "descriptionEn")
                          }
                        >
                          {isTranslating["descriptionEn"] ? (
                            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                          ) : (
                            <Languages className="mr-1 h-3 w-3" />
                          )}
                          Dịch bằng AI
                        </Button>
                      </div>
                      <FormControl>
                        <RichTextEditor
                          value={field.value || ""}
                          onChange={field.onChange}
                          placeholder="Program description..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">
                    Nội dung chi tiết (Mục tiêu, Cơ hội, Chuẩn đầu ra...)
                  </h3>
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
                  name="banner"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ảnh Banner</FormLabel>
                      <FormControl>
                        <div className="space-y-4">
                          <Input
                            type="file"
                            accept="image/*"
                            className="shadow-none cursor-pointer"
                            disabled={bannerUpload.isUploading}
                            onChange={bannerUpload.handleFileChange}
                          />
                          {bannerUpload.preview && (
                            <div className="relative mt-2 aspect-video w-full max-w-md overflow-hidden rounded-lg border">
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute right-2 top-2 z-10"
                                disabled={bannerUpload.isUploading}
                                onClick={() => {
                                  bannerUpload.reset();
                                  field.onChange("");
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={bannerUpload.preview}
                                alt="Banner preview"
                                className="h-full w-full object-cover"
                              />
                              <ImageUploadOverlay show={bannerUpload.isUploading} />
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

            {currentStep === 4 && (
              <div className="space-y-4">
                <div className="rounded-xl border border-[#e8e2dc] bg-[#fdfbf9] p-5">
                  <h4 className="text-sm font-semibold text-stone-950">
                    Thông tin chung
                  </h4>
                  <dl className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <dt className="text-xs text-muted-foreground">
                        Mã chương trình
                      </dt>
                      <dd className="text-sm font-medium text-stone-800">
                        {watchedValues.code || "—"}
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
                        Tên (Tiếng Việt)
                      </dt>
                      <dd className="text-sm font-medium text-stone-800">
                        {watchedValues.nameVi || "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">
                        Tên (Tiếng Anh)
                      </dt>
                      <dd className="text-sm font-medium text-stone-800">
                        {watchedValues.nameEn || "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">
                        Cấp độ
                      </dt>
                      <dd className="text-sm font-medium text-stone-800">
                        {levelLabels[watchedValues.level] || "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">
                        Mã ngành
                      </dt>
                      <dd className="text-sm font-medium text-stone-800">
                        {watchedValues.majorCode || "—"}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="rounded-xl border border-[#e8e2dc] bg-[#fdfbf9] p-5">
                  <h4 className="text-sm font-semibold text-stone-950">
                    Slug & Mô tả
                  </h4>
                  <dl className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <dt className="text-xs text-muted-foreground">
                        Slug (VI / EN)
                      </dt>
                      <dd className="text-sm font-medium text-stone-800">
                        {watchedValues.slugVi} / {watchedValues.slugEn}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="rounded-xl border border-[#e8e2dc] bg-[#fdfbf9] p-5">
                  <h4 className="text-sm font-semibold text-stone-950">
                    Banner
                  </h4>
                  {bannerUpload.preview || watchedValues.banner ? (
                    <div className="relative mt-4 aspect-video w-full max-w-xs overflow-hidden rounded-lg border">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={bannerUpload.preview || watchedValues.banner}
                        alt="Banner preview"
                        className="h-full w-full object-cover"
                      />
                      <ImageUploadOverlay show={bannerUpload.isUploading} />
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-muted-foreground">
                      Chưa có ảnh banner.
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
