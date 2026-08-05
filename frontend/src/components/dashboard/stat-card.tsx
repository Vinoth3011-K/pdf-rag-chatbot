import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon: Icon,
  accent = false
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: boolean;
}) {
  return (
    <Card tab className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-mono uppercase tracking-wide text-ink-400 mb-2">{label}</p>
          <p className="font-display text-3xl text-ink-900">{value}</p>
        </div>
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-card",
            accent ? "bg-highlight-soft text-highlight-strong" : "bg-ink-50 text-ink-500"
          )}
        >
          <Icon size={18} />
        </div>
      </div>
    </Card>
  );
}
