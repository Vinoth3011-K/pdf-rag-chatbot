"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Sparkles, Plus, FileText, ArrowRight, ShieldCheck } from "lucide-react";
import { useChatStream } from "@/hooks/use-chat-stream";
import { ChatBubble } from "@/components/chat/chat-bubble";
import { TypingIndicator } from "@/components/chat/typing-indicator";
import { SuggestedQuestions } from "@/components/chat/suggested-questions";
import { ChatInput } from "@/components/chat/chat-input";

const STARTER_PROMPTS = [
  {
    title: "Document Summary",
    desc: "Summarize the key insights across all uploaded PDFs",
    prompt: "Summarize the key points across all PDFs in the knowledge base."
  },
  {
    title: "Search Knowledge Base",
    desc: "What topics and documents are available to query?",
    prompt: "What documents and topics are available in the knowledge base?"
  },
  {
    title: "Policies & Terms",
    desc: "Extract regulations, terms, or cancellation guidelines",
    prompt: "What are the key policies, terms, or regulations mentioned in the documents?"
  },
  {
    title: "Key Data & Facts",
    desc: "Extract specific metrics, dates, and conclusions",
    prompt: "Extract the most important facts, numbers, and conclusions from the files."
  }
];

export default function ChatPage() {
  const { messages, sendMessage, isStreaming } = useChatStream();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth"
    });
  }, [messages]);

  const lastAssistant = [...messages].reverse().find((m) => m.role === "ASSISTANT");
  const showSuggestions =
    lastAssistant && !lastAssistant.streaming && lastAssistant.suggestedQuestions.length > 0;

  const handleResetChat = () => {
    window.location.reload();
  };

  return (
    <main className="flex flex-col h-screen h-[100dvh] bg-[#0d0d0d] text-[#ececec] overflow-hidden">
      {/* Top Navigation Bar */}
      <header className="h-13 sm:h-14 border-b border-[#222222] bg-[#141414]/90 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Link href="/" className="flex items-center gap-2 sm:gap-2.5 text-white hover:opacity-90 transition-opacity shrink-0">
            <div className="h-7 w-7 rounded-lg bg-[#10a37f] flex items-center justify-center text-white shadow-glow">
              <Sparkles size={15} />
            </div>
            <span className="font-semibold tracking-tight text-sm sm:text-base">Marginal <span className="text-[10px] sm:text-xs text-neutral-400 font-normal">AI</span></span>
          </Link>
          <span className="hidden md:inline-block text-xs font-mono bg-[#212121] border border-[#333] text-neutral-400 px-2.5 py-0.5 rounded-full truncate">
            PDF Knowledge Base
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {messages.length > 0 && (
            <button
              onClick={handleResetChat}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#333] bg-[#1c1c1c] hover:bg-[#282828] hover:text-white px-2.5 sm:px-3 py-1.5 text-xs text-neutral-300 transition-colors"
              title="Start a new chat"
            >
              <Plus size={14} />
              <span className="hidden sm:inline">New Chat</span>
            </button>
          )}

          <Link
            href="/documents"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#333] bg-[#1c1c1c] hover:bg-[#282828] hover:text-white px-2.5 sm:px-3 py-1.5 text-xs text-neutral-300 transition-colors"
          >
            <FileText size={14} className="text-[#10a37f]" />
            <span className="hidden sm:inline">Documents</span>
          </Link>

          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-lg bg-[#242424] hover:bg-[#2e2e2e] text-neutral-300 hover:text-white h-8 w-8 sm:w-auto sm:px-2.5 py-1.5 text-xs transition-colors"
            title="Admin Login"
          >
            <ShieldCheck size={14} />
          </Link>
        </div>
      </header>

      {/* Main Chat Scroll Container */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin overscroll-contain">
        <div className="max-w-3xl lg:max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-4 sm:space-y-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 sm:py-16 text-center animate-fade-up px-1">
              {/* ChatGPT Hero Avatar */}
              <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-2xl bg-[#171717] border border-[#2e2e2e] shadow-glow flex items-center justify-center text-[#10a37f] mb-4 sm:mb-6">
                <Sparkles size={24} className="sm:w-8 sm:h-8" />
              </div>

              <h1 className="text-xl sm:text-3xl font-semibold text-white tracking-tight mb-2">
                What would you like to know?
              </h1>
              <p className="text-xs sm:text-sm text-neutral-400 max-w-md mx-auto mb-6 sm:mb-10 leading-relaxed px-2">
                Ask questions across your entire PDF library. Every response is synthesized with verified, clickable page citations.
              </p>

              {/* Starter Prompts Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 w-full max-w-2xl text-left">
                {STARTER_PROMPTS.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => sendMessage(item.prompt)}
                    className="group flex flex-col justify-between p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-[#2a2a2a] bg-[#181818] hover:bg-[#202020] hover:border-[#404040] transition-all text-left shadow-sm active:scale-[0.98]"
                  >
                    <div>
                      <h3 className="text-xs sm:text-sm font-medium text-white mb-0.5 sm:mb-1 flex items-center justify-between">
                        {item.title}
                        <ArrowRight size={13} className="text-neutral-500 group-hover:text-[#10a37f] group-hover:translate-x-0.5 transition-all shrink-0 ml-1" />
                      </h3>
                      <p className="text-[11px] sm:text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {messages.map((message) =>
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
              )}

              {showSuggestions && (
                <SuggestedQuestions
                  questions={lastAssistant!.suggestedQuestions}
                  onSelect={sendMessage}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Fixed / Sticky Bottom Input Bar */}
      <div className="border-t border-[#222222] bg-[#111111]/95 backdrop-blur-md px-3 sm:px-4 pt-2.5 sm:pt-3 pb-[max(0.6rem,env(safe-area-inset-bottom))] shrink-0">
        <div className="max-w-3xl lg:max-w-4xl mx-auto">
          <ChatInput onSend={sendMessage} disabled={isStreaming} />
          <p className="text-[10px] sm:text-[11px] text-neutral-500 text-center mt-1.5 sm:mt-2.5 leading-normal">
            Marginal AI answers are grounded in your uploaded documents. Verify key details in original PDFs.
          </p>
        </div>
      </div>
    </main>
  );
}
