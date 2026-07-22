"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import { api, type CreateEventDto } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormLoading } from "@/components/shared/LoadingStates";

const eventSchema = z
  .object({
    titleVi: z.string().min(1, "Tên sự kiện tiếng Việt là bắt buộc").max(255),
    titleEn: z.string().max(255).optional(),
    descriptionVi: z.string().optional(),
    descriptionEn: z.string().optional(),
    startAt: z.string().min(1, "Thời gian bắt đầu là bắt buộc"),
    endAt: z.string().optional(),
    locationVi: z.string().min(1, "Địa điểm tiếng Việt là bắt buộc").max(255),
    locationEn: z.string().max(255).optional(),
    registrationUrl: z
      .string()
      .url("Liên kết đăng ký không hợp lệ")
      .or(z.literal(""))
      .optional(),
    status: z.enum(["draft", "published", "cancelled"]),
    isFeatured: z.boolean(),
  })
  .refine(
    (value) => !value.endAt || new Date(value.endAt) >= new Date(value.startAt),
    {
      message: "Thời gian kết thúc phải sau thời gian bắt đầu",
      path: ["endAt"],
    },
  );

type EventFormData = z.infer<typeof eventSchema>;

const toLocalDateTime = (value: string) => {
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

interface EventFormPageProps {
  eventId?: string;
}

export default function EventFormPage({ eventId }: EventFormPageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isFetching, setIsFetching] = useState(Boolean(eventId));
  const [isSaving, setIsSaving] = useState(false);
  const isEditing = Boolean(eventId);

  const form = useForm<EventFormData>({
    defaultValues: {
      titleVi: "",
      titleEn: "",
      descriptionVi: "",
      descriptionEn: "",
      startAt: "",
      endAt: "",
      locationVi: "",
      locationEn: "",
      registrationUrl: "",
      status: "draft",
      isFeatured: false,
    },
  });

  useEffect(() => {
    if (!eventId) return;

    let active = true;
    api.events
      .findOne(eventId)
      .then((event) => {
        if (!active) return;
        form.reset({
          titleVi: event.titleVi,
          titleEn: event.titleEn ?? "",
          descriptionVi: event.descriptionVi ?? "",
          descriptionEn: event.descriptionEn ?? "",
          startAt: toLocalDateTime(event.startAt),
          endAt: event.endAt ? toLocalDateTime(event.endAt) : "",
          locationVi: event.locationVi,
          locationEn: event.locationEn ?? "",
          registrationUrl: event.registrationUrl ?? "",
          status: event.status,
          isFeatured: event.isFeatured,
        });
      })
      .catch((error) => {
        console.error(error);
        toast({
          variant: "destructive",
          title: "Không thể tải sự kiện",
          description: "Vui lòng thử lại sau.",
        });
        router.push("/events");
      })
      .finally(() => active && setIsFetching(false));

    return () => {
      active = false;
    };
  }, [eventId, form, router, toast]);

  async function onSubmit(values: EventFormData) {
    const result = eventSchema.safeParse(values);
    if (!result.success) {
      Object.entries(result.error.flatten().fieldErrors).forEach(
        ([field, messages]) => {
          if (messages?.[0]) {
            form.setError(field as keyof EventFormData, {
              message: messages[0],
            });
          }
        },
      );
      return;
    }

    const payload: CreateEventDto = {
      titleVi: result.data.titleVi.trim(),
      titleEn: result.data.titleEn?.trim() || undefined,
      descriptionVi: result.data.descriptionVi?.trim() || undefined,
      descriptionEn: result.data.descriptionEn?.trim() || undefined,
      startAt: new Date(result.data.startAt).toISOString(),
      endAt: result.data.endAt
        ? new Date(result.data.endAt).toISOString()
        : undefined,
      locationVi: result.data.locationVi.trim(),
      locationEn: result.data.locationEn?.trim() || undefined,
      registrationUrl: result.data.registrationUrl?.trim() || undefined,
      status: result.data.status,
      isFeatured: result.data.isFeatured,
    };

    try {
      setIsSaving(true);
      if (eventId) await api.events.update(eventId, payload);
      else await api.events.create(payload);

      toast({
        title: isEditing ? "Đã cập nhật sự kiện" : "Đã tạo sự kiện",
        description: "Thông tin đã được lưu thành công.",
      });
      router.push("/events");
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Không thể lưu sự kiện",
        description:
          error instanceof Error ? error.message : "Vui lòng thử lại.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  if (isFetching) return <FormLoading fieldCount={8} />;

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight">
        {isEditing ? "Chỉnh sửa sự kiện" : "Tạo sự kiện mới"}
      </h2>
      <Card className="border-0 shadow-none">
        <CardHeader>
          <CardTitle>Thông tin sự kiện</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="titleVi"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên sự kiện (VI) *</FormLabel>
                      <FormControl>
                        <Input {...field} className="shadow-none" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="titleEn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên sự kiện (EN)</FormLabel>
                      <FormControl>
                        <Input {...field} className="shadow-none" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="startAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bắt đầu *</FormLabel>
                      <FormControl>
                        <Input
                          type="datetime-local"
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
                  name="endAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kết thúc</FormLabel>
                      <FormControl>
                        <Input
                          type="datetime-local"
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
                  name="locationVi"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Địa điểm (VI) *</FormLabel>
                      <FormControl>
                        <Input {...field} className="shadow-none" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="locationEn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Địa điểm (EN)</FormLabel>
                      <FormControl>
                        <Input {...field} className="shadow-none" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="descriptionVi"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mô tả (VI)</FormLabel>
                      <FormControl>
                        <Textarea {...field} className="min-h-28 shadow-none" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="descriptionEn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mô tả (EN)</FormLabel>
                      <FormControl>
                        <Textarea {...field} className="min-h-28 shadow-none" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="registrationUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Liên kết đăng ký / chi tiết</FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          placeholder="https://..."
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
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger className="shadow-none">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="draft">Bản nháp</SelectItem>
                          <SelectItem value="published">Đã xuất bản</SelectItem>
                          <SelectItem value="cancelled">Đã hủy</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isFeatured"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-3 md:col-span-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="!mt-0">Ưu tiên hiển thị</FormLabel>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/events")}
                  className="cursor-pointer"
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="cursor-pointer"
                >
                  {isSaving && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isEditing ? "Lưu thay đổi" : "Tạo sự kiện"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
