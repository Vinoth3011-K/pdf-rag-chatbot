"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FileText, Sparkles, Copy, Check, User } from "lucide-react";
import { ChatSource } from "@/types";
import { cn } from "@/lib/utils";

export function ChatBubble({
  role,
  content,
  sources
}: {
  role: "USER" | "ASSISTANT";
  content: string;
  sources?: ChatSource[];
}) {
  const isUser = role === "USER";
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    if (!content) return;
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        "flex gap-2.5 sm:gap-3.5 w-full animate-fade-up max-w-full overflow-hidden",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {/* Assistant Avatar */}
      {!isUser && (
        <div className="h-7 w-7 sm:h-8 sm:w-8 shrink-0 rounded-full bg-[#10a37f] text-white flex items-center justify-center shadow-glow mt-0.5">
          <Sparkles size={14} className="sm:w-4 sm:h-4" />
        </div>
      )}

      <div
        className={cn(
          "space-y-2 max-w-[88%] sm:max-w-[82%] min-w-0",
          isUser && "flex flex-col items-end"
        )}
      >
        {/* Message Container */}
        <div
          className={cn(
            "text-[14px] sm:text-[15px] leading-relaxed transition-all break-words overflow-hidden",
            isUser
              ? "rounded-2xl rounded-tr-sm bg-[#2f2f2f] text-white px-3.5 sm:px-5 py-2.5 sm:py-3 shadow-sm border border-[#3c3c3c]"
              : "text-[#ececec] px-0.5 sm:px-1 py-1"
          )}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap break-words">{content}</p>
          ) : (
            <div className="prose-chat break-words overflow-x-auto scrollbar-thin">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content || "..."}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Copy Button & Sources for Assistant */}
        {!isUser && content && (
          <div className="flex flex-col gap-2 pt-0.5 max-w-full">
            <div className="flex items-center gap-2">
              <button
                onClick={copyToClipboard}
                className="inline-flex items-center gap-1 text-[11px] sm:text-xs text-neutral-400 hover:text-neutral-200 transition-colors py-1 px-2 rounded-md hover:bg-[#212121] active:bg-[#282828]"
                title="Copy response"
              >
                {copied ? (
                  <>
                    <Check size={12} className="text-[#10a37f]" />
                    <span className="text-[#10a37f]">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy size={12} />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            {/* Source Citations */}
            {sources && sources.length > 0 && (
              <div className="pt-2 border-t border-[#222] max-w-full">
                <p className="text-[10px] sm:text-[11px] font-mono text-neutral-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <FileText size={11} className="text-[#10a37f]" />
                  Cited Sources ({sources.length})
                </p>
                <div className="flex flex-wrap gap-1.5 max-w-full">
                  {sources.map((source, i) => (
                    <div
                      key={`${source.documentId}-${i}`}
                      title={source.snippet ?? undefined}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[#333] bg-[#1a1a1a] hover:bg-[#222] px-2.5 sm:px-3 py-0.5 sm:py-1 text-[11px] sm:text-xs text-neutral-300 transition-all max-w-full"
                    >
                      <span className="font-medium text-neutral-200 max-w-[120px] sm:max-w-[200px] truncate">
                        {source.documentTitle}
                      </span>
                      {source.pageNumber && (
                        <span className="font-mono text-[#10a37f] bg-[#10a37f]/10 px-1.5 py-0.2 rounded-full text-[9px] sm:text-[10px]">
                          p.{source.pageNumber}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="h-7 w-7 sm:h-8 sm:w-8 shrink-0 rounded-full bg-[#262626] border border-[#3a3a3a] text-neutral-300 flex items-center justify-center mt-0.5">
          <User size={13} className="sm:w-3.5 sm:h-3.5" />
        </div>
      )}
    </div>
  );
}
