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
    <Card className="p-6 border-[#2a2a2a] bg-[#161616]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-mono uppercase tracking-wider text-neutral-400 mb-2">{label}</p>
          <p className="text-3xl font-semibold text-white tracking-tight">{value}</p>
        </div>
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl",
            accent
              ? "bg-[#10a37f]/15 text-[#10a37f] border border-[#10a37f]/30"
              : "bg-[#222] text-neutral-400 border border-[#333]"
          )}
        >
          <Icon size={20} />
        </div>
      </div>
    </Card>
  );
}
