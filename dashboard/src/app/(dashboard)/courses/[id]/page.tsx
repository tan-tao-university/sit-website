"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import * as z from "zod";
import { Loader2, Trash2 } from "lucide-react";

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
import { EditPageCard } from "@/components/wizard/edit-page-card";
import { useToast } from "@/hooks/use-toast";
import { FormLoading } from "@/components/shared/LoadingStates";
import { api, UpdateCourseDto } from "@/lib/api";

const formSchema = z.object({
  code: z.string().min(1, "Mã học phần là bắt buộc"),
  nameVi: z.string().min(1, "Tên tiếng Việt là bắt buộc"),
  nameEn: z.string().optional(),
  credits: z.coerce.number().min(0, "Số tín chỉ phải lớn hơn hoặc bằng 0"),
  lectureHours: z.coerce.number().min(0).optional(),
  practiceHours: z.coerce.number().min(0).optional(),
});

export default function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      code: "",
      nameVi: "",
      nameEn: "",
      credits: 0,
    },
  });

  useEffect(() => {
    async function fetchCourse() {
      try {
        const course = await api.courses.findOne(id);
        form.reset({
          code: course.code,
          nameVi: course.nameVi,
          nameEn: course.nameEn || "",
          credits: course.credits,
          lectureHours: course.lectureHours ?? undefined,
          practiceHours: course.practiceHours ?? undefined,
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: "Không thể tải thông tin khoá học",
        });
        router.push("/courses");
      } finally {
        setIsLoading(false);
      }
    }
    fetchCourse();
  }, [id, router, toast, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { id: toastId, update } = toast({
      title: "Đang cập nhật...",
      description: "Vui lòng chờ trong giây lát.",
      duration: Infinity,
    });

    try {
      setIsSaving(true);
      // Manual validation
      const result = formSchema.safeParse(values);
      if (!result.success) {
        result.error.issues.forEach((issue) => {
          form.setError(issue.path[0] as any, { message: issue.message });
        });
        update({
          id: toastId,
          title: "Lỗi",
          description: "Vui lòng kiểm tra lại thông tin.",
          variant: "destructive",
          duration: 3000,
        });
        return;
      }

      await api.courses.update(id, values as UpdateCourseDto);
      update({
        id: toastId,
        title: "Thành công",
        description: "Cập nhật khoá học thành công",
        variant: "default",
        duration: 3000,
      });
      router.refresh();
    } catch (error: any) {
      update({
        id: toastId,
        variant: "destructive",
        title: "Lỗi",
        description: error.message || "Không thể cập nhật khoá học",
        duration: 5000,
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Bạn có chắc chắn muốn xóa khoá học này không?")) return;
    try {
      setIsDeleting(true);
      await api.courses.remove(id);
      toast({
        title: "Thành công",
        description: "Xóa khoá học thành công",
      });
      router.push("/courses");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể xóa khoá học",
      });
    } finally {
      setIsDeleting(false);
    }
  }

  if (isLoading) {
    return <FormLoading fieldCount={5} />;
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5 p-8 pt-6 dashboard-reveal">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
            <span className="h-px w-5 bg-primary" />
            Học phần
          </div>
          <h1 className="text-[28px] font-semibold tracking-[-0.035em] text-stone-950 sm:text-[32px]">
            Chi tiết khoá học
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Xem và chỉnh sửa thông tin học phần.
          </p>
        </div>
        <Button
          variant="destructive"
          className="cursor-pointer"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="mr-2 h-4 w-4" />
          )}
          Xóa khoá học
        </Button>
      </div>

      <EditPageCard>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mã học phần</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="CS101"
                        {...field}
                        className="shadow-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="credits"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số tín chỉ</FormLabel>
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
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="nameVi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên tiếng Việt</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nhập môn Lập trình"
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
                name="nameEn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên tiếng Anh (Tuỳ chọn)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Introduction to Programming"
                        {...field}
                        className="shadow-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="lectureHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giờ lý thuyết (LT)</FormLabel>
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

              <FormField
                control={form.control}
                name="practiceHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giờ thực hành (TH)</FormLabel>
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
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
                onClick={() => router.push("/courses")}
                disabled={isSaving}
              >
                Hủy
              </Button>
              <Button type="submit" className="cursor-pointer" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Lưu thay đổi
              </Button>
            </div>
          </form>
        </Form>
      </EditPageCard>
    </div>
  );
}
