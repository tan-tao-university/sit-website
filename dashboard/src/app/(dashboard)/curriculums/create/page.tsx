"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCurriculumWizardStore } from "@/store/curriculum-wizard-store";
import { StepWizard } from "@/components/wizard/step-wizard";
import { WizardPageHeader } from "@/components/wizard/wizard-page-header";
import { Loader2, Plus, Trash2, Languages, X } from "lucide-react";
import { slugify } from "@/lib/utils";

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
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ImageUploadOverlay } from "@/components/ui/image-upload-overlay";
import { useToast } from "@/hooks/use-toast";
import { useImageUpload } from "@/hooks/use-image-upload";
import { api, Program } from "@/lib/api";

const SECTION_KEYS = [
  { value: "intro", label: "Giới thiệu" },
  { value: "overview", label: "Tổng quan" },
  { value: "vision", label: "Tầm nhìn" },
  { value: "objectives", label: "Mục tiêu đào tạo" },
  { value: "learning_outcomes", label: "Chuẩn đầu ra" },
  { value: "admission_requirements", label: "Điều kiện xét tuyển" },
  { value: "workload", label: "Khối lượng chương trình" },
  { value: "curriculum_structure", label: "Cấu trúc chương trình" },
  { value: "teaching_method", label: "Phương pháp giảng dạy" },
  { value: "assessment", label: "Đánh giá kết quả" },
  { value: "career_opportunities", label: "Cơ hội nghề nghiệp" },
  { value: "graduation_requirements", label: "Điều kiện tốt nghiệp" },
] as const;

const EDUCATION_TYPES = [
  "Chính quy",
  "Vừa làm vừa học",
  "Từ xa",
  "Liên thông",
  "Văn bằng 2",
] as const;

const TEACHING_LANGUAGES = [
  "Tiếng Việt",
  "Tiếng Anh",
  "Song ngữ (Việt - Anh)",
] as const;

const DEGREES_AWARDED = [
  "Cử nhân",
  "Kỹ sư",
  "Thạc sĩ",
  "Tiến sĩ",
] as const;

const STEPS = [
  {
    id: 1,
    title: "Thông tin chung",
    description: "Chọn chương trình đào tạo, năm học và tên khung chương trình.",
  },
  {
    id: 2,
    title: "Chi tiết đào tạo",
    description: "Thời lượng, tín chỉ, loại hình và ngôn ngữ giảng dạy.",
  },
  {
    id: 3,
    title: "Slug, mô tả & Banner",
    description: "Đường dẫn, mô tả chi tiết và ảnh đại diện.",
  },
  {
    id: 4,
    title: "Nội dung chương trình",
    description: "Thêm các phần giới thiệu, mục tiêu, chuẩn đầu ra...",
  },
  {
    id: 5,
    title: "Xem lại & hoàn tất",
    description: "Kiểm tra lại toàn bộ thông tin trước khi tạo.",
  },
] as const;

const STEP_FIELDS: Record<number, (keyof FormData)[]> = {
  1: ["programId", "year", "nameVi", "nameEn"],
  2: [
    "durationYears",
    "totalSemesters",
    "totalCredits",
    "educationType",
    "language",
    "degreeAwarded",
  ],
  3: ["slugVi", "slugEn", "descriptionVi", "descriptionEn", "isCurrent", "banner"],
  4: ["sections"],
  5: [],
};

const formSchema = z.object({
  programId: z.string().min(1, "Vui lòng chọn chương trình"),
  year: z.coerce
    .number()
    .min(2000, "Năm không hợp lệ")
    .default(new Date().getFullYear()),
  nameVi: z
    .string()
    .min(1, "Tên chương trình (Tiếng Việt) là bắt buộc")
    .max(255),
  nameEn: z
    .string()
    .min(1, "Tên chương trình (Tiếng Anh) là bắt buộc")
    .max(255),
  slugVi: z.string().min(1, "Slug (Tiếng Việt) là bắt buộc").max(255),
  slugEn: z.string().min(1, "Slug (Tiếng Anh) là bắt buộc").max(255),
  descriptionVi: z.string().min(1, "Mô tả (Tiếng Việt) là bắt buộc"),
  descriptionEn: z.string().min(1, "Mô tả (Tiếng Anh) là bắt buộc"),
  banner: z.string().optional(),
  isCurrent: z.boolean().default(false),
  durationYears: z.coerce
    .number({ invalid_type_error: "Vui lòng nhập thời gian đào tạo" })
    .min(1, "Thời gian đào tạo phải > 0"),
  totalSemesters: z.coerce
    .number({ invalid_type_error: "Vui lòng nhập tổng số học kỳ" })
    .min(1, "Tổng số kỳ phải > 0"),
  totalCredits: z.coerce
    .number({ invalid_type_error: "Vui lòng nhập tổng số tín chỉ" })
    .min(1, "Tổng số tín chỉ phải > 0"),
  educationType: z.string().min(1, "Vui lòng chọn loại hình đào tạo"),
  language: z
    .string()
    .min(1, "Vui lòng chọn ngôn ngữ giảng dạy")
    .default("Tiếng Việt"),
  degreeAwarded: z.string().min(1, "Vui lòng chọn bằng cấp trao tặng"),
  sections: z
    .array(
      z.object({
        title: z.string().min(1, "Tiêu đề mục là bắt buộc"),
        sectionKey: z.enum(
          [
            "intro",
            "overview",
            "vision",
            "objectives",
            "learning_outcomes",
            "admission_requirements",
            "workload",
            "curriculum_structure",
            "teaching_method",
            "assessment",
            "career_opportunities",
            "graduation_requirements",
          ],
          {
            required_error: "Vui lòng chọn loại mục",
          },
        ),
        content: z.string().optional(),
        displayOrder: z.coerce.number().optional(),
        isVisible: z.boolean().default(true),
      }),
    )
    .min(1, "Vui lòng thêm ít nhất một phần nội dung"),
});

type FormData = z.infer<typeof formSchema>;

export default function CreateCurriculumPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isTranslating, setIsTranslating] = useState<Record<string, boolean>>(
    {},
  );
  const currentStep = useCurriculumWizardStore((state) => state.currentStep);
  const setTotalSteps = useCurriculumWizardStore(
    (state) => state.setTotalSteps,
  );
  const storeGoNext = useCurriculumWizardStore((state) => state.goNext);
  const storeGoBack = useCurriculumWizardStore((state) => state.goBack);
  const resetWizard = useCurriculumWizardStore((state) => state.reset);

  const handleTranslate = async (
    sourceField: "nameVi" | "descriptionVi",
    targetField: "nameEn" | "descriptionEn",
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
    resolver: zodResolver(formSchema),
    defaultValues: {
      year: new Date().getFullYear(),
      nameVi: "",
      nameEn: "",
      slugVi: "",
      slugEn: "",
      descriptionVi: "",
      descriptionEn: "",
      banner: "",
      isCurrent: false,
      durationYears: undefined,
      totalSemesters: undefined,
      totalCredits: undefined,
      educationType: "",
      language: "Tiếng Việt",
      degreeAwarded: "",
      sections: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "sections",
  });

  const bannerUpload = useImageUpload({
    folder: "curriculums",
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
  const selectedProgram = programs.find(
    (program) => program.programId === watchedValues.programId,
  );

  useEffect(() => {
    setTotalSteps(STEPS.length);
    resetWizard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    async function fetchPrograms() {
      try {
        const data = await api.programs.findAll();
        setPrograms(data);
      } catch (error) {
        console.error("Failed to fetch programs:", error);
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: "Không thể tải danh sách chương trình",
        });
      }
    }
    fetchPrograms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSubmit(values: FormData) {
    const { id, update } = toast({
      title: "Đang tạo khung chương trình...",
      description: "Vui lòng chờ trong giây lát.",
      duration: Infinity,
    });

    try {
      setIsLoading(true);

      // 1. Create Curriculum
      const curriculum = await api.curriculums.create({
        programId: values.programId,
        year: values.year,
        nameVi: values.nameVi,
        nameEn: values.nameEn,
        slugVi: values.slugVi,
        slugEn: values.slugEn,
        descriptionVi: values.descriptionVi,
        descriptionEn: values.descriptionEn,
        banner: values.banner,
        isCurrent: values.isCurrent,
        durationYears: values.durationYears,
        totalSemesters: values.totalSemesters,
        totalCredits: values.totalCredits,
        educationType: values.educationType,
        language: values.language,
        degreeAwarded: values.degreeAwarded,
      });

      // 2. Create Sections
      await Promise.all(
        values.sections.map((section, index) =>
          api.sections.create({
            curriculumId: curriculum.curriculumId,
            sectionKey: section.sectionKey,
            title: section.title,
            content: section.content || "",
            displayOrder: section.displayOrder || index + 1,
            isVisible: section.isVisible,
          }),
        ),
      );

      update({
        id,
        title: "Thành công",
        description: "Khung chương trình đã được tạo thành công.",
        variant: "default",
        duration: 3000,
      });

      router.push("/curriculums");
    } catch (error) {
      console.error(error);
      update({
        id,
        title: "Lỗi",
        description:
          error instanceof Error
            ? error.message
            : "Không thể tạo khung chương trình",
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
        eyebrow="Chương trình đào tạo"
        title="Tạo Khung Chương trình"
        description="Hoàn thành từng bước để tạo khung chương trình đào tạo mới."
        onCancel={() => router.push("/curriculums")}
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
            submitLabel="Tạo Khung Chương trình"
            confirmTitle="Xác nhận tạo khung chương trình"
            confirmDescription="Bạn có chắc chắn muốn tạo khung chương trình này? Vui lòng kiểm tra lại thông tin trước khi xác nhận."
            onBack={storeGoBack}
            onNext={goNext}
          >
                {currentStep === 1 && (
                  <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="programId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Chương trình Đào tạo <span className="text-destructive">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn chương trình" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {programs.map((program) => (
                            <SelectItem
                              key={program.programId}
                              value={program.programId}
                            >
                              {program.nameVi} ({program.code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Năm học <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          className="shadow-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="nameVi"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Tên Khung Chương trình (Tiếng Việt){" "}
                          <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="VD: Khung chương trình 2024"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              form.setValue("slugVi", slugify(e.target.value));
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
                          <FormLabel>
                            Tên Khung Chương trình (Tiếng Anh){" "}
                            <span className="text-destructive">*</span>
                          </FormLabel>
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
                            placeholder="Ex: Curriculum 2024"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              form.setValue("slugEn", slugify(e.target.value));
                            }}
                            className="shadow-none"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="durationYears"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Thời gian đào tạo (Năm){" "}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="0"
                          type="number"
                          step="0.5"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ""
                                ? undefined
                                : Number(e.target.value),
                            )
                          }
                          className="shadow-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="totalSemesters"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Tổng số học kỳ <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="0"
                          type="number"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ""
                                ? undefined
                                : Number(e.target.value),
                            )
                          }
                          className="shadow-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="totalCredits"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Tổng số tín chỉ <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="0"
                          type="number"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ""
                                ? undefined
                                : Number(e.target.value),
                            )
                          }
                          className="shadow-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="educationType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Loại hình đào tạo <span className="text-destructive">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full shadow-none">
                            <SelectValue placeholder="Chọn loại hình đào tạo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {EDUCATION_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Ngôn ngữ giảng dạy <span className="text-destructive">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full shadow-none">
                            <SelectValue placeholder="Chọn ngôn ngữ giảng dạy" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {TEACHING_LANGUAGES.map((lang) => (
                            <SelectItem key={lang} value={lang}>
                              {lang}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="degreeAwarded"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Bằng cấp trao tặng <span className="text-destructive">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full shadow-none">
                            <SelectValue placeholder="Chọn bằng cấp trao tặng" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {DEGREES_AWARDED.map((degree) => (
                            <SelectItem key={degree} value={degree}>
                              {degree}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="md:col-span-2 space-y-4">
                  <FormLabel>
                    Mô tả (Tiếng Việt) <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormField
                    control={form.control}
                    name="descriptionVi"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            placeholder="Mô tả chi tiết về khung chương trình (Tiếng Việt)..."
                            className="min-h-[100px] shadow-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-center justify-between">
                    <FormLabel>
                      Mô tả (Tiếng Anh) <span className="text-destructive">*</span>
                    </FormLabel>
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
                  <FormField
                    control={form.control}
                    name="descriptionEn"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            placeholder="Description in English..."
                            className="min-h-[100px] shadow-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name="isCurrent"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Áp dụng hiện tại
                          </FormLabel>
                          <FormDescription>
                            Đặt khung chương trình này làm mặc định hiện tại cho
                            sinh viên
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="md:col-span-2">
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
              </div>
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="space-y-4">
              <div className="flex items-center justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="cursor-pointer"
                onClick={() =>
                  append({
                    title: "",
                    sectionKey: "intro", // Default value
                    content: "",
                    isVisible: true,
                    displayOrder: fields.length + 1,
                  })
                }
              >
                <Plus className="mr-2 h-4 w-4" />
                Thêm phần
              </Button>
            </div>

            {form.formState.errors.sections?.message && (
              <p className="text-sm font-medium text-destructive">
                {form.formState.errors.sections.message}
              </p>
            )}

            {fields.map((field, index) => (
              <Card key={field.id} className="relative">
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute right-4 top-4 z-10"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name={`sections.${index}.title`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Tiêu đề <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Tiêu đề mục..."
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
                      name={`sections.${index}.sectionKey`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Loại nội dung <span className="text-destructive">*</span>
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Chọn loại" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {SECTION_KEYS.map((key) => (
                                <SelectItem key={key.value} value={key.value}>
                                  {key.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="md:col-span-2">
                      <FormField
                        control={form.control}
                        name={`sections.${index}.content`}
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center justify-between">
                              <FormLabel>Nội dung</FormLabel>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={async () => {
                                  const text = form.getValues(
                                    `sections.${index}.content`,
                                  );
                                  if (!text) return;
                                  try {
                                    const res = await api.translation.translate(
                                      text,
                                      "en",
                                    );
                                    form.setValue(
                                      `sections.${index}.content`,
                                      text + "\n\n" + res.translatedText,
                                    );
                                    toast({
                                      title: "Dịch thành công",
                                      description: "Đã thêm nội dung tiếng Anh",
                                    });
                                  } catch (e) {
                                    toast({
                                      title: "Lỗi dịch thuật",
                                      description: "Không thể dịch tự động",
                                      variant: "destructive",
                                    });
                                  }
                                }}
                              >
                                <Languages className="mr-2 h-4 w-4" />
                                Dịch thêm Tiếng Anh
                              </Button>
                            </div>
                            <FormControl>
                              <RichTextEditor
                                placeholder="Nội dung chi tiết..."
                                className="min-h-[150px] shadow-none"
                                value={field.value || ""}
                                onChange={field.onChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name={`sections.${index}.displayOrder`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Thứ tự hiển thị</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
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
                      name={`sections.${index}.isVisible`}
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Hiển thị
                            </FormLabel>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}

            {fields.length === 0 && (
              <div className="flex h-32 items-center justify-center rounded-lg border border-dashed text-muted-foreground">
                Chưa có phần nội dung nào. Nhấn &quot;Thêm phần&quot; để bắt đầu.
              </div>
            )}
                  </div>
                )}

                {currentStep === 5 && (
                  <div className="space-y-4">
                    <div className="rounded-xl border border-[#e8e2dc] bg-[#fdfbf9] p-5">
                      <h4 className="text-sm font-semibold text-stone-950">
                        Thông tin chung
                      </h4>
                      <dl className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                          <dt className="text-xs text-muted-foreground">
                            Chương trình đào tạo
                          </dt>
                          <dd className="text-sm font-medium text-stone-800">
                            {selectedProgram
                              ? `${selectedProgram.nameVi} (${selectedProgram.code})`
                              : "Chưa chọn"}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs text-muted-foreground">
                            Năm học
                          </dt>
                          <dd className="text-sm font-medium text-stone-800">
                            {watchedValues.year}
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
                      </dl>
                    </div>

                    <div className="rounded-xl border border-[#e8e2dc] bg-[#fdfbf9] p-5">
                      <h4 className="text-sm font-semibold text-stone-950">
                        Chi tiết đào tạo
                      </h4>
                      <dl className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <div>
                          <dt className="text-xs text-muted-foreground">
                            Thời gian đào tạo
                          </dt>
                          <dd className="text-sm font-medium text-stone-800">
                            {watchedValues.durationYears ?? "—"} năm
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs text-muted-foreground">
                            Tổng số học kỳ
                          </dt>
                          <dd className="text-sm font-medium text-stone-800">
                            {watchedValues.totalSemesters ?? "—"}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs text-muted-foreground">
                            Tổng số tín chỉ
                          </dt>
                          <dd className="text-sm font-medium text-stone-800">
                            {watchedValues.totalCredits ?? "—"}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs text-muted-foreground">
                            Loại hình đào tạo
                          </dt>
                          <dd className="text-sm font-medium text-stone-800">
                            {watchedValues.educationType || "—"}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs text-muted-foreground">
                            Ngôn ngữ giảng dạy
                          </dt>
                          <dd className="text-sm font-medium text-stone-800">
                            {watchedValues.language || "—"}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs text-muted-foreground">
                            Bằng cấp trao tặng
                          </dt>
                          <dd className="text-sm font-medium text-stone-800">
                            {watchedValues.degreeAwarded || "—"}
                          </dd>
                        </div>
                      </dl>
                    </div>

                    <div className="rounded-xl border border-[#e8e2dc] bg-[#fdfbf9] p-5">
                      <h4 className="text-sm font-semibold text-stone-950">
                        Slug, mô tả & Banner
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
                        <div>
                          <dt className="text-xs text-muted-foreground">
                            Áp dụng hiện tại
                          </dt>
                          <dd className="text-sm font-medium text-stone-800">
                            {watchedValues.isCurrent ? "Có" : "Không"}
                          </dd>
                        </div>
                      </dl>
                      {bannerUpload.preview && (
                        <div className="relative mt-4 aspect-video w-full max-w-xs overflow-hidden rounded-lg border">
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

                    <div className="rounded-xl border border-[#e8e2dc] bg-[#fdfbf9] p-5">
                      <h4 className="text-sm font-semibold text-stone-950">
                        Nội dung chương trình ({fields.length} phần)
                      </h4>
                      {fields.length > 0 ? (
                        <ul className="mt-3 space-y-2">
                          {watchedValues.sections?.map((section, index) => (
                            <li
                              key={index}
                              className="flex items-center justify-between rounded-lg border border-[#eee9e4] bg-white px-3 py-2 text-sm"
                            >
                              <span className="font-medium text-stone-800">
                                {section.title || `Phần ${index + 1}`}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {
                                  SECTION_KEYS.find(
                                    (key) => key.value === section.sectionKey,
                                  )?.label
                                }
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-2 text-sm text-muted-foreground">
                          Chưa có phần nội dung nào.
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
