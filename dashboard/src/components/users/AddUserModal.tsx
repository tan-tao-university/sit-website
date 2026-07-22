"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Eye, EyeOff, Upload, X } from "lucide-react";
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
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  fullName: z.string().min(2, {
    message: "Tên phải có ít nhất 2 ký tự.",
  }),
  email: z.string().email({
    message: "Email không hợp lệ.",
  }),
  password: z.string().min(12, {
    message: "Mật khẩu phải có ít nhất 12 ký tự.",
  }),
  role: z.enum(["admin", "student", "parent"], {
    required_error: "Vui lòng chọn vai trò.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface AddUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AddUserModal({
  open,
  onOpenChange,
  onSuccess,
}: AddUserModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const { toast } = useToast();

  const form = useForm<FormValues>({
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      role: "student",
    },
  });

  const avatarUpload = useImageUpload({
    folder: "avatars",
    onUploaded: (url) => setAvatarUrl(url),
  });

  const onSubmit = async (values: FormValues) => {
    const { id, update } = toast({
      title: "Đang tạo người dùng...",
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

      // Create user
      const createResult = await api.users.create({
        email: result.data.email,
        password: result.data.password,
        fullName: result.data.fullName,
      });

      // Assign role to the newly created user
      await api.users.assignRole(createResult.user.userId, {
        role: result.data.role,
      });

      update({
        id,
        title: "Thành công",
        description: "Người dùng đã được tạo thành công.",
        variant: "default",
        duration: 3000,
      });

      form.reset();
      avatarUpload.reset();
      setAvatarUrl("");
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      update({
        id,
        title: "Lỗi",
        description:
          error instanceof Error
            ? error.message
            : "Không thể tạo người dùng. Vui lòng thử lại.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl border-[#e8e2dc] sm:max-w-[460px]">
        <DialogHeader>
          <div className="mb-1 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
            <span className="h-px w-5 bg-primary" />
            Người dùng
          </div>
          <DialogTitle className="text-xl font-semibold tracking-[-0.02em] text-stone-950">
            Thêm người dùng mới
          </DialogTitle>
          <DialogDescription>
            Tạo tài khoản người dùng mới cho hệ thống.
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
              <label className="text-sm font-medium">Avatar (Tùy chọn)</label>
              <div className="flex items-center gap-4">
                {avatarUpload.preview ? (
                  <div className="relative h-20 w-20">
                    <div className="relative h-20 w-20 overflow-hidden rounded-full border border-[#e8e2dc]">
                      <img
                        src={avatarUpload.preview}
                        alt="Avatar preview"
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

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="student@sit.edu.vn"
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
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mật khẩu</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        {...field}
                        className="shadow-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
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
                    defaultValue={field.value}
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
                {isLoading ? "Đang tạo..." : "Tạo người dùng"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
