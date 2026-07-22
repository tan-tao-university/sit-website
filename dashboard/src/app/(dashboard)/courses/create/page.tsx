"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { useCourseWizardStore } from "@/store/course-wizard-store";
import { StepWizard } from "@/components/wizard/step-wizard";
import { WizardPageHeader } from "@/components/wizard/wizard-page-header";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { api, CreateCourseDto } from "@/lib/api";
import { slugify } from "@/lib/utils";

const STEPS = [
  {
    id: 1,
    title: "Thông tin cơ bản",
    description: "Mã học phần, tên và số tín chỉ.",
  },
  {
    id: 2,
    title: "Giờ học",
    description: "Số giờ lý thuyết và thực hành.",
  },
  {
    id: 3,
    title: "Xem lại & hoàn tất",
    description: "Kiểm tra lại toàn bộ thông tin trước khi tạo.",
  },
] as const;

const formSchema = z.object({
  code: z.string().min(1, "Mã học phần là bắt buộc"),
  nameVi: z.string().min(1, "Tên tiếng Việt là bắt buộc"),
  nameEn: z.string().optional(),
  slugVi: z.string().min(1, "Slug (Tiếng Việt) là bắt buộc"),
  slugEn: z.string().min(1, "Slug (Tiếng Anh) là bắt buộc"),
  credits: z.coerce
    .number()
    .int("Số tín chỉ phải là số nguyên")
    .min(0, "Số tín chỉ phải lớn hơn hoặc bằng 0"),
  lectureHours: z.coerce
    .number()
    .int("Giờ lý thuyết phải là số nguyên")
    .min(0)
    .optional(),
  practiceHours: z.coerce
    .number()
    .int("Giờ thực hành phải là số nguyên")
    .min(0)
    .optional(),
});

type FormData = z.infer<typeof formSchema>;

const STEP_FIELDS: Record<number, (keyof FormData)[]> = {
  1: ["code", "nameVi", "nameEn", "slugVi", "slugEn", "credits"],
  2: ["lectureHours", "practiceHours"],
  3: [],
};

export default function CreateCoursePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const currentStep = useCourseWizardStore((state) => state.currentStep);
  const setTotalSteps = useCourseWizardStore((state) => state.setTotalSteps);
  const storeGoNext = useCourseWizardStore((state) => state.goNext);
  const storeGoBack = useCourseWizardStore((state) => state.goBack);
  const resetWizard = useCourseWizardStore((state) => state.reset);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
      nameVi: "",
      nameEn: "",
      slugVi: "",
      slugEn: "",
      credits: 0,
    },
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
      title: "Đang tạo khoá học...",
      description: "Vui lòng chờ trong giây lát.",
      duration: Infinity,
    });

    try {
      setIsLoading(true);
      await api.courses.create(values as CreateCourseDto);
      update({
        id,
        title: "Thành công",
        description: "Tạo khoá học mới thành công",
        variant: "default",
        duration: 3000,
      });
      router.push("/courses");
    } catch (error) {
      update({
        id,
        variant: "destructive",
        title: "Lỗi",
        description:
          error instanceof Error ? error.message : "Không thể tạo khoá học",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5 p-8 pt-6 dashboard-reveal">
      <WizardPageHeader
        eyebrow="Học phần"
        title="Thêm khoá học"
        description="Hoàn thành từng bước để tạo mới một học phần trong hệ thống."
        onCancel={() => router.push("/courses")}
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
            submitLabel="Tạo mới"
            confirmTitle="Xác nhận tạo khoá học"
            confirmDescription="Bạn có chắc chắn muốn tạo khoá học này? Vui lòng kiểm tra lại thông tin trước khi xác nhận."
            onBack={storeGoBack}
            onNext={goNext}
          >
            {currentStep === 1 && (
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Mã học phần <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="CS101" {...field} className="shadow-none" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="credits"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Số tín chỉ <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input type="number" {...field} className="shadow-none" />
                      </FormControl>
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
                        Tên tiếng Việt <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nhập môn Lập trình"
                          {...field}
                          className="shadow-none"
                          onChange={(e) => {
                            field.onChange(e);
                            const slug = slugify(e.target.value);
                            form.setValue("slugVi", slug);
                            if (!form.getValues("nameEn")) {
                              form.setValue("slugEn", slug);
                            }
                          }}
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
                      <FormLabel>Tên tiếng Anh (Tuỳ chọn)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Introduction to Programming"
                          {...field}
                          className="shadow-none"
                          onChange={(e) => {
                            field.onChange(e);
                            form.setValue("slugEn", slugify(e.target.value));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

              </div>
            )}

            {currentStep === 2 && (
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="lectureHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Giờ lý thuyết (LT)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} className="shadow-none" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="practiceHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Giờ thực hành (TH)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} className="shadow-none" />
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
                    Thông tin học phần
                  </h4>
                  <dl className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div>
                      <dt className="text-xs text-muted-foreground">
                        Mã học phần
                      </dt>
                      <dd className="text-sm font-medium text-stone-800">
                        {watchedValues.code || "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">
                        Số tín chỉ
                      </dt>
                      <dd className="text-sm font-medium text-stone-800">
                        {watchedValues.credits ?? "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">
                        Tên tiếng Việt
                      </dt>
                      <dd className="text-sm font-medium text-stone-800">
                        {watchedValues.nameVi || "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">
                        Tên tiếng Anh
                      </dt>
                      <dd className="text-sm font-medium text-stone-800">
                        {watchedValues.nameEn || "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">
                        Giờ lý thuyết
                      </dt>
                      <dd className="text-sm font-medium text-stone-800">
                        {watchedValues.lectureHours ?? "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">
                        Giờ thực hành
                      </dt>
                      <dd className="text-sm font-medium text-stone-800">
                        {watchedValues.practiceHours ?? "—"}
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
