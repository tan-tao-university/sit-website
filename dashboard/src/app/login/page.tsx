"use client";

import Image from "next/image";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Loader2, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(12, "Password must be at least 12 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormData>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleLoginSuccess = async () => {
    try {
      toast({ title: "Đăng nhập thành công" });

      // Redirect to the original page or dashboard
      const redirectTo = searchParams.get("redirect") || "/";
      router.push(redirectTo);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Đăng nhập thất bại",
        description: "Không thể đồng bộ tài khoản với máy chủ.",
      });
    }
  };

  const onSubmit = async (values: LoginFormData) => {
    try {
      setIsLoading(true);

      // Manually validate with Zod
      const result = loginSchema.safeParse(values);

      if (!result.success) {
        // Handle validation errors
        const errors = result.error.flatten().fieldErrors;
        Object.entries(errors).forEach(([field, messages]) => {
          if (messages && messages.length > 0) {
            form.setError(field as keyof LoginFormData, {
              type: "manual",
              message: messages[0],
            });
          }
        });
        setIsLoading(false);
        return;
      }

      await api.auth.login(result.data.email, result.data.password);
      await handleLoginSuccess();
    } catch (error: unknown) {
      console.error(error);
      let errorMessage = "Đã có lỗi xảy ra vui lòng thử lại.";
      const message = error instanceof Error ? error.message : "";

      if (
        message.includes("INVALID_CREDENTIALS") ||
        message.includes("Invalid email or password")
      ) {
        errorMessage = "Email hoặc mật khẩu không chính xác.";
      }

      toast({
        variant: "destructive",
        title: "Đăng nhập thất bại",
        description: errorMessage,
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="grid min-h-[calc(100vh-2rem)] w-full max-w-6xl overflow-hidden rounded-[2rem] border border-[#e8e2dc] bg-white shadow-[0_24px_80px_rgba(61,42,30,0.08)] lg:grid-cols-[0.95fr_1.05fr]">
      <aside className="relative hidden min-h-[660px] flex-col justify-between overflow-hidden border-r border-[#e8e2dc] bg-[#fbf8f5] p-8 lg:flex">
        <div className="absolute -right-24 top-20 h-72 w-72 rounded-full border border-primary/15" />
        <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-primary/[0.04]" />
        <div className="absolute bottom-16 right-10 h-28 w-28 rounded-full border border-[#d9cec5]" />

        <div className="relative z-10 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#ead8cd] bg-white shadow-[0_10px_30px_rgba(186,72,17,0.08)]">
            <Image
              src="/assets/logo-sit.png"
              alt="SIT"
              width={38}
              height={38}
              className="h-9 w-9 object-contain"
              priority
            />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
              Đại học Tân Tạo
            </p>
            <p className="mt-1 text-sm font-semibold tracking-[-0.015em] text-stone-900">
              Khoa Công nghệ Thông tin
            </p>
          </div>
        </div>

        <div className="relative z-10">
          <div className="mb-4 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
            <span className="h-px w-7 bg-primary" />
            Không gian quản trị
          </div>
          <h1 className="max-w-[12ch] text-[50px] font-semibold leading-[0.98] tracking-[-0.06em] text-stone-950">
            Điều phối nội dung SIT.
          </h1>
          <p className="mt-6 max-w-sm text-sm leading-7 text-stone-600">
            Quản lý tin tức, chương trình đào tạo, nghiên cứu và dữ liệu vận hành của Khoa trong một hệ thống tập trung.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-3 overflow-hidden rounded-2xl border border-[#e8e2dc] bg-white">
          {[
            ["CMS", "Nội dung"],
            ["SIT", "Học thuật"],
            ["2026", "Vận hành"],
          ].map(([value, label], index) => (
            <div
              key={label}
              className={`p-4 ${index > 0 ? "border-l border-[#eee9e4]" : ""}`}
            >
              <p className="text-xl font-semibold tracking-[-0.04em] text-stone-950">
                {value}
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-stone-500">
                {label}
              </p>
            </div>
          ))}
        </div>
      </aside>

      <section className="flex min-h-[640px] items-center justify-center p-5 sm:p-8 lg:p-12">
        <div className="w-full max-w-md dashboard-reveal">
          <div className="mb-9 flex items-center gap-4 lg:hidden">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#ead8cd] bg-[#fbf8f5]">
              <Image
                src="/assets/logo-sit.png"
                alt="SIT"
                width={34}
                height={34}
                className="h-8 w-8 object-contain"
                priority
              />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-primary">
                SIT Dashboard
              </p>
              <p className="text-sm font-semibold text-stone-900">
                Khoa Công nghệ Thông tin
              </p>
            </div>
          </div>

          <div className="mb-8">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#ead8cd] bg-[#fbf5f1] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-primary">
              <ShieldCheck className="h-3.5 w-3.5" />
              Quyền truy cập nội bộ
            </div>
            <h2 className="text-[34px] font-semibold leading-tight tracking-[-0.045em] text-stone-950 sm:text-[40px]">
              Đăng nhập quản trị
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Sử dụng tài khoản được cấp để tiếp tục vào dashboard SIT.
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[12px] font-semibold uppercase tracking-[0.1em] text-stone-600">
                      Email
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                        <Input
                          placeholder="name@example.com"
                          {...field}
                          className="h-12 rounded-xl border-[#e8e2dc] bg-[#fdfbf9] pl-11 text-[15px] shadow-none transition-all placeholder:text-stone-400 focus-visible:border-primary focus-visible:ring-primary/20"
                        />
                      </div>
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
                    <FormLabel className="text-[12px] font-semibold uppercase tracking-[0.1em] text-stone-600">
                      Mật khẩu
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                        <Input
                          type="password"
                          placeholder="••••••••••••"
                          {...field}
                          className="h-12 rounded-xl border-[#e8e2dc] bg-[#fdfbf9] pl-11 text-[15px] shadow-none transition-all placeholder:text-stone-400 focus-visible:border-primary focus-visible:ring-primary/20"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="mt-2 h-12 w-full rounded-xl bg-primary text-[15px] font-semibold text-white shadow-[0_14px_34px_rgba(186,72,17,0.22)] transition-all hover:-translate-y-0.5 hover:bg-[#a63f0f] hover:shadow-[0_18px_40px_rgba(186,72,17,0.26)] focus-visible:ring-primary/30"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="h-4 w-4" />
                )}
                Vào dashboard
              </Button>
            </form>
          </Form>

          <div className="mt-8 border-t border-[#eee9e4] pt-5 text-xs leading-6 text-stone-500">
            Nếu không truy cập được, vui lòng liên hệ quản trị viên để kiểm tra quyền tài khoản.
          </div>
        </div>
      </section>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#f7f5f3] p-4 text-stone-950 sm:p-6 lg:p-8">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(186,72,17,0.08),transparent_28%),radial-gradient(circle_at_82%_12%,rgba(122,143,115,0.08),transparent_26%)]" />
      <div className="relative flex min-h-[calc(100vh-2rem)] items-center justify-center">
        <Suspense
          fallback={
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl border border-[#e8e2dc] bg-white shadow-[0_24px_80px_rgba(61,42,30,0.08)]">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
