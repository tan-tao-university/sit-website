"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import { api, type CreatePopupBannerDto } from "@/lib/api";
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
import { ImageUpload } from "@/components/ui/image-upload";
import { FormLoading } from "@/components/shared/LoadingStates";

const destinationPattern = /^(https?:\/\/|\/)/;

const popupBannerSchema = z
  .object({
    titleVi: z.string().min(1, "Tên chiến dịch là bắt buộc").max(255),
    titleEn: z.string().max(255).optional(),
    imageUrl: z.string().url("Vui lòng tải ảnh banner"),
    imageAltVi: z.string().max(255).optional(),
    imageAltEn: z.string().max(255).optional(),
    linkUrl: z
      .string()
      .min(1, "Liên kết đích là bắt buộc")
      .regex(destinationPattern, "Dùng route bắt đầu bằng / hoặc URL http(s)"),
    openInNewTab: z.boolean(),
    startsAt: z.string().optional(),
    endsAt: z.string().optional(),
    isActive: z.boolean(),
  })
  .refine(
    (value) =>
      !value.startsAt ||
      !value.endsAt ||
      new Date(value.endsAt) >= new Date(value.startsAt),
    {
      message: "Thời gian kết thúc phải sau thời gian bắt đầu",
      path: ["endsAt"],
    },
  );

type PopupBannerFormData = z.infer<typeof popupBannerSchema>;

const toLocalDateTime = (value: string) => {
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

interface PopupBannerFormPageProps {
  bannerId?: string;
}

export default function PopupBannerFormPage({
  bannerId,
}: PopupBannerFormPageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isFetching, setIsFetching] = useState(Boolean(bannerId));
  const [isSaving, setIsSaving] = useState(false);
  const isEditing = Boolean(bannerId);

  const form = useForm<PopupBannerFormData>({
    defaultValues: {
      titleVi: "",
      titleEn: "",
      imageUrl: "",
      imageAltVi: "",
      imageAltEn: "",
      linkUrl: "",
      openInNewTab: false,
      startsAt: "",
      endsAt: "",
      isActive: false,
    },
  });

  useEffect(() => {
    if (!bannerId) return;

    let active = true;
    api.popupBanners
      .findOne(bannerId)
      .then((banner) => {
        if (!active) return;
        form.reset({
          titleVi: banner.titleVi,
          titleEn: banner.titleEn ?? "",
          imageUrl: banner.imageUrl,
          imageAltVi: banner.imageAltVi ?? "",
          imageAltEn: banner.imageAltEn ?? "",
          linkUrl: banner.linkUrl,
          openInNewTab: banner.openInNewTab,
          startsAt: banner.startsAt ? toLocalDateTime(banner.startsAt) : "",
          endsAt: banner.endsAt ? toLocalDateTime(banner.endsAt) : "",
          isActive: banner.isActive,
        });
      })
      .catch((error) => {
        console.error(error);
        toast({
          variant: "destructive",
          title: "Không thể tải banner popup",
          description: "Vui lòng thử lại sau.",
        });
        router.push("/popup-banners");
      })
      .finally(() => active && setIsFetching(false));

    return () => {
      active = false;
    };
  }, [bannerId, form, router, toast]);

  async function onSubmit(values: PopupBannerFormData) {
    const result = popupBannerSchema.safeParse(values);
    if (!result.success) {
      Object.entries(result.error.flatten().fieldErrors).forEach(
        ([field, messages]) => {
          if (messages?.[0]) {
            form.setError(field as keyof PopupBannerFormData, {
              message: messages[0],
            });
          }
        },
      );
      return;
    }

    const payload: CreatePopupBannerDto = {
      titleVi: result.data.titleVi.trim(),
      titleEn: result.data.titleEn?.trim() || undefined,
      imageUrl: result.data.imageUrl,
      imageAltVi: result.data.imageAltVi?.trim() || undefined,
      imageAltEn: result.data.imageAltEn?.trim() || undefined,
      linkUrl: result.data.linkUrl.trim(),
      openInNewTab: result.data.openInNewTab,
      startsAt: result.data.startsAt
        ? new Date(result.data.startsAt).toISOString()
        : null,
      endsAt: result.data.endsAt
        ? new Date(result.data.endsAt).toISOString()
        : null,
      isActive: result.data.isActive,
    };

    try {
      setIsSaving(true);
      if (bannerId) await api.popupBanners.update(bannerId, payload);
      else await api.popupBanners.create(payload);

      toast({
        title: isEditing ? "Đã cập nhật banner" : "Đã tạo banner",
        description: result.data.isActive
          ? "Banner này đang được hiển thị trên website."
          : "Banner đã được lưu ở trạng thái tạm ẩn.",
      });
      router.push("/popup-banners");
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Không thể lưu banner",
        description:
          error instanceof Error ? error.message : "Vui lòng thử lại.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  if (isFetching) return <FormLoading fieldCount={8} />;

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          {isEditing ? "Chỉnh sửa banner popup" : "Tạo banner popup"}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Banner sẽ xuất hiện khi người dùng vào website và toàn bộ ảnh có thể
          bấm để mở liên kết đích.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card className="border-0 shadow-none">
            <CardHeader>
              <CardTitle>Nội dung và hình ảnh</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="titleVi"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên chiến dịch (VI) *</FormLabel>
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
                      <FormLabel>Tên chiến dịch (EN)</FormLabel>
                      <FormControl>
                        <Input {...field} className="shadow-none" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ảnh banner *</FormLabel>
                    <ImageUpload
                      value={field.value}
                      onChange={field.onChange}
                      folder="popup-banners"
                      disabled={isSaving}
                    />
                    <p className="text-xs text-muted-foreground">
                      Khuyến nghị ảnh ngang tỉ lệ 16:9 hoặc 3:2, nội dung chữ
                      quan trọng nằm cách mép ảnh an toàn.
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="imageAltVi"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mô tả ảnh (VI)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Ví dụ: Thông tin tuyển sinh năm 2026"
                          className="shadow-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="imageAltEn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mô tả ảnh (EN)</FormLabel>
                      <FormControl>
                        <Input {...field} className="shadow-none" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-none">
            <CardHeader>
              <CardTitle>Liên kết và lịch hiển thị</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="linkUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Liên kết đích *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="/vi/chuong-trinh-dao-tao hoặc https://..."
                        className="shadow-none"
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">
                      Dùng route bắt đầu bằng / cho trang trong website hoặc URL
                      đầy đủ cho trang ngoài.
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="startsAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bắt đầu hiển thị</FormLabel>
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
                  name="endsAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kết thúc hiển thị</FormLabel>
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
              </div>

              <FormField
                control={form.control}
                name="openInNewTab"
                render={({ field }) => (
                  <FormItem className="flex items-start gap-3 rounded-lg border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) =>
                          field.onChange(checked === true)
                        }
                      />
                    </FormControl>
                    <div>
                      <FormLabel>Mở liên kết trong tab mới</FormLabel>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Nên bật khi banner dẫn sang một website bên ngoài.
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-start gap-3 rounded-lg border border-primary/25 bg-primary/5 p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) =>
                          field.onChange(checked === true)
                        }
                      />
                    </FormControl>
                    <div>
                      <FormLabel>Hiển thị banner này trên website</FormLabel>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Khi bật, banner đang hoạt động trước đó sẽ tự động tắt.
                        Khoảng thời gian phía trên vẫn được ưu tiên áp dụng.
                      </p>
                    </div>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/popup-banners")}
              disabled={isSaving}
              className="cursor-pointer"
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isSaving} className="cursor-pointer">
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Lưu thay đổi" : "Tạo banner"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
