import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          "flex h-10 w-full rounded-xl border border-[#333] bg-[#141414] px-3.5 py-2 text-sm text-[#ececec] placeholder:text-neutral-500 focus-visible:outline-none focus-visible:border-[#10a37f] focus-visible:ring-1 focus-visible:ring-[#10a37f] disabled:cursor-not-allowed disabled:opacity-50 transition-all",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
