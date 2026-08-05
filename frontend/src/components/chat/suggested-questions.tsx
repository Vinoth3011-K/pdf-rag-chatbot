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
    <div className="pl-11 flex flex-wrap gap-2 animate-fade-up">
      {questions.map((q, i) => (
        <button
          key={i}
          onClick={() => onSelect(q)}
          className="inline-flex items-center gap-1.5 rounded-chip border border-ink-200 bg-paper-card px-3 py-1.5 text-xs font-medium text-ink-600 hover:border-highlight hover:text-highlight-strong transition-colors"
        >
          <Sparkles size={11} className="text-highlight-strong" />
          {q}
        </button>
      ))}
    </div>
  );
}
