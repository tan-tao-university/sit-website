"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, type Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Plus, Trash2 } from "lucide-react";

import { useStudentPortfolioWizardStore } from "@/store/student-portfolio-wizard-store";
import { StepWizard } from "@/components/wizard/step-wizard";
import { WizardPageHeader } from "@/components/wizard/wizard-page-header";
import { ImageUploadOverlay } from "@/components/ui/image-upload-overlay";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormLoading } from "@/components/shared/LoadingStates";
import { useToast } from "@/hooks/use-toast";
import { useImageUpload } from "@/hooks/use-image-upload";
import { api } from "@/lib/api";
import { slugify } from "@/lib/utils";
import {
  StudentPortfolioFormData,
  studentPortfolioFormSchema,
} from "@/lib/form-validation";

const STEPS = [
  { id: 1, title: "Cơ bản", description: "Thông tin cơ bản của sinh viên." },
  { id: 2, title: "Kỹ năng", description: "Ngôn ngữ, framework, công cụ." },
  { id: 3, title: "Dự án", description: "Sản phẩm, đồ án tiêu biểu." },
  { id: 4, title: "Kinh nghiệm", description: "Thực tập, công việc đã làm." },
  { id: 5, title: "Học vấn", description: "Quá trình học tập." },
  { id: 6, title: "Thành tích", description: "Giải thưởng, học bổng, chứng chỉ." },
  { id: 7, title: "Liên hệ", description: "Email, GitHub, LinkedIn..." },
  {
    id: 8,
    title: "Xem lại & hoàn tất",
    description: "Kiểm tra lại toàn bộ thông tin trước khi hoàn tất.",
  },
] as const;

const STEP_FIELDS: Record<number, Path<StudentPortfolioFormData>[]> = {
  1: [
    "fullName",
    "slug",
    "avatarUrl",
    "title",
    "shortBio",
    "about",
    "program",
    "studentYear",
    "location",
    "isPublished",
  ],
  2: ["skills"],
  3: ["projects"],
  4: ["experiences"],
  5: ["education"],
  6: ["achievements"],
  7: ["contacts"],
  8: [],
};

const DEFAULT_VALUES: StudentPortfolioFormData = {
  fullName: "",
  slug: "",
  avatarUrl: "",
  title: "",
  shortBio: "",
  about: "",
  program: "",
  studentYear: undefined,
  location: "",
  isPublished: false,
  skills: [],
  projects: [],
  experiences: [],
  education: [],
  achievements: [],
  contacts: [],
};

export default function StudentPortfolioFormPage({
  portfolioId,
}: {
  portfolioId?: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const isEditing = Boolean(portfolioId);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(isEditing);
  const currentStep = useStudentPortfolioWizardStore((state) => state.currentStep);
  const setTotalSteps = useStudentPortfolioWizardStore((state) => state.setTotalSteps);
  const storeGoNext = useStudentPortfolioWizardStore((state) => state.goNext);
  const storeGoBack = useStudentPortfolioWizardStore((state) => state.goBack);
  const resetWizard = useStudentPortfolioWizardStore((state) => state.reset);

  const form = useForm<StudentPortfolioFormData>({
    resolver: zodResolver(studentPortfolioFormSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const avatarUpload = useImageUpload({
    folder: "student-portfolio",
    onUploaded: (url) => form.setValue("avatarUrl", url),
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!portfolioId) return;
      try {
        const data = await api.studentPortfolio.findOne(portfolioId);
        form.reset({
          fullName: data.fullName,
          slug: data.slug,
          avatarUrl: data.avatarUrl || "",
          title: data.title || "",
          shortBio: data.shortBio || "",
          about: data.about || "",
          program: data.program || "",
          studentYear: data.studentYear,
          location: data.location || "",
          isPublished: data.isPublished,
          skills: data.skills || [],
          projects: data.projects || [],
          experiences: data.experiences || [],
          education: data.education || [],
          achievements: data.achievements || [],
          contacts: data.contacts || [],
        });

        if (data.avatarUrl) {
          avatarUpload.setPreview(data.avatarUrl);
        }
      } catch (error) {
        console.error("Failed to fetch student portfolio:", error);
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: "Không thể tải thông tin portfolio.",
        });
        router.push("/student-portfolio");
      } finally {
        setIsFetching(false);
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [portfolioId]);

  const {
    fields: skillFields,
    append: appendSkill,
    remove: removeSkill,
  } = useFieldArray({ control: form.control, name: "skills" });

  const {
    fields: projectFields,
    append: appendProject,
    remove: removeProject,
  } = useFieldArray({ control: form.control, name: "projects" });

  const {
    fields: experienceFields,
    append: appendExperience,
    remove: removeExperience,
  } = useFieldArray({ control: form.control, name: "experiences" });

  const {
    fields: educationFields,
    append: appendEducation,
    remove: removeEducation,
  } = useFieldArray({ control: form.control, name: "education" });

  const {
    fields: achievementFields,
    append: appendAchievement,
    remove: removeAchievement,
  } = useFieldArray({ control: form.control, name: "achievements" });

  const {
    fields: contactFields,
    append: appendContact,
    remove: removeContact,
  } = useFieldArray({ control: form.control, name: "contacts" });

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

  async function onSubmit(values: StudentPortfolioFormData) {
    const { id: toastId, update } = toast({
      title: isEditing ? "Đang cập nhật..." : "Đang tạo portfolio...",
      description: "Vui lòng chờ trong giây lát.",
      duration: Infinity,
    });

    try {
      setIsLoading(true);

      if (isEditing && portfolioId) {
        await api.studentPortfolio.update(portfolioId, values);
      } else {
        await api.studentPortfolio.create(values);
      }

      update({
        id: toastId,
        title: "Thành công",
        description: isEditing
          ? "Portfolio sinh viên đã được cập nhật thành công."
          : "Portfolio sinh viên đã được tạo thành công.",
        variant: "default",
        duration: 3000,
      });

      router.push("/student-portfolio");
    } catch (error) {
      console.error(error);
      update({
        id: toastId,
        title: "Lỗi",
        description:
          error instanceof Error
            ? error.message
            : isEditing
              ? "Không thể cập nhật portfolio"
              : "Không thể tạo portfolio",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (isFetching) {
    return <FormLoading fieldCount={8} />;
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5 p-8 pt-6 dashboard-reveal">
      <WizardPageHeader
        eyebrow="Portfolio sinh viên"
        title={isEditing ? "Chỉnh sửa Portfolio" : "Thêm Portfolio sinh viên"}
        description={
          isEditing
            ? "Cập nhật trang portfolio cá nhân của sinh viên."
            : "Hoàn thành từng bước để tạo trang portfolio mới tại /[slug]."
        }
        onCancel={() => router.push("/student-portfolio")}
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
            submitLabel={isEditing ? "Lưu thay đổi" : "Tạo Portfolio"}
            confirmTitle={
              isEditing
                ? "Xác nhận cập nhật portfolio"
                : "Xác nhận tạo portfolio"
            }
            confirmDescription="Bạn có chắc chắn muốn lưu portfolio này? Vui lòng kiểm tra lại thông tin trước khi xác nhận."
            onBack={storeGoBack}
            onNext={goNext}
          >
            {currentStep === 1 && (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Họ và tên <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Võ Hữu Nhân"
                          {...field}
                          className="shadow-none"
                          onChange={(e) => {
                            field.onChange(e);
                            form.setValue("slug", slugify(e.target.value));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Slug (URL) <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="vo-huu-nhan"
                          {...field}
                          className="shadow-none"
                        />
                      </FormControl>
                      <p className="text-xs text-muted-foreground">
                        sit.ttu.edu.vn/{field.value || "..."}
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chức danh</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Sinh viên Khoa học Máy tính"
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
                  name="program"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chương trình đào tạo</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Khoa học máy tính"
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
                  name="studentYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Khóa (năm nhập học)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="2023"
                          {...field}
                          value={field.value || ""}
                          className="shadow-none"
                          onChange={(e) =>
                            field.onChange(
                              e.target.value ? parseInt(e.target.value) : undefined,
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nơi ở</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Long An, Việt Nam"
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
                  name="avatarUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ảnh đại diện</FormLabel>
                      <FormControl>
                        <div className="space-y-4">
                          <Input
                            type="file"
                            accept="image/*"
                            className="shadow-none cursor-pointer"
                            disabled={avatarUpload.isUploading}
                            onChange={avatarUpload.handleFileChange}
                          />
                          {avatarUpload.preview && (
                            <div className="relative mt-2 h-32 w-32 overflow-hidden rounded-full border">
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute right-0 top-0 z-10 h-6 w-6 rounded-full"
                                disabled={avatarUpload.isUploading}
                                onClick={() => {
                                  avatarUpload.reset();
                                  field.onChange("");
                                }}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={avatarUpload.preview}
                                alt="Avatar preview"
                                className="h-full w-full object-cover"
                              />
                              <ImageUploadOverlay show={avatarUpload.isUploading} compact />
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name="shortBio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Giới thiệu ngắn (hero, 1-2 câu)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Sinh viên năm 3 đam mê phát triển web..."
                            className="resize-none shadow-none"
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
                    name="about"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Về mình (đoạn giới thiệu dài hơn)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Chia sẻ về hành trình học tập, sở thích..."
                            className="min-h-[150px] shadow-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="isPublished"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2 flex items-start gap-3 rounded-lg border border-primary/25 bg-primary/5 p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(checked) =>
                            field.onChange(checked === true)
                          }
                        />
                      </FormControl>
                      <div>
                        <FormLabel>Công khai portfolio này</FormLabel>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Chỉ portfolio đã công khai mới hiển thị tại /[slug] trên
                          website chính.
                        </p>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            )}

            {currentStep === 2 && (
              <div>
                <div className="flex items-center justify-end mb-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="cursor-pointer"
                    onClick={() => appendSkill({ name: "" })}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Thêm
                  </Button>
                </div>
                <div className="space-y-4">
                  {skillFields.map((field, index) => (
                    <div
                      key={field.id}
                      className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border rounded-md relative group"
                    >
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-2 h-6 w-6 text-muted-foreground hover:text-destructive"
                        onClick={() => removeSkill(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <div className="md:col-span-5">
                        <FormField
                          control={form.control}
                          name={`skills.${index}.category`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nhóm kỹ năng</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Programming Languages"
                                  {...field}
                                  className="shadow-none"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="md:col-span-7">
                        <FormField
                          control={form.control}
                          name={`skills.${index}.name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Tên kỹ năng <span className="text-destructive">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="TypeScript"
                                  {...field}
                                  className="shadow-none"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  ))}
                  {skillFields.length === 0 && (
                    <div className="text-center py-8 border-2 border-dashed rounded-lg text-muted-foreground">
                      Chưa có kỹ năng nào
                    </div>
                  )}
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div>
                <div className="flex items-center justify-end mb-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="cursor-pointer"
                    onClick={() => appendProject({ title: "" })}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Thêm
                  </Button>
                </div>
                <div className="space-y-4">
                  {projectFields.map((field, index) => (
                    <div
                      key={field.id}
                      className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border rounded-md relative group"
                    >
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-2 h-6 w-6 text-muted-foreground hover:text-destructive"
                        onClick={() => removeProject(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <div className="md:col-span-8">
                        <FormField
                          control={form.control}
                          name={`projects.${index}.title`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Tên dự án <span className="text-destructive">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input placeholder="Portfolio Website" {...field} className="shadow-none" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="md:col-span-4">
                        <FormField
                          control={form.control}
                          name={`projects.${index}.role`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Vai trò</FormLabel>
                              <FormControl>
                                <Input placeholder="Frontend Developer" {...field} className="shadow-none" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="md:col-span-12">
                        <FormField
                          control={form.control}
                          name={`projects.${index}.description`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Mô tả</FormLabel>
                              <FormControl>
                                <Textarea {...field} className="shadow-none" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="md:col-span-6">
                        <FormField
                          control={form.control}
                          name={`projects.${index}.imageUrl`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Ảnh minh họa (URL)</FormLabel>
                              <FormControl>
                                <Input placeholder="https://..." {...field} className="shadow-none" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="md:col-span-6">
                        <FormField
                          control={form.control}
                          name={`projects.${index}.techStack`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Công nghệ (cách nhau bằng dấu phẩy)</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="React, Next.js, Tailwind"
                                  value={(field.value || []).join(", ")}
                                  className="shadow-none"
                                  onChange={(e) =>
                                    field.onChange(
                                      e.target.value
                                        .split(",")
                                        .map((tech) => tech.trim())
                                        .filter(Boolean),
                                    )
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="md:col-span-6">
                        <FormField
                          control={form.control}
                          name={`projects.${index}.demoUrl`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Link demo</FormLabel>
                              <FormControl>
                                <Input placeholder="https://..." {...field} className="shadow-none" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="md:col-span-6">
                        <FormField
                          control={form.control}
                          name={`projects.${index}.repoUrl`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Link mã nguồn</FormLabel>
                              <FormControl>
                                <Input placeholder="https://github.com/..." {...field} className="shadow-none" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="md:col-span-12">
                        <FormField
                          control={form.control}
                          name={`projects.${index}.isFeatured`}
                          render={({ field }) => (
                            <FormItem className="flex items-center gap-2">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={(checked) =>
                                    field.onChange(checked === true)
                                  }
                                />
                              </FormControl>
                              <FormLabel className="!mt-0">
                                Dự án nổi bật (hiển thị trước)
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  ))}
                  {projectFields.length === 0 && (
                    <div className="text-center py-8 border-2 border-dashed rounded-lg text-muted-foreground">
                      Chưa có dự án nào
                    </div>
                  )}
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div>
                <div className="flex items-center justify-end mb-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="cursor-pointer"
                    onClick={() => appendExperience({ organization: "", role: "" })}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Thêm
                  </Button>
                </div>
                <div className="space-y-4">
                  {experienceFields.map((field, index) => (
                    <div
                      key={field.id}
                      className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border rounded-md relative group"
                    >
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-2 h-6 w-6 text-muted-foreground hover:text-destructive"
                        onClick={() => removeExperience(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <div className="md:col-span-6">
                        <FormField
                          control={form.control}
                          name={`experiences.${index}.organization`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Tổ chức <span className="text-destructive">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input placeholder="FPT Software" {...field} className="shadow-none" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="md:col-span-6">
                        <FormField
                          control={form.control}
                          name={`experiences.${index}.role`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Vai trò <span className="text-destructive">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input placeholder="Thực tập sinh" {...field} className="shadow-none" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="md:col-span-3">
                        <FormField
                          control={form.control}
                          name={`experiences.${index}.startDate`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Từ (yyyy-mm)</FormLabel>
                              <FormControl>
                                <Input placeholder="2024-06" {...field} className="shadow-none" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="md:col-span-3">
                        <FormField
                          control={form.control}
                          name={`experiences.${index}.endDate`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Đến (yyyy-mm)</FormLabel>
                              <FormControl>
                                <Input placeholder="2024-09" {...field} className="shadow-none" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="md:col-span-12">
                        <FormField
                          control={form.control}
                          name={`experiences.${index}.description`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Mô tả</FormLabel>
                              <FormControl>
                                <Textarea {...field} className="shadow-none" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  ))}
                  {experienceFields.length === 0 && (
                    <div className="text-center py-8 border-2 border-dashed rounded-lg text-muted-foreground">
                      Chưa có kinh nghiệm nào
                    </div>
                  )}
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div>
                <div className="flex items-center justify-end mb-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="cursor-pointer"
                    onClick={() => appendEducation({ school: "" })}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Thêm
                  </Button>
                </div>
                <div className="space-y-4">
                  {educationFields.map((field, index) => (
                    <div
                      key={field.id}
                      className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border rounded-md relative group"
                    >
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-2 h-6 w-6 text-muted-foreground hover:text-destructive"
                        onClick={() => removeEducation(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <div className="md:col-span-6">
                        <FormField
                          control={form.control}
                          name={`education.${index}.school`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Trường <span className="text-destructive">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input placeholder="Đại học Tân Tạo" {...field} className="shadow-none" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="md:col-span-3">
                        <FormField
                          control={form.control}
                          name={`education.${index}.degree`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Bậc học</FormLabel>
                              <FormControl>
                                <Input placeholder="Cử nhân" {...field} className="shadow-none" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="md:col-span-3">
                        <FormField
                          control={form.control}
                          name={`education.${index}.field`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Chuyên ngành</FormLabel>
                              <FormControl>
                                <Input placeholder="Computer Science" {...field} className="shadow-none" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="md:col-span-3">
                        <FormField
                          control={form.control}
                          name={`education.${index}.startYear`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Từ năm</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  {...field}
                                  value={field.value || ""}
                                  className="shadow-none"
                                  onChange={(e) =>
                                    field.onChange(
                                      e.target.value ? parseInt(e.target.value) : undefined,
                                    )
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="md:col-span-3">
                        <FormField
                          control={form.control}
                          name={`education.${index}.endYear`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Đến năm</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  {...field}
                                  value={field.value || ""}
                                  className="shadow-none"
                                  onChange={(e) =>
                                    field.onChange(
                                      e.target.value ? parseInt(e.target.value) : undefined,
                                    )
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  ))}
                  {educationFields.length === 0 && (
                    <div className="text-center py-8 border-2 border-dashed rounded-lg text-muted-foreground">
                      Chưa có thông tin học vấn
                    </div>
                  )}
                </div>
              </div>
            )}

            {currentStep === 6 && (
              <div>
                <div className="flex items-center justify-end mb-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="cursor-pointer"
                    onClick={() => appendAchievement({ title: "" })}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Thêm
                  </Button>
                </div>
                <div className="space-y-4">
                  {achievementFields.map((field, index) => (
                    <div
                      key={field.id}
                      className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border rounded-md relative group"
                    >
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-2 h-6 w-6 text-muted-foreground hover:text-destructive"
                        onClick={() => removeAchievement(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <div className="md:col-span-8">
                        <FormField
                          control={form.control}
                          name={`achievements.${index}.title`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Tên thành tích <span className="text-destructive">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input placeholder="Học bổng Tân Tạo" {...field} className="shadow-none" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="md:col-span-4">
                        <FormField
                          control={form.control}
                          name={`achievements.${index}.year`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Năm</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  {...field}
                                  value={field.value || ""}
                                  className="shadow-none"
                                  onChange={(e) =>
                                    field.onChange(
                                      e.target.value ? parseInt(e.target.value) : undefined,
                                    )
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="md:col-span-8">
                        <FormField
                          control={form.control}
                          name={`achievements.${index}.description`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Mô tả</FormLabel>
                              <FormControl>
                                <Textarea {...field} className="shadow-none" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="md:col-span-4">
                        <FormField
                          control={form.control}
                          name={`achievements.${index}.link`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Link (nếu có)</FormLabel>
                              <FormControl>
                                <Input placeholder="https://..." {...field} className="shadow-none" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  ))}
                  {achievementFields.length === 0 && (
                    <div className="text-center py-8 border-2 border-dashed rounded-lg text-muted-foreground">
                      Chưa có thành tích nào
                    </div>
                  )}
                </div>
              </div>
            )}

            {currentStep === 7 && (
              <div>
                <div className="flex items-center justify-end mb-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="cursor-pointer"
                    onClick={() => appendContact({ type: "github", value: "" })}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Thêm
                  </Button>
                </div>
                <div className="space-y-4">
                  {contactFields.map((field, index) => (
                    <div
                      key={field.id}
                      className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border rounded-md relative group"
                    >
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-2 h-6 w-6 text-muted-foreground hover:text-destructive"
                        onClick={() => removeContact(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <div className="md:col-span-4">
                        <FormField
                          control={form.control}
                          name={`contacts.${index}.type`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Loại <span className="text-destructive">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="email, github, linkedin, website, facebook"
                                  {...field}
                                  className="shadow-none"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="md:col-span-8">
                        <FormField
                          control={form.control}
                          name={`contacts.${index}.value`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Giá trị <span className="text-destructive">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input placeholder="https://github.com/username" {...field} className="shadow-none" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  ))}
                  {contactFields.length === 0 && (
                    <div className="text-center py-8 border-2 border-dashed rounded-lg text-muted-foreground">
                      Chưa có thông tin liên hệ
                    </div>
                  )}
                </div>
              </div>
            )}

            {currentStep === 8 && (
              <div className="space-y-4">
                <div className="rounded-xl border border-[#e8e2dc] bg-[#fdfbf9] p-5">
                  <h4 className="text-sm font-semibold text-stone-950">
                    Cơ bản
                  </h4>
                  <dl className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <dt className="text-xs text-muted-foreground">Họ và tên</dt>
                      <dd className="text-sm font-medium text-stone-800">
                        {watchedValues.fullName || "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">Slug</dt>
                      <dd className="text-sm font-medium text-stone-800">
                        /{watchedValues.slug || "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">Chương trình</dt>
                      <dd className="text-sm font-medium text-stone-800">
                        {watchedValues.program || "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">Trạng thái</dt>
                      <dd className="text-sm font-medium text-stone-800">
                        {watchedValues.isPublished ? "Công khai" : "Bản nháp"}
                      </dd>
                    </div>
                  </dl>
                  {avatarUpload.preview && (
                    <div className="relative mt-4 h-24 w-24 overflow-hidden rounded-full border">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={avatarUpload.preview}
                        alt="Avatar preview"
                        className="h-full w-full object-cover"
                      />
                      <ImageUploadOverlay show={avatarUpload.isUploading} compact />
                    </div>
                  )}
                </div>

                <div className="rounded-xl border border-[#e8e2dc] bg-[#fdfbf9] p-5">
                  <h4 className="text-sm font-semibold text-stone-950">
                    Nội dung portfolio
                  </h4>
                  <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <div>
                      <dt className="text-xs text-muted-foreground">Kỹ năng</dt>
                      <dd className="text-sm font-medium text-stone-800">
                        {skillFields.length} mục
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">Dự án</dt>
                      <dd className="text-sm font-medium text-stone-800">
                        {projectFields.length} mục
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">Kinh nghiệm</dt>
                      <dd className="text-sm font-medium text-stone-800">
                        {experienceFields.length} mục
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">Học vấn</dt>
                      <dd className="text-sm font-medium text-stone-800">
                        {educationFields.length} mục
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">Thành tích</dt>
                      <dd className="text-sm font-medium text-stone-800">
                        {achievementFields.length} mục
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">Liên hệ</dt>
                      <dd className="text-sm font-medium text-stone-800">
                        {contactFields.length} mục
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            )}
          </StepWizard>
        </form>
      </Form>
    </div>
  );
}
