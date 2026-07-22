"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { useAchievementWizardStore } from "@/store/achievement-wizard-store";
import { StepWizard } from "@/components/wizard/step-wizard";
import { WizardPageHeader } from "@/components/wizard/wizard-page-header";
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
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import {
  api,
  AchievementType,
  AchievementVisibility,
} from "@/lib/api";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/ui/image-upload";

const STEPS = [
  {
    id: 1,
    title: "Thông tin thành tích",
    description: "Tiêu đề, loại và cấp độ thành tích.",
  },
  {
    id: 2,
    title: "Chi tiết",
    description: "Sinh viên, dự án, tổ chức và giải thưởng.",
  },
  {
    id: 3,
    title: "Hiển thị & Ảnh bìa",
    description: "Chế độ hiển thị và ảnh đại diện thành tích.",
  },
  {
    id: 4,
    title: "Xem lại & hoàn tất",
    description: "Kiểm tra lại toàn bộ thông tin trước khi tạo.",
  },
] as const;

const formSchema = z.object({
  title: z.string().min(1, "Tiêu đề là bắt buộc").max(500),
  type: z.enum([
    "HACKATHON",
    "AWARD",
    "SCHOLARSHIP",
    "RESEARCH",
    "COMPETITION",
    "OTHER",
  ]),
  description: z.string().optional(),
  studentNames: z.string().optional(),
  projectName: z.string().optional(),
  organization: z.string().optional(),
  level: z.enum(["UNIVERSITY", "NATIONAL", "INTERNATIONAL"]).optional(),
  rank: z.string().optional(),
  reward: z.string().optional(),
  achievedYear: z.coerce.number().optional(),
  isHighlight: z.boolean().optional(),
  visibility: z.enum(["PUBLIC", "INTERNAL"]).optional(),
  coverImage: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const STEP_FIELDS: Record<number, (keyof FormData)[]> = {
  1: ["title", "type", "level", "description"],
  2: ["studentNames", "projectName", "organization", "rank", "reward", "achievedYear"],
  3: ["visibility", "coverImage", "isHighlight"],
  4: [],
};

const typeLabels: Record<string, string> = {
  HACKATHON: "Hackathon",
  AWARD: "Giải thưởng",
  SCHOLARSHIP: "Học bổng",
  RESEARCH: "Nghiên cứu",
  COMPETITION: "Cuộc thi",
  OTHER: "Khác",
};

const levelLabels: Record<string, string> = {
  UNIVERSITY: "Cấp trường",
  NATIONAL: "Cấp quốc gia",
  INTERNATIONAL: "Quốc tế",
};

const visibilityLabels: Record<string, string> = {
  PUBLIC: "Công khai",
  INTERNAL: "Nội bộ",
};

export default function CreateAchievementPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const currentStep = useAchievementWizardStore((state) => state.currentStep);
  const setTotalSteps = useAchievementWizardStore(
    (state) => state.setTotalSteps,
  );
  const storeGoNext = useAchievementWizardStore((state) => state.goNext);
  const storeGoBack = useAchievementWizardStore((state) => state.goBack);
  const resetWizard = useAchievementWizardStore((state) => state.reset);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      type: "HACKATHON" as AchievementType,
      description: "",
      studentNames: "",
      projectName: "",
      organization: "",
      level: undefined,
      rank: "",
      reward: "",
      achievedYear: new Date().getFullYear(),
      isHighlight: false,
      visibility: "PUBLIC" as AchievementVisibility,
      coverImage: "",
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
      title: "Đang tạo thành tích...",
      description: "Vui lòng chờ trong giây lát.",
      duration: Infinity,
    });

    try {
      setIsLoading(true);

      // Clean up empty strings
      const cleanData = {
        ...values,
        coverImage: values.coverImage || undefined,
        description: values.description || undefined,
        studentNames: values.studentNames || undefined,
        projectName: values.projectName || undefined,
        organization: values.organization || undefined,
        rank: values.rank || undefined,
        reward: values.reward || undefined,
      };

      await api.achievements.create(cleanData);

      update({
        id,
        title: "Thành công",
        description: "Thành tích đã được tạo thành công.",
        variant: "default",
        duration: 3000,
      });

      router.push("/achievements");
    } catch (error) {
      console.error(error);
      update({
        id,
        variant: "destructive",
        title: "Lỗi",
        description:
          error instanceof Error ? error.message : "Không thể tạo thành tích",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5 p-8 pt-6 dashboard-reveal">
      <WizardPageHeader
        eyebrow="Thành tích"
        title="Tạo Thành tích mới"
        description="Hoàn thành từng bước để thêm thành tích mới."
        onCancel={() => router.push("/achievements")}
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
            submitLabel="Tạo thành tích"
            confirmTitle="Xác nhận tạo thành tích"
            confirmDescription="Bạn có chắc chắn muốn tạo thành tích này? Vui lòng kiểm tra lại thông tin trước khi xác nhận."
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
                        Tiêu đề thành tích{" "}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="VD: Giải Ba Ancient8 Builder Jam 2025"
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
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Loại thành tích{" "}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full shadow-none">
                            <SelectValue placeholder="Chọn loại" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="HACKATHON">Hackathon</SelectItem>
                          <SelectItem value="AWARD">Giải thưởng</SelectItem>
                          <SelectItem value="SCHOLARSHIP">Học bổng</SelectItem>
                          <SelectItem value="RESEARCH">Nghiên cứu</SelectItem>
                          <SelectItem value="COMPETITION">Cuộc thi</SelectItem>
                          <SelectItem value="OTHER">Khác</SelectItem>
                        </SelectContent>
                      </Select>
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
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-full shadow-none">
                            <SelectValue placeholder="Chọn cấp độ" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="UNIVERSITY">Cấp trường</SelectItem>
                          <SelectItem value="NATIONAL">Cấp quốc gia</SelectItem>
                          <SelectItem value="INTERNATIONAL">
                            Quốc tế
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Mô tả</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Mô tả ngắn gọn về thành tích..."
                          className="shadow-none min-h-[100px]"
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
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="studentNames"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Tên sinh viên</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nguyễn Hoài Duy; Huỳnh Văn Đông; Võ Hữu Nhân"
                          {...field}
                          className="shadow-none"
                        />
                      </FormControl>
                      <FormDescription>
                        Phân cách bằng dấu chấm phẩy (;)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="projectName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên dự án</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="VD: Meme Trade Co."
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
                  name="organization"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tổ chức</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="VD: Ancient8, Bộ GD&ĐT"
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
                  name="rank"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Thứ hạng</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="VD: Giải Ba, Nhất, Nhì, Finalist"
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
                  name="reward"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phần thưởng</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="VD: 2000 USD + học bổng"
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
                  name="achievedYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Năm đạt được</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="2025"
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

            {currentStep === 3 && (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="visibility"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hiển thị</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full shadow-none">
                            <SelectValue placeholder="Chọn chế độ hiển thị" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="PUBLIC">Công khai</SelectItem>
                          <SelectItem value="INTERNAL">Nội bộ</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="coverImage"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Ảnh bìa</FormLabel>
                      <FormControl>
                        <ImageUpload
                          value={field.value}
                          onChange={field.onChange}
                          folder="achievements"
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isHighlight"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 md:col-span-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Đánh dấu nổi bật</FormLabel>
                        <FormDescription>
                          Hiển thị nổi bật trên trang chủ website
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-4">
                <div className="rounded-xl border border-[#e8e2dc] bg-[#fdfbf9] p-5">
                  <h4 className="text-sm font-semibold text-stone-950">
                    Thông tin thành tích
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
                        Loại thành tích
                      </dt>
                      <dd className="text-sm font-medium text-stone-800">
                        {typeLabels[watchedValues.type] || "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">
                        Cấp độ
                      </dt>
                      <dd className="text-sm font-medium text-stone-800">
                        {watchedValues.level
                          ? levelLabels[watchedValues.level]
                          : "—"}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="rounded-xl border border-[#e8e2dc] bg-[#fdfbf9] p-5">
                  <h4 className="text-sm font-semibold text-stone-950">
                    Chi tiết
                  </h4>
                  <dl className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div>
                      <dt className="text-xs text-muted-foreground">
                        Sinh viên
                      </dt>
                      <dd className="text-sm font-medium text-stone-800">
                        {watchedValues.studentNames || "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">
                        Dự án
                      </dt>
                      <dd className="text-sm font-medium text-stone-800">
                        {watchedValues.projectName || "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">
                        Tổ chức
                      </dt>
                      <dd className="text-sm font-medium text-stone-800">
                        {watchedValues.organization || "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">
                        Thứ hạng
                      </dt>
                      <dd className="text-sm font-medium text-stone-800">
                        {watchedValues.rank || "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">
                        Phần thưởng
                      </dt>
                      <dd className="text-sm font-medium text-stone-800">
                        {watchedValues.reward || "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">
                        Năm đạt được
                      </dt>
                      <dd className="text-sm font-medium text-stone-800">
                        {watchedValues.achievedYear || "—"}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="rounded-xl border border-[#e8e2dc] bg-[#fdfbf9] p-5">
                  <h4 className="text-sm font-semibold text-stone-950">
                    Hiển thị & Ảnh bìa
                  </h4>
                  <dl className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <dt className="text-xs text-muted-foreground">
                        Chế độ hiển thị
                      </dt>
                      <dd className="text-sm font-medium text-stone-800">
                        {watchedValues.visibility
                          ? visibilityLabels[watchedValues.visibility]
                          : "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">
                        Nổi bật
                      </dt>
                      <dd className="text-sm font-medium text-stone-800">
                        {watchedValues.isHighlight ? "Có" : "Không"}
                      </dd>
                    </div>
                  </dl>
                  {watchedValues.coverImage && (
                    <div className="mt-4 aspect-video w-full max-w-xs overflow-hidden rounded-lg border">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={watchedValues.coverImage}
                        alt="Cover preview"
                        className="h-full w-full object-cover"
                      />
                    </div>
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
