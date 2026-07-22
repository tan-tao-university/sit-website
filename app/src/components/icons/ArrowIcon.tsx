import {
  ArrowDown01FreeIcons,
  ArrowLeft02FreeIcons,
  ArrowRight02FreeIcons,
  ArrowUp01FreeIcons,
  ArrowUpRight01FreeIcons,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

type ArrowIconDirection = "up-right" | "right" | "down" | "left" | "up";

const iconByDirection = {
  "up-right": ArrowUpRight01FreeIcons,
  right: ArrowRight02FreeIcons,
  down: ArrowDown01FreeIcons,
  left: ArrowLeft02FreeIcons,
  up: ArrowUp01FreeIcons,
} as const;

type ArrowIconProps = Omit<ComponentProps<typeof HugeiconsIcon>, "icon"> & {
  direction?: ArrowIconDirection;
};

export function ArrowIcon({
  direction = "right",
  className,
  size = 17,
  strokeWidth = 1.8,
  ...props
}: ArrowIconProps) {
  return (
    <HugeiconsIcon
      aria-hidden="true"
      icon={iconByDirection[direction]}
      size={size}
      strokeWidth={strokeWidth}
      className={cn("inline-block shrink-0 align-[-0.125em]", className)}
      {...props}
    />
  );
}
