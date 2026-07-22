"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploadOverlayProps {
  show: boolean;
  label?: string;
  className?: string;
  compact?: boolean;
}

export function ImageUploadOverlay({
  show,
  label = "Đang tải ảnh lên...",
  className,
  compact = false,
}: ImageUploadOverlayProps) {
  if (!show) return null;

  return (
    <div
      className={cn(
        "absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 rounded-[inherit] bg-black/60 text-white",
        className,
      )}
    >
      <Loader2 className={compact ? "h-4 w-4 animate-spin" : "h-6 w-6 animate-spin"} />
      {!compact && <span className="text-xs font-medium">{label}</span>}
    </div>
  );
}
