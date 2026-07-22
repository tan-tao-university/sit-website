"use client";

import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { cn } from "@/lib/utils";

export interface WizardStep {
  id: number;
  title: string;
  description: string;
}

interface StepWizardProps {
  steps: readonly WizardStep[];
  currentStep: number;
  isLoading?: boolean;
  submitLabel?: string;
  confirmTitle?: string;
  confirmDescription?: string;
  onBack: () => void;
  onNext: () => void;
  children: React.ReactNode;
}

export function StepWizard({
  steps,
  currentStep,
  isLoading = false,
  submitLabel = "Hoàn tất",
  confirmTitle = "Xác nhận tạo dữ liệu",
  confirmDescription = "Vui lòng kiểm tra lại thông tin ở bước Xem lại trước khi xác nhận. Sau khi xác nhận, dữ liệu sẽ được tạo ngay.",
  onBack,
  onNext,
  children,
}: StepWizardProps) {
  const activeStep = steps.find((step) => step.id === currentStep) ?? steps[0];
  const isLastStep = currentStep >= steps.length;
  const [confirmOpen, setConfirmOpen] = useState(false);
  const hiddenSubmitRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="overflow-hidden rounded-2xl border border-[#e8e2dc] bg-white">
      <div className="grid grid-cols-1 md:grid-cols-[260px_1fr]">
        <div className="border-b border-[#e8e2dc] bg-[#fdfbf9] p-6 md:border-b-0 md:border-r">
          <nav className="space-y-0">
            {steps.map((step, index) => {
              const isActive = currentStep === step.id;
              const isDone = currentStep > step.id;
              return (
                <div
                  key={step.id}
                  className="relative flex gap-3 pb-8 last:pb-0"
                >
                  {index < steps.length - 1 && (
                    <span className="absolute left-4 top-8 h-[calc(100%-2rem)] w-px bg-[#e8e2dc]" />
                  )}
                  <span
                    className={cn(
                      "z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                      isActive
                        ? "bg-primary text-white"
                        : isDone
                          ? "bg-primary/15 text-primary"
                          : "bg-[#efe9e4] text-stone-400",
                    )}
                  >
                    {isDone ? <Check className="h-4 w-4" /> : step.id}
                  </span>
                  <div className="pt-1">
                    <p
                      className={cn(
                        "text-sm font-semibold",
                        isActive
                          ? "text-stone-950"
                          : isDone
                            ? "text-stone-700"
                            : "text-stone-400",
                      )}
                    >
                      {step.title}
                    </p>
                    <p className="mt-0.5 hidden text-xs text-muted-foreground sm:block">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </nav>
        </div>

        <div className="p-6 sm:p-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold tracking-[-0.02em] text-stone-950">
              {activeStep.title}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {activeStep.description}
            </p>
          </div>

          {children}

          <div className="mt-8 flex items-center justify-between border-t border-[#eee9e4] pt-6">
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer"
              onClick={onBack}
              disabled={currentStep === 1 || isLoading}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại
            </Button>
            {!isLastStep ? (
              <Button type="button" className="cursor-pointer" onClick={onNext}>
                Tiếp tục
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                disabled={isLoading}
                className="cursor-pointer"
                onClick={() => setConfirmOpen(true)}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {submitLabel}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Hidden submit trigger: the actual form submission only fires after the user confirms in the dialog below. */}
      <button
        ref={hiddenSubmitRef}
        type="submit"
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
      />

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={() => hiddenSubmitRef.current?.click()}
        title={confirmTitle}
        description={confirmDescription}
        confirmText={submitLabel}
      />
    </div>
  );
}
