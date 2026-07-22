"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { Loader2, X, Plus, Trash2 } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { WizardPageHeader } from "@/components/wizard/wizard-page-header";
import { EditPageCard } from "@/components/wizard/edit-page-card";
import { ImageUploadOverlay } from "@/components/ui/image-upload-overlay";
import { useToast } from "@/hooks/use-toast";
import { useImageUpload } from "@/hooks/use-image-upload";
import { FormLoading } from "@/components/shared/LoadingStates";
import { api, Course, CreateFacultyDto } from "@/lib/api";
import { slugify } from "@/lib/utils";

interface FacultyFormData extends CreateFacultyDto {
  avatarUrl?: string;
}

function buildFacultyPayload(
  values: FacultyFormData,
  avatarUrl?: string,
): CreateFacultyDto {
  return {
    fullName: values.fullName,
    slug: values.slug,
    avatarUrl,
    academicTitle: values.academicTitle,
    position: values.position,
    department: values.department,
    quote: values.quote,
    bioShort: values.bioShort,
    isActive: values.isActive,
    academicTimeline: values.academicTimeline?.map((item) => ({
      degree: item.degree,
      field: item.field,
      institution: item.institution,
      country: item.country,
      startYear: item.startYear,
      endYear: item.endYear,
      description: item.description,
      displayOrder: item.displayOrder,
    })),
    researchAreas: values.researchAreas?.map((item) => ({
      title: item.title,
      description: item.description,
      displayOrder: item.displayOrder,
    })),
    publications: values.publications?.map((item) => ({
      title: item.title,
      venue: item.venue,
      year: item.year,
      publicationType: item.publicationType,
      doi: item.doi,
      publisherUrl: item.publisherUrl || undefined,
      displayOrder: item.displayOrder,
    })),
    courses: values.courses
      ?.filter((item) => item.courseId)
      .map((item) => ({ courseId: item.courseId })),
    contacts: values.contacts?.map((item) => ({
      type: item.type,
      value: item.value,
      visibility: item.visibility,
    })),
    meta: values.meta
      ? {
          profileVisibility: values.meta.profileVisibility,
          updatedBy: values.meta.updatedBy,
        }
      : undefined,
  };
}

export default function FacultyFormPage({ facultyId }: { facultyId?: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isFetching, setIsFetching] = useState(Boolean(facultyId));

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await api.courses.findAll();
        setCourses(data);
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      }
    };
    fetchCourses();
  }, []);

  const form = useForm<FacultyFormData>({
    defaultValues: {
      fullName: "",
      slug: "",
      avatarUrl: "",
      academicTitle: "",
      position: "",
      department: "Khoa Công nghệ Thông tin",
      quote: "",
      bioShort: "",
      isActive: true,
      academicTimeline: [],
      researchAreas: [],
      publications: [],
      courses: [],
      contacts: [],
      meta: {
        profileVisibility: "public",
        updatedBy: "",
      },
    },
  });

  const avatarUpload = useImageUpload({
    folder: "faculty",
    onUploaded: (url) => form.setValue("avatarUrl", url),
  });

  useEffect(() => {
    if (!facultyId) return;

    const fetchFaculty = async () => {
      try {
        setIsFetching(true);
        const faculty = await api.faculty.findOne(facultyId);
        form.reset({
          ...faculty,
          avatarUrl: faculty.avatarUrl || "",
          academicTimeline: faculty.academicTimeline || [],
          researchAreas: faculty.researchAreas || [],
          publications: faculty.publications || [],
          courses: faculty.courses || [],
          contacts: faculty.contacts || [],
          meta: faculty.meta || {
            profileVisibility: "public",
            updatedBy: "",
          },
        });
        avatarUpload.setPreview(faculty.avatarUrl || "");
      } catch (error) {
        console.error("Failed to fetch faculty:", error);
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: "Không thể tải hồ sơ giảng viên.",
        });
        router.push("/faculty");
      } finally {
        setIsFetching(false);
      }
    };

    fetchFaculty();
  }, [facultyId, form, router, toast]);

  const {
    fields: timelineFields,
    append: appendTimeline,
    remove: removeTimeline,
  } = useFieldArray({
    control: form.control,
    name: "academicTimeline",
  });

  const {
    fields: researchFields,
    append: appendResearch,
    remove: removeResearch,
  } = useFieldArray({
    control: form.control,
    name: "researchAreas",
  });

  const {
    fields: publicationFields,
    append: appendPublication,
    remove: removePublication,
  } = useFieldArray({
    control: form.control,
    name: "publications",
  });

  const {
    fields: courseFields,
    append: appendCourse,
    remove: removeCourse,
  } = useFieldArray({
    control: form.control,
    name: "courses",
  });

  const {
    fields: contactFields,
    append: appendContact,
    remove: removeContact,
  } = useFieldArray({
    control: form.control,
    name: "contacts",
  });

  async function onSubmit(values: FacultyFormData) {
    const { id, update } = toast({
      title: "Đang tạo hồ sơ...",
      description: "Vui lòng chờ trong giây lát.",
      duration: Infinity,
    });

    try {
      setIsLoading(true);

      const payload = buildFacultyPayload(values, values.avatarUrl || undefined);

      if (facultyId) {
        await api.faculty.update(facultyId, payload);
      } else {
        await api.faculty.create(payload);
      }

      update({
        id,
        title: "Thành công",
        description: facultyId
          ? "Hồ sơ giảng viên đã được cập nhật."
          : "Hồ sơ giảng viên đã được tạo thành công.",
        variant: "default",
        duration: 3000,
      });

      router.push("/faculty");
    } catch (error) {
      console.error(error);
      update({
        id,
        title: "Lỗi",
        description:
          error instanceof Error ? error.message : "Không thể tạo hồ sơ",
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
        eyebrow="Giảng viên"
        title={facultyId ? "Chỉnh sửa Giảng viên" : "Thêm Giảng viên"}
        description="Cập nhật hồ sơ giảng viên."
        onCancel={() => router.push("/faculty")}
      />

      <EditPageCard>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 h-auto">
                  <TabsTrigger value="general">Cơ bản</TabsTrigger>
                  <TabsTrigger value="education">Học vấn</TabsTrigger>
                  <TabsTrigger value="research">Nghiên cứu</TabsTrigger>
                  <TabsTrigger value="publications">Công bố</TabsTrigger>
                  <TabsTrigger value="teaching">Giảng dạy</TabsTrigger>
                  <TabsTrigger value="contacts">Liên hệ</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-6 mt-6">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Họ và tên *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Nguyễn Văn A"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                const slug = slugify(e.target.value);
                                form.setValue("slug", slug);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="academicTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Học hàm / Học vị</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Chọn học hàm/học vị" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="CN">CN (Cử nhân)</SelectItem>
                              <SelectItem value="KS">KS (Kỹ sư)</SelectItem>
                              <SelectItem value="ThS">ThS (Thạc sĩ)</SelectItem>
                              <SelectItem value="TS">TS (Tiến sĩ)</SelectItem>
                              <SelectItem value="PGS.TS">
                                PGS.TS (Phó Giáo sư, Tiến sĩ)
                              </SelectItem>
                              <SelectItem value="GS.TS">
                                GS.TS (Giáo sư, Tiến sĩ)
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="position"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Chức vụ</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Trưởng Khoa / Giảng viên"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="department"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Khoa / Bộ môn</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Khoa Công nghệ Thông tin"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Trạng thái hoạt động
                            </FormLabel>
                            <FormDescription>
                              Giảng viên có đang hoạt động không?
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
                        name="quote"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Triết lý / Phương châm</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Học tập suốt đời..."
                                className="resize-none"
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
                        name="bioShort"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Giới thiệu ngắn (2-3 câu)</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Tiến sĩ chuyên ngành Khoa học Máy tính với hơn 10 năm kinh nghiệm giảng dạy..."
                                className="min-h-[100px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="education" className="space-y-6 mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">Quá trình học tập</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        appendTimeline({
                          degree: "",
                          field: "",
                          institution: "",
                          country: "",
                        })
                      }
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Thêm
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {timelineFields.map((field, index) => (
                      <div
                        key={field.id}
                        className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border rounded-md relative group"
                      >
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-2 h-6 w-6 text-muted-foreground hover:text-destructive"
                          onClick={() => removeTimeline(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <div className="md:col-span-3">
                          <FormField
                            control={form.control}
                            name={`academicTimeline.${index}.degree`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Bằng cấp</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Chọn" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="BSc">
                                      BSc (Cử nhân)
                                    </SelectItem>
                                    <SelectItem value="MSc">
                                      MSc (Thạc sĩ)
                                    </SelectItem>
                                    <SelectItem value="PhD">
                                      PhD (Tiến sĩ)
                                    </SelectItem>
                                    <SelectItem value="PostDoc">
                                      PostDoc (Sau tiến sĩ)
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="md:col-span-5">
                          <FormField
                            control={form.control}
                            name={`academicTimeline.${index}.field`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Chuyên ngành</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Khoa học Máy tính"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="md:col-span-4">
                          <FormField
                            control={form.control}
                            name={`academicTimeline.${index}.institution`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Trường / Viện</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Đại học Bách Khoa"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="md:col-span-4">
                          <FormField
                            control={form.control}
                            name={`academicTimeline.${index}.country`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Quốc gia</FormLabel>
                                <FormControl>
                                  <Input placeholder="Việt Nam" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="md:col-span-4">
                          <FormField
                            control={form.control}
                            name={`academicTimeline.${index}.startYear`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Năm bắt đầu</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="2015"
                                    {...field}
                                    value={field.value || ""}
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
                        <div className="md:col-span-4">
                          <FormField
                            control={form.control}
                            name={`academicTimeline.${index}.endYear`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Năm kết thúc</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="2019"
                                    {...field}
                                    value={field.value || ""}
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
                    {timelineFields.length === 0 && (
                      <div className="text-center py-8 border-2 border-dashed rounded-lg text-muted-foreground">
                        Chưa có thông tin học vấn
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="research" className="space-y-6 mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">Lĩnh vực nghiên cứu</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        appendResearch({ title: "", description: "" })
                      }
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Thêm
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {researchFields.map((field, index) => (
                      <div
                        key={field.id}
                        className="grid grid-cols-1 gap-4 p-4 border rounded-md relative group"
                      >
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-2 h-6 w-6 text-muted-foreground hover:text-destructive"
                          onClick={() => removeResearch(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <FormField
                          control={form.control}
                          name={`researchAreas.${index}.title`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tên lĩnh vực</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Trí tuệ nhân tạo"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`researchAreas.${index}.description`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Mô tả</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Nghiên cứu về học máy, xử lý ngôn ngữ tự nhiên..."
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    ))}
                    {researchFields.length === 0 && (
                      <div className="text-center py-8 border-2 border-dashed rounded-lg text-muted-foreground">
                        Chưa có lĩnh vực nghiên cứu
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="publications" className="space-y-6 mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">Công bố khoa học</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        appendPublication({
                          title: "",
                          venue: "",
                          publicationType: "journal",
                        })
                      }
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Thêm
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {publicationFields.map((field, index) => (
                      <div
                        key={field.id}
                        className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border rounded-md relative group"
                      >
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-2 h-6 w-6 text-muted-foreground hover:text-destructive"
                          onClick={() => removePublication(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <div className="md:col-span-12">
                          <FormField
                            control={form.control}
                            name={`publications.${index}.title`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Tiêu đề bài báo</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Deep Learning for Natural Language Processing"
                                    {...field}
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
                            name={`publications.${index}.venue`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Tạp chí / Hội nghị</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="IEEE Transactions on..."
                                    {...field}
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
                            name={`publications.${index}.publicationType`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Loại</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Chọn" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="journal">
                                      Tạp chí
                                    </SelectItem>
                                    <SelectItem value="conference">
                                      Hội nghị
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="md:col-span-3">
                          <FormField
                            control={form.control}
                            name={`publications.${index}.year`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Năm</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="2023"
                                    {...field}
                                    value={field.value || ""}
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
                        <div className="md:col-span-6">
                          <FormField
                            control={form.control}
                            name={`publications.${index}.doi`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>DOI</FormLabel>
                                <FormControl>
                                  <Input placeholder="10.1109/..." {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="md:col-span-6">
                          <FormField
                            control={form.control}
                            name={`publications.${index}.publisherUrl`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Link bài báo</FormLabel>
                                <FormControl>
                                  <Input placeholder="https://..." {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    ))}
                    {publicationFields.length === 0 && (
                      <div className="text-center py-8 border-2 border-dashed rounded-lg text-muted-foreground">
                        Chưa có công bố khoa học
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="teaching" className="space-y-6 mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">Môn học giảng dạy</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => appendCourse({ courseId: "" })}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Thêm
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {courseFields.map((field, index) => (
                      <div
                        key={field.id}
                        className="flex items-center gap-4 p-4 border rounded-md relative group"
                      >
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-2 h-6 w-6 text-muted-foreground hover:text-destructive"
                          onClick={() => removeCourse(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <div className="flex-1">
                          <FormField
                            control={form.control}
                            name={`courses.${index}.courseId`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Môn học</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Chọn môn học" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {courses.map((course) => (
                                      <SelectItem
                                        key={course.courseId}
                                        value={course.courseId}
                                      >
                                        {course.code} - {course.nameVi}
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
                    ))}
                    {courseFields.length === 0 && (
                      <div className="text-center py-8 border-2 border-dashed rounded-lg text-muted-foreground">
                        Chưa có môn học giảng dạy
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="contacts" className="space-y-6 mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">Thông tin liên hệ</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        appendContact({
                          type: "email",
                          value: "",
                          visibility: "public",
                        })
                      }
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
                        <div className="md:col-span-3">
                          <FormField
                            control={form.control}
                            name={`contacts.${index}.type`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Loại</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Chọn" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="email">Email</SelectItem>
                                    <SelectItem value="phone">
                                      Điện thoại
                                    </SelectItem>
                                    <SelectItem value="scholar">
                                      Google Scholar
                                    </SelectItem>
                                    <SelectItem value="linkedin">
                                      LinkedIn
                                    </SelectItem>
                                    <SelectItem value="researchgate">
                                      ResearchGate
                                    </SelectItem>
                                    <SelectItem value="orcid">ORCID</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="md:col-span-6">
                          <FormField
                            control={form.control}
                            name={`contacts.${index}.value`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Giá trị</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="email@example.com"
                                    {...field}
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
                            name={`contacts.${index}.visibility`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Hiển thị</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value || "public"}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Chọn" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="public">
                                      Công khai
                                    </SelectItem>
                                    <SelectItem value="internal">
                                      Nội bộ
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
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
                </TabsContent>
              </Tabs>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  className="cursor-pointer"
                  onClick={() => router.push("/faculty")}
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
                  {facultyId ? "Lưu thay đổi" : "Tạo Giảng viên"}
                </Button>
              </div>
            </form>
          </Form>
      </EditPageCard>
    </div>
  );
}
