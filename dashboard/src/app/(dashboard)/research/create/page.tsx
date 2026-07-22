"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { useResearchWizardStore } from "@/store/research-wizard-store";
import { StepWizard } from "@/components/wizard/step-wizard";
import { WizardPageHeader } from "@/components/wizard/wizard-page-header";
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
import { api, ResearchType } from "@/lib/api";
import { slugify } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";

const STEPS = [
  {
    id: 1,
    title: "Thông tin chung",
    description: "Loại, tiêu đề, tóm tắt và các thông tin cơ bản.",
  },
  {
    id: 2,
    title: "Chi tiết",
    description: "Thông tin chi tiết theo loại đề tài / bài báo.",
  },
  {
    id: 3,
    title: "Xem lại & hoàn tất",
    description: "Kiểm tra lại toàn bộ thông tin trước khi tạo.",
  },
] as const;

const formSchema = z.object({
  type: z.enum(["PROJECT", "PUBLICATION"]),
  title: z.string().min(1, "Tiêu đề là bắt buộc").max(500),
  slug: z.string().optional(),
  abstract: z.string().optional(),
  authors: z.string().optional(),
  principalInvestigator: z.string().optional(),
  unit: z.string().optional(),
  researchField: z.string().optional(),
  // Project fields
  sponsor: z.string().optional(),
  fundingAmount: z.string().optional(),
  startYear: z.coerce.number().optional(),
  endYear: z.coerce.number().optional(),
  status: z.enum(["ONGOING", "COMPLETED"]).optional(),
  // Publication fields
  journalName: z.string().optional(),
  publisher: z.string().optional(),
  publicationYear: z.coerce.number().optional(),
  doi: z.string().optional(),
  pdfUrl: z.string().url("Phải là URL hợp lệ").optional().or(z.literal("")),
  // Metadata
  keywords: z.string().optional(),
  language: z.enum(["vi", "en"]).optional(),
});

type FormData = z.infer<typeof formSchema>;

const STEP_FIELDS: Record<number, (keyof FormData)[]> = {
  1: [
    "type",
    "language",
    "title",
    "slug",
    "abstract",
    "authors",
    "principalInvestigator",
    "unit",
    "researchField",
    "keywords",
  ],
  2: [
    "sponsor",
    "fundingAmount",
    "status",
    "startYear",
    "endYear",
    "journalName",
    "publisher",
    "publicationYear",
    "doi",
    "pdfUrl",
  ],
  3: [],
};

export default function CreateResearchPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const currentStep = useResearchWizardStore((state) => state.currentStep);
  const setTotalSteps = useResearchWizardStore((state) => state.setTotalSteps);
  const storeGoNext = useResearchWizardStore((state) => state.goNext);
  const storeGoBack = useResearchWizardStore((state) => state.goBack);
  const resetWizard = useResearchWizardStore((state) => state.reset);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "PROJECT" as ResearchType,
      title: "",
      slug: "",
      abstract: "",
      authors: "",
      principalInvestigator: "",
      unit: "",
      researchField: "",
      sponsor: "",
      fundingAmount: "",
      startYear: undefined,
      endYear: undefined,
      status: undefined,
      journalName: "",
      publisher: "",
      publicationYear: undefined,
      doi: "",
      pdfUrl: "",
      keywords: "",
      language: "vi",
    },
  });

  const selectedType = form.watch("type");

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
      title: "Đang tạo nghiên cứu...",
      description: "Vui lòng chờ trong giây lát.",
      duration: Infinity,
    });

    try {
      setIsLoading(true);

      await api.research.create({
        ...values,
        pdfUrl: values.pdfUrl || undefined,
      });

      update({
        id,
        title: "Thành công",
        description: "Nghiên cứu đã được tạo thành công.",
        variant: "default",
        duration: 3000,
      });

      router.push("/research");
    } catch (error) {
      console.error(error);
      update({
        id,
        title: "Lỗi",
        description:
          error instanceof Error ? error.message : "Không thể tạo nghiên cứu",
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
        eyebrow="Nghiên cứu"
        title="Tạo nghiên cứu mới"
        description="Hoàn thành từng bước để thêm đề tài/bài báo nghiên cứu mới."
        onCancel={() => router.push("/research")}
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
            submitLabel="Tạo nghiên cứu"
            confirmTitle="Xác nhận tạo nghiên cứu"
            confirmDescription="Bạn có chắc chắn muốn tạo nghiên cứu này? Vui lòng kiểm tra lại thông tin trước khi xác nhận."
            onBack={storeGoBack}
            onNext={goNext}
          >
            {currentStep === 1 && (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loại nghiên cứu</FormLabel>
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
                          <SelectItem value="PROJECT">
                            Đề tài khoa học
                          </SelectItem>
                          <SelectItem value="PUBLICATION">
                            Bài báo khoa học
                          </SelectItem>
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
                      <FormLabel>Ngôn ngữ</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full shadow-none">
                            <SelectValue placeholder="Chọn ngôn ngữ" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="vi">Tiếng Việt</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                          placeholder="Nhập tiêu đề nghiên cứu..."
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
                  name="abstract"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Tóm tắt</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Nhập tóm tắt nghiên cứu..."
                          className="shadow-none min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="authors"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Tác giả / Thành viên</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nguyễn Văn A, Trần Thị B, ..."
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
                  name="principalInvestigator"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chủ nhiệm / Tác giả chính</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nhập tên..."
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
                  name="unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Đơn vị</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="SIT, TTU, ..."
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
                  name="researchField"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Lĩnh vực nghiên cứu</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Công nghệ thông tin, AI, ..."
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
                  name="keywords"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Từ khóa</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="machine learning, deep learning, ..."
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
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {selectedType === "PROJECT" && (
                  <>
                    <FormField
                      control={form.control}
                      name="sponsor"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Đơn vị tài trợ</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Nhập đơn vị tài trợ..."
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
                      name="fundingAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kinh phí</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="100,000,000 VNĐ"
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
                              <SelectTrigger className="w-full shadow-none">
                                <SelectValue placeholder="Chọn trạng thái" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="ONGOING">
                                Đang thực hiện
                              </SelectItem>
                              <SelectItem value="COMPLETED">
                                Đã hoàn thành
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="startYear"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Năm bắt đầu</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="2024"
                              {...field}
                              value={field.value ?? ""}
                              className="shadow-none"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="endYear"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Năm kết thúc</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="2026"
                              {...field}
                              value={field.value ?? ""}
                              className="shadow-none"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                {selectedType === "PUBLICATION" && (
                  <>
                    <FormField
                      control={form.control}
                      name="journalName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tên tạp chí</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Nhập tên tạp chí..."
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
                      name="publisher"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nhà xuất bản</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Nhập nhà xuất bản..."
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
                      name="publicationYear"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Năm xuất bản</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="2024"
                              {...field}
                              value={field.value ?? ""}
                              className="shadow-none"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="doi"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>DOI</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="10.1234/example"
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
                      name="pdfUrl"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>PDF URL</FormLabel>
                          <FormControl>
                            <Input
                              type="url"
                              placeholder="https://example.com/paper.pdf"
                              {...field}
                              className="shadow-none"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="rounded-xl border border-[#e8e2dc] bg-[#fdfbf9] p-5">
                  <h4 className="text-sm font-semibold text-stone-950">
                    Thông tin chung
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
                        Loại nghiên cứu
                      </dt>
                      <dd className="text-sm font-medium text-stone-800">
                        {watchedValues.type === "PROJECT"
                          ? "Đề tài khoa học"
                          : "Bài báo khoa học"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">
                        Tác giả
                      </dt>
                      <dd className="text-sm font-medium text-stone-800">
                        {watchedValues.authors || "—"}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="rounded-xl border border-[#e8e2dc] bg-[#fdfbf9] p-5">
                  <h4 className="text-sm font-semibold text-stone-950">
                    Chi tiết
                  </h4>
                  {watchedValues.type === "PROJECT" ? (
                    <dl className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <div>
                        <dt className="text-xs text-muted-foreground">
                          Đơn vị tài trợ
                        </dt>
                        <dd className="text-sm font-medium text-stone-800">
                          {watchedValues.sponsor || "—"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted-foreground">
                          Kinh phí
                        </dt>
                        <dd className="text-sm font-medium text-stone-800">
                          {watchedValues.fundingAmount || "—"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted-foreground">
                          Thời gian
                        </dt>
                        <dd className="text-sm font-medium text-stone-800">
                          {watchedValues.startYear ?? "—"} -{" "}
                          {watchedValues.endYear ?? "—"}
                        </dd>
                      </div>
                    </dl>
                  ) : (
                    <dl className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <div>
                        <dt className="text-xs text-muted-foreground">
                          Tạp chí
                        </dt>
                        <dd className="text-sm font-medium text-stone-800">
                          {watchedValues.journalName || "—"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted-foreground">
                          Năm xuất bản
                        </dt>
                        <dd className="text-sm font-medium text-stone-800">
                          {watchedValues.publicationYear ?? "—"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted-foreground">DOI</dt>
                        <dd className="text-sm font-medium text-stone-800">
                          {watchedValues.doi || "—"}
                        </dd>
                      </div>
                    </dl>
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
