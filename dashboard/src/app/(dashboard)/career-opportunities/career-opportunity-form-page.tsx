"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import { api, type CreateCareerOpportunityDto } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormLoading } from "@/components/shared/LoadingStates";

const optionalUrl = z
  .string()
  .url("Liên kết không hợp lệ")
  .or(z.literal(""))
  .optional();

const opportunitySchema = z.object({
  titleVi: z.string().min(1, "Tên vị trí tiếng Việt là bắt buộc").max(255),
  titleEn: z.string().max(255).optional(),
  companyName: z.string().min(1, "Tên doanh nghiệp là bắt buộc").max(255),
  companyLogoUrl: optionalUrl,
  summaryVi: z.string().optional(),
  summaryEn: z.string().optional(),
  requirementsVi: z.string().optional(),
  requirementsEn: z.string().optional(),
  type: z.enum(["internship", "full_time", "part_time", "contract"]),
  workMode: z.enum(["onsite", "hybrid", "remote"]),
  locationVi: z.string().min(1, "Địa điểm tiếng Việt là bắt buộc").max(255),
  locationEn: z.string().max(255).optional(),
  skills: z.string().optional(),
  salaryText: z.string().max(255).optional(),
  applicationUrl: optionalUrl,
  contactEmail: z
    .string()
    .email("Email không hợp lệ")
    .or(z.literal(""))
    .optional(),
  applicationDeadline: z.string().optional(),
  publishedAt: z.string().optional(),
  status: z.enum(["draft", "published", "closed"]),
  isFeatured: z.boolean(),
});

type OpportunityFormData = z.infer<typeof opportunitySchema>;

const toLocalDateTime = (value: string) => {
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

const clean = (value?: string) => value?.trim() || undefined;

interface CareerOpportunityFormPageProps {
  opportunityId?: string;
}

export default function CareerOpportunityFormPage({
  opportunityId,
}: CareerOpportunityFormPageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isFetching, setIsFetching] = useState(Boolean(opportunityId));
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm<OpportunityFormData>({
    defaultValues: {
      titleVi: "",
      titleEn: "",
      companyName: "",
      companyLogoUrl: "",
      summaryVi: "",
      summaryEn: "",
      requirementsVi: "",
      requirementsEn: "",
      type: "internship",
      workMode: "onsite",
      locationVi: "",
      locationEn: "",
      skills: "",
      salaryText: "",
      applicationUrl: "",
      contactEmail: "",
      applicationDeadline: "",
      publishedAt: "",
      status: "draft",
      isFeatured: false,
    },
  });

  useEffect(() => {
    if (!opportunityId) return;
    let active = true;

    api.careerOpportunities
      .findOne(opportunityId)
      .then((item) => {
        if (!active) return;
        reset({
          titleVi: item.titleVi,
          titleEn: item.titleEn ?? "",
          companyName: item.companyName,
          companyLogoUrl: item.companyLogoUrl ?? "",
          summaryVi: item.summaryVi ?? "",
          summaryEn: item.summaryEn ?? "",
          requirementsVi: item.requirementsVi ?? "",
          requirementsEn: item.requirementsEn ?? "",
          type: item.type,
          workMode: item.workMode,
          locationVi: item.locationVi,
          locationEn: item.locationEn ?? "",
          skills: item.skills ?? "",
          salaryText: item.salaryText ?? "",
          applicationUrl: item.applicationUrl ?? "",
          contactEmail: item.contactEmail ?? "",
          applicationDeadline: item.applicationDeadline
            ? toLocalDateTime(item.applicationDeadline)
            : "",
          publishedAt: item.publishedAt
            ? toLocalDateTime(item.publishedAt)
            : "",
          status: item.status,
          isFeatured: item.isFeatured,
        });
      })
      .catch((error) => {
        console.error(error);
        toast({
          variant: "destructive",
          title: "Không thể tải cơ hội nghề nghiệp",
        });
        router.push("/career-opportunities");
      })
      .finally(() => active && setIsFetching(false));

    return () => {
      active = false;
    };
  }, [opportunityId, reset, router, toast]);

  async function onSubmit(values: OpportunityFormData) {
    const result = opportunitySchema.safeParse(values);
    if (!result.success) {
      Object.entries(result.error.flatten().fieldErrors).forEach(
        ([field, messages]) => {
          if (messages?.[0]) {
            setError(field as keyof OpportunityFormData, {
              message: messages[0],
            });
          }
        },
      );
      return;
    }

    const data = result.data;
    if (
      data.status === "published" &&
      data.applicationDeadline &&
      new Date(data.applicationDeadline) < new Date()
    ) {
      toast({
        variant: "destructive",
        title: "Không thể xuất bản cơ hội đã hết hạn",
        description:
          "Hạn ứng tuyển đang ở quá khứ. Hãy cập nhật lại hạn hoặc để trống nếu không giới hạn thời gian.",
      });
      return;
    }

    const payload: CreateCareerOpportunityDto = {
      titleVi: data.titleVi.trim(),
      titleEn: clean(data.titleEn),
      companyName: data.companyName.trim(),
      companyLogoUrl: clean(data.companyLogoUrl),
      summaryVi: clean(data.summaryVi),
      summaryEn: clean(data.summaryEn),
      requirementsVi: clean(data.requirementsVi),
      requirementsEn: clean(data.requirementsEn),
      type: data.type,
      workMode: data.workMode,
      locationVi: data.locationVi.trim(),
      locationEn: clean(data.locationEn),
      skills: clean(data.skills),
      salaryText: clean(data.salaryText),
      applicationUrl: clean(data.applicationUrl),
      contactEmail: clean(data.contactEmail),
      applicationDeadline: data.applicationDeadline
        ? new Date(data.applicationDeadline).toISOString()
        : undefined,
      publishedAt: data.publishedAt
        ? new Date(data.publishedAt).toISOString()
        : undefined,
      status: data.status,
      isFeatured: data.isFeatured,
    };

    try {
      setIsSaving(true);
      if (opportunityId) {
        await api.careerOpportunities.update(opportunityId, payload);
      } else {
        await api.careerOpportunities.create(payload);
      }
      toast({
        title: opportunityId ? "Đã cập nhật cơ hội" : "Đã tạo cơ hội",
        description: "Thông tin đã được lưu thành công.",
      });
      router.push("/career-opportunities");
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Không thể lưu cơ hội nghề nghiệp",
        description:
          error instanceof Error ? error.message : "Vui lòng thử lại.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  if (isFetching) return <FormLoading fieldCount={12} />;

  const errorText = (name: keyof OpportunityFormData) =>
    errors[name]?.message ? (
      <p className="text-sm font-medium text-destructive">
        {String(errors[name]?.message)}
      </p>
    ) : null;

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          {opportunityId ? "Chỉnh sửa cơ hội" : "Tạo cơ hội mới"}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Thông tin tiếng Việt là nội dung chính hiển thị trên website.
        </p>
      </div>

      <Card className="border-0 shadow-none">
        <CardHeader>
          <CardTitle>Thông tin vị trí</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="titleVi">Tên vị trí (VI) *</Label>
                <Input id="titleVi" {...register("titleVi")} />
                {errorText("titleVi")}
              </div>
              <div className="space-y-2">
                <Label htmlFor="titleEn">Tên vị trí (EN)</Label>
                <Input id="titleEn" {...register("titleEn")} />
                {errorText("titleEn")}
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyName">Doanh nghiệp / tổ chức *</Label>
                <Input id="companyName" {...register("companyName")} />
                {errorText("companyName")}
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyLogoUrl">URL logo doanh nghiệp</Label>
                <Input
                  id="companyLogoUrl"
                  type="url"
                  placeholder="https://..."
                  {...register("companyLogoUrl")}
                />
                {errorText("companyLogoUrl")}
              </div>
              <div className="space-y-2">
                <Label>Loại cơ hội *</Label>
                <Select
                  value={watch("type")}
                  onValueChange={(value) =>
                    setValue("type", value as OpportunityFormData["type"])
                  }
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="internship">Thực tập</SelectItem>
                    <SelectItem value="full_time">Toàn thời gian</SelectItem>
                    <SelectItem value="part_time">Bán thời gian</SelectItem>
                    <SelectItem value="contract">Hợp đồng</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Hình thức làm việc *</Label>
                <Select
                  value={watch("workMode")}
                  onValueChange={(value) =>
                    setValue(
                      "workMode",
                      value as OpportunityFormData["workMode"],
                    )
                  }
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="onsite">Tại văn phòng</SelectItem>
                    <SelectItem value="hybrid">Kết hợp</SelectItem>
                    <SelectItem value="remote">Từ xa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="locationVi">Địa điểm (VI) *</Label>
                <Input id="locationVi" {...register("locationVi")} />
                {errorText("locationVi")}
              </div>
              <div className="space-y-2">
                <Label htmlFor="locationEn">Địa điểm (EN)</Label>
                <Input id="locationEn" {...register("locationEn")} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="skills">Kỹ năng</Label>
                <Input
                  id="skills"
                  placeholder="React, TypeScript, SQL"
                  {...register("skills")}
                />
                <p className="text-xs text-muted-foreground">
                  Phân tách kỹ năng bằng dấu phẩy.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="summaryVi">Mô tả ngắn (VI)</Label>
                <Textarea
                  id="summaryVi"
                  className="min-h-32"
                  {...register("summaryVi")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="summaryEn">Mô tả ngắn (EN)</Label>
                <Textarea
                  id="summaryEn"
                  className="min-h-32"
                  {...register("summaryEn")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="requirementsVi">Yêu cầu ứng viên (VI)</Label>
                <Textarea
                  id="requirementsVi"
                  className="min-h-32"
                  {...register("requirementsVi")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="requirementsEn">Yêu cầu ứng viên (EN)</Label>
                <Textarea
                  id="requirementsEn"
                  className="min-h-32"
                  {...register("requirementsEn")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salaryText">Lương / trợ cấp</Label>
                <Input
                  id="salaryText"
                  placeholder="Thỏa thuận hoặc 3.000.000 VNĐ/tháng"
                  {...register("salaryText")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="applicationDeadline">Hạn ứng tuyển</Label>
                <Input
                  id="applicationDeadline"
                  type="datetime-local"
                  {...register("applicationDeadline")}
                />
                <p className="text-xs text-muted-foreground">
                  Bỏ trống nếu không giới hạn. Hạn đã qua sẽ không hiển thị trên
                  website dù trạng thái là &quot;Đang hiển thị&quot;.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="applicationUrl">Liên kết ứng tuyển</Label>
                <Input
                  id="applicationUrl"
                  type="url"
                  placeholder="https://..."
                  {...register("applicationUrl")}
                />
                {errorText("applicationUrl")}
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Email nhận hồ sơ</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  placeholder="hr@company.vn"
                  {...register("contactEmail")}
                />
                {errorText("contactEmail")}
              </div>
              <div className="space-y-2">
                <Label>Trạng thái</Label>
                <Select
                  value={watch("status")}
                  onValueChange={(value) =>
                    setValue(
                      "status",
                      value as OpportunityFormData["status"],
                    )
                  }
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Bản nháp</SelectItem>
                    <SelectItem value="published">Đang hiển thị</SelectItem>
                    <SelectItem value="closed">Đã đóng</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Chỉ cơ hội &quot;Đang hiển thị&quot; và chưa hết hạn mới xuất
                  hiện trên website.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="publishedAt">Ngày đăng</Label>
                <Input
                  id="publishedAt"
                  type="datetime-local"
                  {...register("publishedAt")}
                />
                <p className="text-xs text-muted-foreground">
                  Bỏ trống để lấy thời điểm xuất bản.
                </p>
              </div>
              <div className="flex items-center gap-3 md:col-span-2">
                <Checkbox
                  id="isFeatured"
                  checked={watch("isFeatured")}
                  onCheckedChange={(checked) =>
                    setValue("isFeatured", Boolean(checked))
                  }
                />
                <Label htmlFor="isFeatured">Ưu tiên hiển thị ở đầu danh sách</Label>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t pt-6">
              <Button
                type="button"
                variant="outline"
                disabled={isSaving}
                onClick={() => router.push("/career-opportunities")}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {opportunityId ? "Lưu thay đổi" : "Tạo cơ hội"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
