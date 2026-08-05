import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FileText, BookMarked } from "lucide-react";
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

  return (
    <div className={cn("flex gap-3", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="h-8 w-8 shrink-0 rounded-full bg-ink-800 text-paper flex items-center justify-center">
          <BookMarked size={15} />
        </div>
      )}

      <div className={cn("max-w-[75%] space-y-2", isUser && "flex flex-col items-end")}>
        <div
          className={cn(
            "rounded-card px-4 py-3 text-sm leading-relaxed",
            isUser ? "bg-ink-800 text-paper" : "bg-paper-card border border-ink-100 shadow-card text-ink-800"
          )}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{content}</p>
          ) : (
            <div className="prose-chat">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content || "..."}</ReactMarkdown>
            </div>
          )}
        </div>

        {!isUser && sources && sources.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {sources.map((source, i) => (
              <div
                key={`${source.documentId}-${i}`}
                title={source.snippet ?? undefined}
                className="inline-flex items-center gap-1.5 rounded-chip border border-ink-100 bg-highlight-soft/50 px-2.5 py-1 text-xs text-ink-600"
              >
                <FileText size={11} className="text-highlight-strong" />
                <span className="font-medium">{source.documentTitle}</span>
                {source.pageNumber && (
                  <span className="font-mono text-ink-400">· p.{source.pageNumber}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
