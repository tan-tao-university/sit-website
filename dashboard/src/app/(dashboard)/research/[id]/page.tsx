"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2 } from "lucide-react";

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
import { useToast } from "@/hooks/use-toast";
import { FormLoading } from "@/components/shared/LoadingStates";
import { api, ResearchType } from "@/lib/api";
import { slugify } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  type: z.enum(["PROJECT", "PUBLICATION"]),
  title: z.string().min(1, "Tiêu đề là bắt buộc").max(500),
  slug: z.string().optional(),
  abstract: z.string().optional(),
  authors: z.string().optional(),
  principalInvestigator: z.string().optional(),
  unit: z.string().optional(),
  researchField: z.string().optional(),
  sponsor: z.string().optional(),
  fundingAmount: z.string().optional(),
  startYear: z.coerce.number().optional(),
  endYear: z.coerce.number().optional(),
  status: z.enum(["ONGOING", "COMPLETED"]).optional(),
  journalName: z.string().optional(),
  publisher: z.string().optional(),
  publicationYear: z.coerce.number().optional(),
  doi: z.string().optional(),
  pdfUrl: z.string().url("Phải là URL hợp lệ").optional().or(z.literal("")),
  keywords: z.string().optional(),
  language: z.enum(["vi", "en"]).optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function EditResearchPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const form = useForm<FormData>({
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

  useEffect(() => {
    loadResearch();
  }, []);

  async function loadResearch() {
    try {
      setIsFetching(true);
      const data = await api.research.findOne(params.id as string);

      form.reset({
        type: data.type,
        title: data.title,
        slug: data.slug || "",
        abstract: data.abstract || "",
        authors: data.authors || "",
        principalInvestigator: data.principalInvestigator || "",
        unit: data.unit || "",
        researchField: data.researchField || "",
        sponsor: data.sponsor || "",
        fundingAmount: data.fundingAmount || "",
        startYear: data.startYear ?? undefined,
        endYear: data.endYear ?? undefined,
        status: data.status ?? undefined,
        journalName: data.journalName || "",
        publisher: data.publisher || "",
        publicationYear: data.publicationYear ?? undefined,
        doi: data.doi || "",
        pdfUrl: data.pdfUrl || "",
        keywords: data.keywords || "",
        language: data.language || "vi",
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể tải thông tin nghiên cứu",
      });
      router.push("/research");
    } finally {
      setIsFetching(false);
    }
  }

  async function onSubmit(values: FormData) {
    const { id, update } = toast({
      title: "Đang cập nhật...",
      description: "Vui lòng chờ trong giây lát.",
      duration: Infinity,
    });

    try {
      setIsLoading(true);

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
          id,
          title: "Lỗi",
          description: "Vui lòng kiểm tra lại thông tin.",
          variant: "destructive",
          duration: 3000,
        });
        return;
      }

      // Send pdfUrl as-is (including empty string) so clearing it on edit
      // actually clears it — `|| undefined` would drop the key from the
      // JSON body and the backend would read that as "leave unchanged".
      await api.research.update(params.id as string, result.data);

      update({
        id,
        title: "Thành công",
        description: "Nghiên cứu đã được cập nhật.",
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
          error instanceof Error
            ? error.message
            : "Không thể cập nhật nghiên cứu",
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
        eyebrow="Nghiên cứu"
        title="Chỉnh sửa nghiên cứu"
        description="Cập nhật thông tin đề tài/bài báo nghiên cứu."
        onCancel={() => router.push("/research")}
      />

      <EditPageCard>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loại nghiên cứu</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="shadow-none">
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
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="shadow-none">
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
                      <FormLabel>Tiêu đề</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nhập tiêu đề nghiên cứu..."
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            if (!form.getValues("slug")) {
                              const slug = slugify(e.target.value);
                              form.setValue("slug", slug);
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
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="shadow-none">
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

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  className="cursor-pointer"
                  onClick={() => router.push("/research")}
                  disabled={isLoading}
                >
                  Hủy
                </Button>
                <Button
                  className="cursor-pointer"
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Cập nhật
                </Button>
              </div>
            </form>
          </Form>
      </EditPageCard>
    </div>
  );
}
