"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2 } from "lucide-react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WizardPageHeader } from "@/components/wizard/wizard-page-header";
import { EditPageCard } from "@/components/wizard/edit-page-card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { FormLoading } from "@/components/shared/LoadingStates";
import {
  api,
  AchievementType,
  AchievementVisibility,
} from "@/lib/api";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/ui/image-upload";

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

export default function EditAchievementPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const form = useForm<FormData>({
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
      achievedYear: undefined,
      isHighlight: false,
      visibility: "PUBLIC" as AchievementVisibility,
      coverImage: "",
    },
  });

  const loadAchievement = useCallback(async () => {
    try {
      setIsFetching(true);
      const data = await api.achievements.findOne(params.id as string);

      form.reset({
        title: data.title,
        type: data.type,
        description: data.description || "",
        studentNames: data.studentNames || "",
        projectName: data.projectName || "",
        organization: data.organization || "",
        level: data.level ?? undefined,
        rank: data.rank || "",
        reward: data.reward || "",
        achievedYear: data.achievedYear ?? undefined,
        isHighlight: data.isHighlight || false,
        visibility: data.visibility || "PUBLIC",
        coverImage: data.coverImage || "",
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể tải thông tin thành tích",
      });
      router.push("/achievements");
    } finally {
      setIsFetching(false);
    }
  }, [params.id, form, router, toast]);

  useEffect(() => {
    loadAchievement();
  }, [loadAchievement]);

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

      // Send fields as-is (including empty strings) so clearing a field on
      // edit actually clears it — JSON.stringify drops `undefined` keys,
      // which the backend then reads as "leave this field unchanged".
      await api.achievements.update(params.id as string, result.data);

      update({
        id,
        title: "Thành công",
        description: "Thành tích đã được cập nhật.",
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
          error instanceof Error
            ? error.message
            : "Không thể cập nhật thành tích",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (isFetching) {
    return <FormLoading fieldCount={7} />;
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5 p-8 pt-6 dashboard-reveal">
      <WizardPageHeader
        eyebrow="Thành tích"
        title="Chỉnh sửa thành tích"
        description="Cập nhật thông tin thành tích."
        onCancel={() => router.push("/achievements")}
      />

      <EditPageCard>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Tiêu đề thành tích *</FormLabel>
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
                      <FormLabel>Loại thành tích *</FormLabel>
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
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="shadow-none">
                            <SelectValue placeholder="Chọn cấp độ" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="UNIVERSITY">Cấp trường</SelectItem>
                          <SelectItem value="NATIONAL">Cấp quốc gia</SelectItem>
                          <SelectItem value="INTERNATIONAL">Quốc tế</SelectItem>
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

                <FormField
                  control={form.control}
                  name="visibility"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hiển thị</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="shadow-none">
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

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  className="cursor-pointer"
                  onClick={() => router.push("/achievements")}
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
