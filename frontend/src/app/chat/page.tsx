"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { BookMarked } from "lucide-react";
import { useChatStream } from "@/hooks/use-chat-stream";
import { ChatBubble } from "@/components/chat/chat-bubble";
import { TypingIndicator } from "@/components/chat/typing-indicator";
import { SuggestedQuestions } from "@/components/chat/suggested-questions";
import { ChatInput } from "@/components/chat/chat-input";

const STARTER_PROMPTS = [
  "What documents are in the knowledge base?",
  "Summarize the key points across all PDFs",
  "What's the refund or cancellation policy?"
];

export default function ChatPage() {
  const { messages, sendMessage, isStreaming } = useChatStream();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const lastAssistant = [...messages].reverse().find((m) => m.role === "ASSISTANT");
  const showSuggestions =
    lastAssistant && !lastAssistant.streaming && lastAssistant.suggestedQuestions.length > 0;

  return (
    <main className="flex flex-col h-screen bg-paper">
      <header className="border-b border-ink-100 bg-paper-card px-6 py-3.5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-ink-800">
          <BookMarked size={19} className="text-highlight-strong" />
          <span className="font-display italic text-lg">Marginal</span>
        </Link>
        <span className="text-xs font-mono text-ink-300 uppercase tracking-wide">Public knowledge base</span>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
          {messages.length === 0 ? (
            <div className="text-center py-20">
              <BookMarked size={32} className="mx-auto text-ink-200 mb-4" />
              <h1 className="font-display text-2xl text-ink-900 mb-2">Ask your knowledge base</h1>
              <p className="text-ink-400 max-w-sm mx-auto mb-8">
                Every answer is drawn from the uploaded PDFs and cited with the source page.
              </p>
              <div className="flex flex-col gap-2 max-w-md mx-auto">
                {STARTER_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    className="text-left rounded-card border border-ink-100 bg-paper-card px-4 py-3 text-sm text-ink-600 hover:border-highlight hover:text-ink-800 transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((message) =>
              message.streaming && message.content === "" ? (
                <TypingIndicator key={message.id} />
              ) : (
                <ChatBubble
                  key={message.id}
                  role={message.role}
                  content={message.content}
                  sources={message.sources}
                />
              )
            )
          )}

          {showSuggestions && (
            <SuggestedQuestions questions={lastAssistant!.suggestedQuestions} onSelect={sendMessage} />
          )}
        </div>
      </div>

      <div className="border-t border-ink-100 bg-paper-card px-6 py-4">
        <div className="max-w-3xl mx-auto">
          <ChatInput onSend={sendMessage} disabled={isStreaming} />
          <p className="text-xs text-ink-300 text-center mt-2">
            Answers may be imperfect — always verify against the source document.
          </p>
        </div>
      </div>
    </main>
  );
}
