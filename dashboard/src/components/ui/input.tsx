import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps extends React.ComponentProps<"input"> {
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          error
            ? "border-destructive focus-visible:ring-destructive data-[error=true]:border-destructive"
            : "border-input focus-visible:ring-ring",
          className,
        )}
        ref={ref}
        data-error={error}
        aria-invalid={error}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
