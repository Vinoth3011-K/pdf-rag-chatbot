import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium font-mono uppercase tracking-wide",
  {
    variants: {
      variant: {
        default: "bg-[#282828] text-neutral-300 border border-[#383838]",
        success: "bg-[#10a37f]/15 text-[#10b981] border border-[#10a37f]/30",
        warning: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
        destructive: "bg-red-500/15 text-red-400 border border-red-500/30",
        pending: "bg-[#282828] text-neutral-400 border border-[#383838]"
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
