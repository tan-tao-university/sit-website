"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { useRouter } from "next/navigation";

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
  description?: string;
  showHomeButton?: boolean;
}

export function ErrorBoundary({
  error,
  reset,
  title = "Đã xảy ra lỗi",
  description = "Không thể tải dữ liệu. Vui lòng thử lại sau.",
  showHomeButton = false,
}: ErrorBoundaryProps) {
  const router = useRouter();

  useEffect(() => {
    console.error("Error boundary caught:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 p-8">
      <div className="flex items-center gap-3 text-destructive">
        <AlertCircle className="h-10 w-10" />
        <h2 className="text-2xl font-bold">{title}</h2>
      </div>

      <p className="text-muted-foreground text-center max-w-md">
        {description}
      </p>

      {error.message && (
        <div className="mt-2 rounded-lg border border-destructive/20 bg-destructive/5 p-4 max-w-md">
          <p className="text-sm text-destructive font-mono">{error.message}</p>
          {error.digest && (
            <p className="text-xs text-muted-foreground mt-1">
              Error ID: {error.digest}
            </p>
          )}
        </div>
      )}

      <div className="flex gap-3 mt-4">
        <Button onClick={reset} variant="default" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Thử lại
        </Button>

        {showHomeButton && (
          <Button
            onClick={() => router.push("/dashboard")}
            variant="outline"
            className="gap-2"
          >
            <Home className="h-4 w-4" />
            Về trang chủ
          </Button>
        )}
      </div>
    </div>
  );
}

interface FormErrorBoundaryProps extends ErrorBoundaryProps {
  onBack?: () => void;
}

export function FormErrorBoundary({
  error,
  reset,
  onBack,
  title = "Không thể tải form",
  description = "Đã xảy ra lỗi khi tải dữ liệu form. Vui lòng thử lại.",
}: FormErrorBoundaryProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 p-8">
      <div className="flex items-center gap-3 text-destructive">
        <AlertCircle className="h-10 w-10" />
        <h2 className="text-2xl font-bold">{title}</h2>
      </div>

      <p className="text-muted-foreground text-center max-w-md">
        {description}
      </p>

      {error.message && (
        <div className="mt-2 rounded-lg border border-destructive/20 bg-destructive/5 p-4 max-w-md">
          <p className="text-sm text-destructive font-mono">{error.message}</p>
          {error.digest && (
            <p className="text-xs text-muted-foreground mt-1">
              Error ID: {error.digest}
            </p>
          )}
        </div>
      )}

      <div className="flex gap-3 mt-4">
        <Button onClick={reset} variant="default" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Thử lại
        </Button>

        <Button
          onClick={onBack || (() => router.back())}
          variant="outline"
          className="gap-2"
        >
          Quay lại
        </Button>
      </div>
    </div>
  );
}
