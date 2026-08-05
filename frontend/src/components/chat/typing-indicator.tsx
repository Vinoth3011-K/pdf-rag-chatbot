import { BookMarked } from "lucide-react";

export function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="h-8 w-8 shrink-0 rounded-full bg-ink-800 text-paper flex items-center justify-center">
        <BookMarked size={15} />
      </div>
      <div className="rounded-card px-4 py-3.5 bg-paper-card border border-ink-100 shadow-card flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-ink-300 animate-blink [animation-delay:0ms]" />
        <span className="h-1.5 w-1.5 rounded-full bg-ink-300 animate-blink [animation-delay:200ms]" />
        <span className="h-1.5 w-1.5 rounded-full bg-ink-300 animate-blink [animation-delay:400ms]" />
      </div>
    </div>
  );
}
