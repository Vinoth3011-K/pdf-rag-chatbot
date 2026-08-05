"use client";

import { useState, KeyboardEvent } from "react";
import { SendHorizonal } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ChatInput({
  onSend,
  disabled
}: {
  onSend: (message: string) => void;
  disabled: boolean;
}) {
  const [value, setValue] = useState("");

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="flex items-end gap-2 rounded-card border border-ink-200 bg-paper-card p-2 shadow-card focus-within:ring-2 focus-within:ring-highlight">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask something about your documents..."
        rows={1}
        className="flex-1 resize-none bg-transparent px-3 py-2 text-sm text-ink-800 placeholder:text-ink-300 focus:outline-none max-h-40"
      />
      <Button size="icon" onClick={submit} disabled={disabled || !value.trim()}>
        <SendHorizonal size={16} />
      </Button>
    </div>
  );
}
