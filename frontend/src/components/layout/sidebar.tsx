"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookMarked, LayoutDashboard, FileStack, MessageSquareText, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/lib/auth-store";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/documents", label: "Knowledge base", icon: FileStack }
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();

  const handleLogout = async () => {
    try {
      await apiClient.post("/auth/logout");
    } finally {
      clearAuth();
      router.push("/login");
    }
  };

  return (
    <aside className="w-64 shrink-0 border-r border-ink-100 bg-paper-card min-h-screen flex flex-col">
      <div className="flex items-center gap-2 px-6 py-6 text-ink-800">
        <BookMarked size={20} className="text-highlight-strong" />
        <span className="font-display italic text-xl">Marginal</span>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const active = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-card px-3 py-2.5 text-sm font-medium transition-colors",
                active ? "bg-ink-800 text-paper" : "text-ink-600 hover:bg-ink-50"
              )}
            >
              <Icon size={17} />
              {item.label}
            </Link>
          );
        })}
        <Link
          href="/chat"
          target="_blank"
          className="flex items-center gap-3 rounded-card px-3 py-2.5 text-sm font-medium text-ink-600 hover:bg-ink-50"
        >
          <MessageSquareText size={17} />
          View public chat
        </Link>
      </nav>

      <div className="px-3 pb-5 border-t border-ink-100 pt-4">
        <div className="px-3 mb-3">
          <p className="text-sm font-medium text-ink-800 truncate">{user?.name}</p>
          <p className="text-xs text-ink-400 truncate">{user?.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 rounded-card px-3 py-2.5 text-sm font-medium text-ink-600 hover:bg-ink-50"
        >
          <LogOut size={17} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
