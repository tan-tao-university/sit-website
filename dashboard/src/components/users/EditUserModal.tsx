"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Upload, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ImageUploadOverlay } from "@/components/ui/image-upload-overlay";
import { useImageUpload } from "@/hooks/use-image-upload";
import { Switch } from "@/components/ui/switch";
import { api, type User } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  fullName: z.string().min(2, {
    message: "Tên phải có ít nhất 2 ký tự.",
  }),
  role: z.enum(["admin", "student", "parent"], {
    required_error: "Vui lòng chọn vai trò.",
  }),
  isActive: z.boolean(),
  password: z
    .string()
    .min(12, "Mật khẩu phải có ít nhất 12 ký tự.")
    .optional()
    .or(z.literal("")),
});

type FormValues = z.infer<typeof formSchema>;

interface EditUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  user: User | null;
}

export function EditUserModal({
  open,
  onOpenChange,
  onSuccess,
  user,
}: EditUserModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const { toast } = useToast();

  const form = useForm<FormValues>({
    defaultValues: {
      fullName: "",
      role: "student",
      isActive: true,
    },
  });

  const avatarUpload = useImageUpload({
    folder: "avatars",
    onUploaded: (url) => setAvatarUrl(url),
  });

  // Update form when user changes
  useEffect(() => {
    if (user) {
      const userRole =
        user.roles && user.roles.length > 0 ? user.roles[0] : "student";

      form.reset({
        fullName: user.fullName,
        role: userRole as "admin" | "student" | "parent",
        isActive: user.isActive,
      });

      // Reset avatar preview when user changes
      avatarUpload.setPreview(user.avatarUrl || "");
      setAvatarUrl(user.avatarUrl || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, form]);

  const onSubmit = async (values: FormValues) => {
    if (!user) return;

    const { id, update } = toast({
      title: "Đang cập nhật...",
      description: "Vui lòng chờ trong giây lát.",
      duration: Infinity,
    });

    setIsLoading(true);
    try {
      // Manually validate with Zod
      const result = formSchema.safeParse(values);

      if (!result.success) {
        // Handle validation errors
        const errors = result.error.flatten().fieldErrors;
        Object.entries(errors).forEach(([field, messages]) => {
          if (messages && messages.length > 0) {
            form.setError(field as keyof FormValues, {
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

      // Update user
      await api.users.update(user.userId, {
        fullName: result.data.fullName,
        isActive: result.data.isActive,
        ...(avatarUrl && { avatarUrl }),
        ...(result.data.password &&
          result.data.password.length > 0 && {
            password: result.data.password,
          }),
      });

      // Update role if changed
      const currentRole = user.roles?.[0];
      if (currentRole !== result.data.role) {
        // Note: This assumes we need to remove old role and add new one
        // You may need to adjust based on your backend implementation
        await api.users.assignRole(user.userId, {
          role: result.data.role,
        });
      }

      update({
        id,
        title: "Thành công",
        description: "Người dùng đã được cập nhật.",
        variant: "default",
        duration: 3000,
      });

      form.reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      update({
        id,
        title: "Lỗi",
        description:
          error instanceof Error
            ? error.message
            : "Không thể cập nhật người dùng. Vui lòng thử lại.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl border-[#e8e2dc] sm:max-w-[460px]">
        <DialogHeader>
          <div className="mb-1 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
            <span className="h-px w-5 bg-primary" />
            Người dùng
          </div>
          <DialogTitle className="text-xl font-semibold tracking-[-0.02em] text-stone-950">
            Chỉnh sửa người dùng
          </DialogTitle>
          <DialogDescription>
            Cập nhật thông tin người dùng trong hệ thống.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Họ và tên</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nguyễn Văn A"
                      {...field}
                      className="shadow-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Avatar Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Avatar</label>
              <div className="flex items-center gap-4">
                {avatarUpload.preview ? (
                  <div className="relative h-20 w-20">
                    <div className="relative h-20 w-20 overflow-hidden rounded-full border border-[#e8e2dc]">
                      <img
                        src={avatarUpload.preview}
                        alt="Avatar"
                        className="h-20 w-20 rounded-full object-cover"
                      />
                      <ImageUploadOverlay show={avatarUpload.isUploading} compact />
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -right-2 -top-2 h-6 w-6 rounded-full"
                      disabled={avatarUpload.isUploading}
                      onClick={() => {
                        avatarUpload.reset();
                        setAvatarUrl("");
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#fbf0ea]">
                    <Upload className="h-8 w-8 text-primary" />
                  </div>
                )}
                <div className="flex-1">
                  <Input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    disabled={avatarUpload.isUploading}
                    onChange={avatarUpload.handleFileChange}
                    className="cursor-pointer shadow-none"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    JPG, PNG hoặc WebP. Tối đa 10MB.
                  </p>
                </div>
              </div>
            </div>

            <FormItem>
              <FormLabel>Email</FormLabel>
              <Input
                value={user.email}
                disabled
                className="bg-muted shadow-none"
              />
              <p className="text-xs text-muted-foreground">
                Email không thể thay đổi
              </p>
            </FormItem>

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mật khẩu mới (Tùy chọn)</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Nhập mật khẩu mới nếu muốn đổi"
                      {...field}
                      className="shadow-none"
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Để trống nếu không muốn thay đổi mật khẩu
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vai trò</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    key={user?.userId}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full shadow-none">
                        <SelectValue placeholder="Chọn vai trò" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="admin">Quản trị viên</SelectItem>
                      <SelectItem value="student">Sinh viên</SelectItem>
                      <SelectItem value="parent">Phụ huynh</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border border-[#e8e2dc] p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Trạng thái hoạt động</FormLabel>
                    <p className="text-xs text-muted-foreground">
                      Cho phép người dùng đăng nhập vào hệ thống
                    </p>
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
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Hủy
              </Button>
              <Button type="submit" className="cursor-pointer" disabled={isLoading}>
                {isLoading ? "Đang cập nhật..." : "Cập nhật"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
