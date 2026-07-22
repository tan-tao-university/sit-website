"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2, X, Languages } from "lucide-react";

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
import { WizardPageHeader } from "@/components/wizard/wizard-page-header";
import { EditPageCard } from "@/components/wizard/edit-page-card";
import { ImageUploadOverlay } from "@/components/ui/image-upload-overlay";
import { useToast } from "@/hooks/use-toast";
import { useImageUpload } from "@/hooks/use-image-upload";
import { FormLoading } from "@/components/shared/LoadingStates";
import { api } from "@/lib/api";
import { slugify } from "@/lib/utils";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { YooptaEditorComponent } from "@/components/ui/yoopta-editor";

const formSchema = z.object({
  code: z.string().min(1, "Mã chương trình là bắt buộc").max(50),
  nameVi: z.string().min(1, "Tên chương trình là bắt buộc").max(255),
  nameEn: z.string().max(255).optional(),
  slugVi: z.string().min(1, "Slug (Tiếng Việt) là bắt buộc").max(255),
  slugEn: z.string().min(1, "Slug (Tiếng Anh) là bắt buộc").max(255),
  level: z.enum(["undergraduate", "postgraduate"]),
  majorCode: z.string().max(20).optional(),
  descriptionVi: z.string().optional(),
  descriptionEn: z.string().optional(),
  banner: z.string().url("Phải là URL hợp lệ").optional().or(z.literal("")),
  status: z.enum(["active", "inactive"]),
  content: z.record(z.any()),
});

type FormData = z.infer<typeof formSchema>;

export default function EditProgramPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = React.use(params);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [isTranslating, setIsTranslating] = useState<Record<string, boolean>>(
    {},
  );

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

      const res = await api.translation.translate(sourceText, "en");
      form.setValue(targetField, res.translatedText, { shouldDirty: true });

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
      status: "active",
      content: {},
    },
  });

  const bannerUpload = useImageUpload({
    folder: "banners",
    onUploaded: (url) => form.setValue("banner", url),
  });

  useEffect(() => {
    const fetchProgram = async () => {
      try {
        const program = await api.programs.findOne(id);
        form.reset({
          code: program.code,
          nameVi: program.nameVi,
          nameEn: program.nameEn || "",
          slugVi: program.slugVi,
          slugEn: program.slugEn,
          level: program.level,
          majorCode: program.majorCode || "",
          descriptionVi: program.descriptionVi || "",
          descriptionEn: program.descriptionEn || "",
          banner: program.banner || "",
          status: program.status || "active",
          content: program.content || {},
        });
        bannerUpload.setPreview(program.banner || "");
      } catch (error) {
        console.error("Failed to fetch program:", error);
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: "Không thể tải thông tin chương trình",
        });
        router.push("/programs");
      } finally {
        setIsFetching(false);
      }
    };

    if (id) {
      fetchProgram();
    }
  }, [id, form, router, toast]);

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

      await api.programs.update(id, result.data);

      update({
        id: toastId,
        title: "Thành công",
        description: "Chương trình đã được cập nhật thành công.",
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
          id: toastId,
          title: "Lỗi trùng lặp dữ liệu",
          description: `${fieldNameVi} "${duplicateValue}" đã được sử dụng trong hệ thống. Vui lòng chọn giá trị khác.`,
          variant: "destructive",
          duration: 5000,
        });
      } else {
        // Generic error
        update({
          id: toastId,
          title: "Lỗi",
          description:
            error instanceof Error
              ? error.message
              : "Không thể cập nhật chương trình",
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

  if (isFetching) {
    return <FormLoading fieldCount={8} />;
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5 p-8 pt-6 dashboard-reveal">
      <WizardPageHeader
        eyebrow="Chương trình đào tạo"
        title="Cập nhật Chương trình"
        description="Chỉnh sửa thông tin chương trình đào tạo."
        onCancel={() => router.push("/programs")}
      />

      <EditPageCard>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mã Chương trình</FormLabel>
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
                      <FormLabel>Trạng thái</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="shadow-none">
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
                      <FormLabel>Tên (Tiếng Việt)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Khoa học máy tính"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            const slug = slugify(e.target.value);
                            form.setValue("slugVi", slug);
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
                            const slug = slugify(e.target.value);
                            form.setValue("slugEn", slug);
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
                      <FormLabel>Cấp độ</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="shadow-none">
                            <SelectValue placeholder="Chọn cấp độ" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="undergraduate">Đại học</SelectItem>
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

                <FormField
                  control={form.control}
                  name="descriptionVi"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Mô tả (Tiếng Việt)</FormLabel>
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
                    <FormItem className="md:col-span-2">
                      <div className="flex items-center justify-between">
                        <FormLabel>Mô tả (Tiếng Anh)</FormLabel>
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

                {/* RichTextEditor for Content */}
                <div className="md:col-span-2 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">
                      Nội dung chi tiết (Mục tiêu, Cơ hội, Chuẩn đầu ra...)
                    </h3>
                  </div>
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="min-h-[500px] rounded-md border bg-white p-4">
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

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  className="cursor-pointer"
                  onClick={() => router.push("/programs")}
                  disabled={isLoading}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  className="cursor-pointer"
                  disabled={isLoading}
                >
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Cập nhật Chương trình
                </Button>
              </div>
            </form>
          </Form>
      </EditPageCard>
    </div>
  );
}
