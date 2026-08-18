import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40 select-none",
  {
    variants: {
      variant: {
        default: "bg-[#10a37f] text-white hover:bg-[#1a7f64] shadow-sm active:scale-[0.98]",
        secondary: "bg-[#212121] text-neutral-200 hover:bg-[#2a2a2a] border border-[#333] hover:text-white",
        outline: "border border-[#383838] bg-transparent hover:bg-[#212121] text-neutral-300 hover:text-white",
        ghost: "hover:bg-[#212121] text-neutral-300 hover:text-white",
        destructive: "bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30",
        highlight: "bg-[#10a37f] text-white hover:bg-[#128a6c] shadow-sm",
        dark: "bg-white text-black hover:bg-neutral-200 font-semibold"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-xs rounded-lg",
        lg: "h-11 px-6 text-base rounded-xl",
        icon: "h-9 w-9 rounded-full"
      }
    },
    defaultVariants: { variant: "default", size: "default" }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
