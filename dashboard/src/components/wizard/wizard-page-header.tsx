"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WizardPageHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
  onCancel: () => void;
}

export function WizardPageHeader({
  eyebrow,
  title,
  description,
  onCancel,
}: WizardPageHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
          <span className="h-px w-5 bg-primary" />
          {eyebrow}
        </div>
        <h1 className="text-[28px] font-semibold tracking-[-0.035em] text-stone-950 sm:text-[32px]">
          {title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <Button
        type="button"
        variant="outline"
        className="cursor-pointer"
        onClick={onCancel}
      >
        <X className="mr-2 h-4 w-4" />
        Hủy
      </Button>
    </div>
  );
}
