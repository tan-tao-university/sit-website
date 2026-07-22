import { cn } from "@/lib/utils";

interface EditPageCardProps {
  children: React.ReactNode;
  className?: string;
}

export function EditPageCard({ children, className }: EditPageCardProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-[#e8e2dc] bg-white",
        className,
      )}
    >
      <div className="p-6 sm:p-8">{children}</div>
    </div>
  );
}
