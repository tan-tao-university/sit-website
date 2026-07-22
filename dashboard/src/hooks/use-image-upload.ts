"use client";

import { useState, type ChangeEvent } from "react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface UseImageUploadOptions {
  folder: string;
  onUploaded: (url: string) => void;
  maxSizeMB?: number;
  initialPreview?: string;
}

export function useImageUpload({
  folder,
  onUploaded,
  maxSizeMB = 5,
  initialPreview = "",
}: UseImageUploadOptions) {
  const [preview, setPreview] = useState<string>(initialPreview);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        variant: "destructive",
        title: "Lỗi định dạng",
        description: "Vui lòng chọn file hình ảnh (JPG, PNG, WebP...)",
      });
      e.target.value = "";
      return;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File quá lớn",
        description: `Kích thước file không được vượt quá ${maxSizeMB}MB`,
      });
      e.target.value = "";
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setIsUploading(true);

    try {
      const result = await api.upload.image(file, folder);
      onUploaded(result.url);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description:
          error instanceof Error ? error.message : "Không thể tải ảnh lên",
      });
      setPreview(initialPreview);
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const reset = () => setPreview("");

  return { preview, isUploading, handleFileChange, setPreview, reset };
}
