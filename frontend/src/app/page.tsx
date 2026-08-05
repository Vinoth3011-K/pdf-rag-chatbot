import Link from "next/link";
import { MessageSquareText, ShieldCheck } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-paper px-6">
      <div className="max-w-lg w-full text-center">
        <div className="inline-flex items-center gap-2 text-highlight-strong font-mono text-xs uppercase tracking-widest mb-4">
          <span className="w-6 h-px bg-highlight-strong" />
          Knowledge base
          <span className="w-6 h-px bg-highlight-strong" />
        </div>
        <h1 className="font-display text-5xl italic text-ink-900 mb-3">Marginal</h1>
        <p className="text-ink-500 mb-10 leading-relaxed">
          Ask questions of your PDF library. Every answer comes with the page it was
          drawn from, underlined like a note in the margin.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/chat"
            className="inline-flex items-center justify-center gap-2 rounded-card bg-ink-800 text-paper px-6 py-3 font-medium hover:bg-ink-900 transition-colors"
          >
            <MessageSquareText size={18} />
            Start a conversation
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 rounded-card border border-ink-200 px-6 py-3 font-medium text-ink-700 hover:bg-ink-50 transition-colors"
          >
            <ShieldCheck size={18} />
            Admin sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
