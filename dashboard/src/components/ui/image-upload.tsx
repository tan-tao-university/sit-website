"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageUploadOverlay } from "@/components/ui/image-upload-overlay";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  folder?: string;
  disabled?: boolean;
}

export function ImageUpload({
  value,
  onChange,
  folder = "achievements",
  disabled = false,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Vui lòng chọn file hình ảnh",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Kích thước file không được vượt quá 5MB",
      });
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    try {
      setIsUploading(true);
      const result = await api.upload.image(file, folder);
      onChange(result.url);
      toast({
        title: "Thành công",
        description: "Tải ảnh lên thành công",
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description:
          error instanceof Error ? error.message : "Không thể tải ảnh lên",
      });
      setPreview(value || null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || isUploading}
      />

      {preview ? (
        <div className="relative w-full max-w-md aspect-video rounded-lg overflow-hidden border border-gray-200">
          <Image
            src={preview}
            alt="Preview"
            fill
            className="object-cover"
            unoptimized
          />
          <ImageUploadOverlay show={isUploading} />
          {!disabled && (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={handleRemove}
              disabled={isUploading}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ) : (
        <div
          onClick={handleClick}
          className={`
            w-full max-w-md aspect-video rounded-lg border-2 border-dashed border-gray-300
            flex flex-col items-center justify-center gap-2
            ${
              disabled || isUploading
                ? "cursor-not-allowed opacity-50"
                : "cursor-pointer hover:border-gray-400 hover:bg-gray-50"
            }
            transition-colors
          `}
        >
          {isUploading ? (
            <>
              <Loader2 className="h-10 w-10 text-gray-400 animate-spin" />
              <p className="text-sm text-gray-500">Đang tải lên...</p>
            </>
          ) : (
            <>
              <div className="p-3 rounded-full bg-gray-100">
                <ImageIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700">
                  Nhấn để chọn ảnh
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG, GIF tối đa 5MB
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
