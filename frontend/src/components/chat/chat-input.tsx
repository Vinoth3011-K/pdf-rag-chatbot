"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { ArrowUp } from "lucide-react";

export function ChatInput({
  onSend,
  disabled
}: {
  onSend: (message: string) => void;
  disabled: boolean;
}) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        180
      )}px`;
    }
  }, [value]);

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const canSubmit = !disabled && value.trim().length > 0;

  return (
    <div className="relative flex items-end gap-2 rounded-2xl sm:rounded-3xl border border-[#383838] bg-[#212121] px-3.5 sm:px-4 py-2 sm:py-2.5 shadow-2xl focus-within:border-[#525252] focus-within:ring-1 focus-within:ring-[#525252] transition-all">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask anything about your documents..."
        rows={1}
        className="flex-1 resize-none bg-transparent py-1 sm:py-1.5 text-[16px] sm:text-[15px] text-[#ececec] placeholder:text-neutral-500 focus:outline-none max-h-36 sm:max-h-44 scrollbar-thin leading-relaxed"
      />
      <button
        type="button"
        onClick={submit}
        disabled={!canSubmit}
        className={`h-8 w-8 sm:h-9 sm:w-9 shrink-0 rounded-full flex items-center justify-center transition-all ${
          canSubmit
            ? "bg-white text-black hover:bg-neutral-200 active:scale-90 shadow-md"
            : "bg-[#2f2f2f] text-neutral-600 cursor-not-allowed"
        }`}
        title="Send message"
      >
        <ArrowUp size={17} strokeWidth={2.5} className="sm:w-[18px] sm:h-[18px]" />
      </button>
    </div>
  );
}
