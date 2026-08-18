import { Sparkles } from "lucide-react";

export function SuggestedQuestions({
  questions,
  onSelect
}: {
  questions: string[];
  onSelect: (question: string) => void;
}) {
  if (questions.length === 0) return null;

  return (
    <div className="pl-9 sm:pl-12 flex flex-wrap gap-1.5 sm:gap-2 animate-fade-up pt-1 max-w-full">
      {questions.map((q, i) => (
        <button
          key={i}
          onClick={() => onSelect(q)}
          className="inline-flex items-center gap-1.5 rounded-full border border-[#333] bg-[#1a1a1a] hover:bg-[#252525] hover:border-[#10a37f] px-3 sm:px-3.5 py-1 sm:py-1.5 text-[11px] sm:text-xs text-neutral-300 hover:text-white transition-all shadow-sm active:scale-95 text-left"
        >
          <Sparkles size={11} className="text-[#10a37f] shrink-0 sm:w-3 sm:h-3" />
          <span>{q}</span>
        </button>
      ))}
    </div>
  );
}
