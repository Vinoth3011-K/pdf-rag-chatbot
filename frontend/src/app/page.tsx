import Link from "next/link";
import { MessageSquareText, ShieldCheck, Sparkles, FileText, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#0d0d0d] text-[#ececec] px-6 relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#10a37f]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-xl w-full text-center relative z-10 animate-fade-up">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#333] bg-[#1a1a1a] px-3.5 py-1 text-xs text-[#10a37f] font-mono mb-6 shadow-sm">
          <Sparkles size={13} />
          <span>AI-Powered PDF Assistant</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white mb-4">
          Chat with your <span className="text-[#10a37f]">PDFs</span>
        </h1>

        <p className="text-neutral-400 text-base sm:text-lg mb-10 leading-relaxed max-w-lg mx-auto">
          Query your documents naturally using generative AI. Get accurate, source-cited responses with exact page numbers.
        </p>

        <div className="flex flex-col sm:flex-row gap-3.5 justify-center">
          <Link
            href="/chat"
            className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-[#10a37f] text-white px-7 py-3.5 font-medium hover:bg-[#1a7f64] transition-all shadow-glow active:scale-[0.98]"
          >
            <MessageSquareText size={18} />
            <span>Start Chatting</span>
            <ArrowRight size={16} />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#333] bg-[#1a1a1a] hover:bg-[#222] px-6 py-3.5 font-medium text-neutral-300 hover:text-white transition-all active:scale-[0.98]"
          >
            <ShieldCheck size={18} />
            <span>Admin Sign In</span>
          </Link>
        </div>

        <div className="mt-14 pt-8 border-t border-[#222] flex items-center justify-center gap-6 text-xs text-neutral-500 font-mono">
          <span className="flex items-center gap-1.5">
            <FileText size={14} className="text-[#10a37f]" /> Multi-PDF RAG
          </span>
          <span>•</span>
          <span>Chunked Vectors</span>
          <span>•</span>
          <span>Page Citations</span>
        </div>
      </div>
    </main>
  );
}
