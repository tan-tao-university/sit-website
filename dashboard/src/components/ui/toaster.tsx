"use client";

import { AlertTriangle, Check, Clock3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        const isLoading =
          props.variant === "loading" ||
          (typeof title === "string" && title.toLowerCase().includes("đang"));
        const isDestructive = props.variant === "destructive";
        const Icon = isDestructive ? AlertTriangle : isLoading ? Clock3 : Check;

        return (
          <Toast
            key={id}
            {...props}
            variant={isLoading ? "loading" : props.variant}
          >
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                isDestructive
                  ? "bg-[#fff0ee] text-[#b83d32]"
                  : isLoading
                    ? "bg-[#fbf0ea] text-primary"
                    : "bg-[#f0f7ee] text-[#5f7b59]"
              }`}
            >
              <Icon className="h-4 w-4 stroke-[2]" />
            </div>
            <div className="grid min-w-0 flex-1 gap-0.5 pt-0.5">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
