import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-chip px-2.5 py-0.5 text-xs font-medium font-mono uppercase tracking-wide",
  {
    variants: {
      variant: {
        default: "bg-ink-50 text-ink-600",
        success: "bg-teal-soft text-teal",
        warning: "bg-highlight-soft text-highlight-strong",
        destructive: "bg-red-50 text-destructive",
        pending: "bg-ink-100 text-ink-500"
      }
    },
    defaultVariants: { variant: "default" }
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
