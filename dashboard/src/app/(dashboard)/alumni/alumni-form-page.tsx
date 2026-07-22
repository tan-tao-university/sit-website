"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, type Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Plus, Trash2 } from "lucide-react";

import { useAlumniWizardStore } from "@/store/alumni-wizard-store";
import { StepWizard } from "@/components/wizard/step-wizard";
import { WizardPageHeader } from "@/components/wizard/wizard-page-header";
import { ImageUploadOverlay } from "@/components/ui/image-upload-overlay";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreateSectionDialog } from "@/components/alumni/CreateSectionDialog";
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
import { Textarea } from "@/components/ui/textarea";
import { FormLoading } from "@/components/shared/LoadingStates";
import { useToast } from "@/hooks/use-toast";
import { useImageUpload } from "@/hooks/use-image-upload";
import { api, AlumniSection } from "@/lib/api";
import { slugify } from "@/lib/utils";
import { AlumniFormData, alumniFormSchema } from "@/lib/form-validation";

const STEPS = [
  { id: 1, title: "Cơ bản", description: "Thông tin cơ bản của cựu sinh viên." },
  { id: 2, title: "Học vấn", description: "Chuyên ngành, nghiên cứu và luận văn." },
  { id: 3, title: "Sự nghiệp", description: "Kinh nghiệm làm việc." },
  { id: 4, title: "Thành tựu", description: "Các thành tựu đã đạt được." },
  { id: 5, title: "Liên hệ", description: "Thông tin liên hệ, mạng xã hội." },
  { id: 6, title: "Khác", description: "Cài đặt hiển thị và section liên kết." },
  {
    id: 7,
    title: "Xem lại & hoàn tất",
    description: "Kiểm tra lại toàn bộ thông tin trước khi hoàn tất.",
  },
] as const;

const STEP_FIELDS: Record<number, Path<AlumniFormData>[]> = {
  1: [
    "fullName",
    "slug",
    "program",
    "degree",
    "graduationYear",
    "avatarUrl",
    "shortBio",
    "personalStory",
  ],
  2: [
    "academicProfile.major",
    "academicProfile.researchArea",
    "academicProfile.advisor",
    "academicProfile.thesisTitle",
    "academicProfile.honors",
    "academicProfile.notes",
  ],
  3: ["careers"],
  4: ["achievements"],
  5: ["contacts"],
  6: ["meta.visibility", "meta.verifiedBy", "sectionMembers"],
  7: [],
};

const DEFAULT_VALUES: AlumniFormData = {
  fullName: "",
  slug: "",
  graduationYear: undefined,
  program: "",
  degree: "",
  shortBio: "",
  personalStory: "",
  careers: [],
  contacts: [],
  achievements: [],
  sectionMembers: [],
  meta: {
    visibility: "public",
    verifiedBy: "",
  },
  academicProfile: {
    major: "",
    researchArea: "",
    advisor: "",
    thesisTitle: "",
    honors: "",
    notes: "",
  },
};

export default function AlumniFormPage({ alumniId }: { alumniId?: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const isEditing = Boolean(alumniId);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(isEditing);
  const [sections, setSections] = useState<AlumniSection[]>([]);
  const currentStep = useAlumniWizardStore((state) => state.currentStep);
  const setTotalSteps = useAlumniWizardStore((state) => state.setTotalSteps);
  const storeGoNext = useAlumniWizardStore((state) => state.goNext);
  const storeGoBack = useAlumniWizardStore((state) => state.goBack);
  const resetWizard = useAlumniWizardStore((state) => state.reset);

  const form = useForm<AlumniFormData>({
    resolver: zodResolver(alumniFormSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const avatarUpload = useImageUpload({
    folder: "alumni",
    onUploaded: (url) => form.setValue("avatarUrl", url),
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sectionsData, alumniData] = await Promise.all([
          api.alumniSections.findAll(),
          alumniId ? api.alumni.findOne(alumniId) : Promise.resolve(undefined),
        ]);

        setSections(sectionsData);

        if (alumniData) {
          form.reset({
            fullName: alumniData.fullName,
            slug: alumniData.slug,
            program: alumniData.program || "",
            degree: alumniData.degree || "",
            graduationYear: alumniData.graduationYear,
            avatarUrl: alumniData.avatarUrl || "",
            shortBio: alumniData.shortBio || "",
            personalStory: alumniData.personalStory || "",
            careers: alumniData.careers || [],
            contacts: alumniData.contacts || [],
            achievements: alumniData.achievements || [],
            sectionMembers: alumniData.sectionMembers || [],
            meta: alumniData.meta || { visibility: "public", verifiedBy: "" },
            academicProfile: {
              major: alumniData.academicProfile?.major || "",
              researchArea: alumniData.academicProfile?.researchArea || "",
              advisor: alumniData.academicProfile?.advisor || "",
              thesisTitle: alumniData.academicProfile?.thesisTitle || "",
              honors: alumniData.academicProfile?.honors || "",
              notes: alumniData.academicProfile?.notes || "",
            },
          });

          if (alumniData.avatarUrl) {
            avatarUpload.setPreview(alumniData.avatarUrl);
          }
        }
      } catch (error) {
        console.error("Failed to fetch alumni data:", error);
        if (alumniId) {
          toast({
            variant: "destructive",
            title: "Lỗi",
            description: "Không thể tải thông tin cựu sinh viên.",
          });
          router.push("/alumni");
        }
      } finally {
        setIsFetching(false);
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alumniId]);

  const {
    fields: careerFields,
    append: appendCareer,
    remove: removeCareer,
  } = useFieldArray({
    control: form.control,
    name: "careers",
  });

  const {
    fields: contactFields,
    append: appendContact,
    remove: removeContact,
  } = useFieldArray({
    control: form.control,
    name: "contacts",
  });

  const {
    fields: achievementFields,
    append: appendAchievement,
    remove: removeAchievement,
  } = useFieldArray({
    control: form.control,
    name: "achievements",
  });

  const {
    fields: sectionFields,
    append: appendSection,
    remove: removeSection,
  } = useFieldArray({
    control: form.control,
    name: "sectionMembers",
  });

  async function goNext() {
    if (currentStep === 1) {
      if (avatarUpload.isUploading) {
        toast({
          title: "Đang tải ảnh lên",
          description: "Vui lòng đợi ảnh đại diện tải lên xong.",
          variant: "destructive",
          duration: 3000,
        });
        return;
      }
      if (!form.getValues("avatarUrl")) {
        toast({
          title: "Thiếu ảnh đại diện",
          description: "Vui lòng chọn ảnh đại diện cho cựu sinh viên.",
          variant: "destructive",
          duration: 4000,
        });
        return;
      }
    }
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

  async function onSubmit(values: AlumniFormData) {
    if (!values.avatarUrl) {
      toast({
        title: "Thiếu ảnh đại diện",
        description: "Vui lòng chọn ảnh đại diện cho cựu sinh viên.",
        variant: "destructive",
        duration: 5000,
      });
      return;
    }

    const { id: toastId, update } = toast({
      title: isEditing ? "Đang cập nhật..." : "Đang tạo hồ sơ...",
      description: "Vui lòng chờ trong giây lát.",
      duration: Infinity,
    });

    try {
      setIsLoading(true);

      if (isEditing && alumniId) {
        await api.alumni.update(alumniId, values);
      } else {
        await api.alumni.create(values);
      }

      update({
        id: toastId,
        title: "Thành công",
        description: isEditing
          ? "Hồ sơ cựu sinh viên đã được cập nhật thành công."
          : "Hồ sơ cựu sinh viên đã được tạo thành công.",
        variant: "default",
        duration: 3000,
      });

      router.push("/alumni");
    } catch (error) {
      console.error(error);
      update({
        id: toastId,
        title: "Lỗi",
        description:
          error instanceof Error
            ? error.message
            : isEditing
              ? "Không thể cập nhật hồ sơ"
              : "Không thể tạo hồ sơ",
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
        eyebrow="Cựu sinh viên"
        title={isEditing ? "Chỉnh sửa Cựu sinh viên" : "Thêm Cựu sinh viên"}
        description={
          isEditing
            ? "Cập nhật hồ sơ cựu sinh viên."
            : "Hoàn thành từng bước để thêm hồ sơ cựu sinh viên mới."
        }
        onCancel={() => router.push("/alumni")}
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
            submitLabel={isEditing ? "Lưu thay đổi" : "Tạo Cựu sinh viên"}
            confirmTitle={
              isEditing
                ? "Xác nhận cập nhật hồ sơ cựu sinh viên"
                : "Xác nhận tạo hồ sơ cựu sinh viên"
            }
            confirmDescription="Bạn có chắc chắn muốn lưu hồ sơ này? Vui lòng kiểm tra lại thông tin trước khi xác nhận."
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
                          placeholder="Nguyễn Văn A"
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
                  name="degree"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Học vị</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Cử nhân / Thạc sĩ"
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
                  name="graduationYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Năm tốt nghiệp</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="2024"
                          {...field}
                          value={field.value || ""}
                          className="shadow-none"
                          onChange={(e) =>
                            field.onChange(
                              e.target.value
                                ? parseInt(e.target.value)
                                : undefined,
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
                  name="avatarUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Ảnh đại diện{" "}
                        <span className="text-destructive">*</span>
                      </FormLabel>
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
                        <FormLabel>Giới thiệu ngắn (1-2 câu)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Kỹ sư phần mềm tại Google..."
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
                    name="personalStory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Câu chuyện cá nhân</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Chia sẻ về hành trình..."
                            className="min-h-[150px] shadow-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="academicProfile.major"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chuyên ngành</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Khoa học dữ liệu"
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
                  name="academicProfile.researchArea"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lĩnh vực nghiên cứu</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="AI, NLP..."
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
                  name="academicProfile.advisor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Người hướng dẫn</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="TS. ..."
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
                  name="academicProfile.thesisTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Đề tài luận văn</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nghiên cứu..."
                          {...field}
                          className="shadow-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name="academicProfile.honors"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Giải thưởng / Học bổng</FormLabel>
                        <FormControl>
                          <Textarea placeholder="..." {...field} className="shadow-none" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name="academicProfile.notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ghi chú thêm</FormLabel>
                        <FormControl>
                          <Textarea placeholder="..." {...field} className="shadow-none" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                    onClick={() => appendCareer({ organization: "", role: "" })}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Thêm
                  </Button>
                </div>
                <div className="space-y-4">
                  {careerFields.map((field, index) => (
                    <div
                      key={field.id}
                      className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border rounded-md relative group"
                    >
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-2 h-6 w-6 text-muted-foreground hover:text-destructive"
                        onClick={() => removeCareer(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <div className="md:col-span-6">
                        <FormField
                          control={form.control}
                          name={`careers.${index}.organization`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Tổ chức{" "}
                                <span className="text-destructive">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input placeholder="Google" {...field} className="shadow-none" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="md:col-span-6">
                        <FormField
                          control={form.control}
                          name={`careers.${index}.role`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Vai trò <span className="text-destructive">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Software Engineer"
                                  {...field}
                                  className="shadow-none"
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
                          name={`careers.${index}.startYear`}
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
                                      e.target.value
                                        ? parseInt(e.target.value)
                                        : undefined,
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
                          name={`careers.${index}.endYear`}
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
                                      e.target.value
                                        ? parseInt(e.target.value)
                                        : undefined,
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
                  {careerFields.length === 0 && (
                    <div className="text-center py-8 border-2 border-dashed rounded-lg text-muted-foreground">
                      Chưa có kinh nghiệm làm việc
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
                    onClick={() => appendAchievement({})}
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
                              <FormLabel>Tên thành tựu</FormLabel>
                              <FormControl>
                                <Input placeholder="Giải nhất..." {...field} className="shadow-none" />
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
                                      e.target.value
                                        ? parseInt(e.target.value)
                                        : undefined,
                                    )
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="md:col-span-12">
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
                    </div>
                  ))}
                  {achievementFields.length === 0 && (
                    <div className="text-center py-8 border-2 border-dashed rounded-lg text-muted-foreground">
                      Chưa có thành tựu nào
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
                    onClick={() => appendContact({ type: "linkedin" })}
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
                                  placeholder="linkedin, email..."
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
                          name={`contacts.${index}.url`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Liên kết / Giá trị</FormLabel>
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
                  {contactFields.length === 0 && (
                    <div className="text-center py-8 border-2 border-dashed rounded-lg text-muted-foreground">
                      Chưa có thông tin liên hệ
                    </div>
                  )}
                </div>
              </div>
            )}

            {currentStep === 6 && (
              <div className="space-y-6">
                <div className="space-y-4 border p-4 rounded-md">
                  <h3 className="font-medium">Cài đặt Meta</h3>
                  <FormField
                    control={form.control}
                    name="meta.visibility"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hiển thị hồ sơ</FormLabel>
                        <FormControl>
                          <Input placeholder="public / internal" {...field} className="shadow-none" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="meta.verifiedBy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Được xác thực bởi</FormLabel>
                        <FormControl>
                          <Input {...field} className="shadow-none" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">Thành viên Section</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="cursor-pointer"
                      onClick={() => appendSection({ sectionId: "" })}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Thêm
                    </Button>
                  </div>
                  {sectionFields.map((field, index) => (
                    <div
                      key={field.id}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-md relative"
                    >
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-2 h-6 w-6 text-muted-foreground hover:text-destructive"
                        onClick={() => removeSection(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <FormField
                        control={form.control}
                        name={`sectionMembers.${index}.sectionId`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Section</FormLabel>
                            <div className="flex gap-2">
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="flex-1 shadow-none">
                                    <SelectValue placeholder="Chọn một section..." />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {sections.map((section) => (
                                    <SelectItem
                                      key={section.id}
                                      value={section.id}
                                    >
                                      {section.titleVi || section.titleEn}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <CreateSectionDialog
                                onSuccess={(newSection) => {
                                  setSections([...sections, newSection]);
                                  field.onChange(newSection.id);
                                }}
                              />
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`sectionMembers.${index}.customTitle`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tiêu đề tùy chỉnh</FormLabel>
                            <FormControl>
                              <Input {...field} className="shadow-none" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 7 && (
              <div className="space-y-4">
                <div className="rounded-xl border border-[#e8e2dc] bg-[#fdfbf9] p-5">
                  <h4 className="text-sm font-semibold text-stone-950">
                    Cơ bản
                  </h4>
                  <dl className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <dt className="text-xs text-muted-foreground">
                        Họ và tên
                      </dt>
                      <dd className="text-sm font-medium text-stone-800">
                        {watchedValues.fullName || "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">Slug</dt>
                      <dd className="text-sm font-medium text-stone-800">
                        {watchedValues.slug || "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">
                        Chương trình
                      </dt>
                      <dd className="text-sm font-medium text-stone-800">
                        {watchedValues.program || "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">
                        Năm tốt nghiệp
                      </dt>
                      <dd className="text-sm font-medium text-stone-800">
                        {watchedValues.graduationYear || "—"}
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
                    Sự nghiệp, thành tựu & liên hệ
                  </h4>
                  <dl className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div>
                      <dt className="text-xs text-muted-foreground">
                        Kinh nghiệm làm việc
                      </dt>
                      <dd className="text-sm font-medium text-stone-800">
                        {careerFields.length} mục
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">
                        Thành tựu
                      </dt>
                      <dd className="text-sm font-medium text-stone-800">
                        {achievementFields.length} mục
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">
                        Liên hệ
                      </dt>
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
