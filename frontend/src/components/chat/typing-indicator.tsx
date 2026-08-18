import { Sparkles } from "lucide-react";

export function TypingIndicator() {
  return (
    <div className="flex gap-4 w-full animate-fade-up">
      <div className="h-8 w-8 shrink-0 rounded-full bg-[#10a37f] text-white flex items-center justify-center shadow-glow mt-0.5 animate-pulse">
        <Sparkles size={16} />
      </div>
      <div className="rounded-2xl rounded-tl-sm px-4 py-3 bg-[#1e1e1e] border border-[#333] shadow-sm flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full bg-[#10a37f] animate-blink [animation-delay:0ms]" />
        <span className="h-2 w-2 rounded-full bg-[#10a37f] animate-blink [animation-delay:200ms]" />
        <span className="h-2 w-2 rounded-full bg-[#10a37f] animate-blink [animation-delay:400ms]" />
      </div>
    </div>
  );
}
