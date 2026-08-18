"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Sparkles, LayoutDashboard, FileStack, MessageSquareText, LogOut, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/lib/auth-store";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/documents", label: "Knowledge Base", icon: FileStack }
];

export function Sidebar({
  isOpen,
  onClose
}: {
  isOpen?: boolean;
  onClose?: () => void;
}) {
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

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      <aside
        className={cn(
          "w-64 shrink-0 border-r border-[#262626] bg-[#141414] min-h-screen flex flex-col transition-transform duration-300 z-50",
          "fixed top-0 bottom-0 left-0 lg:static lg:translate-x-0",
          isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-6 py-5 text-white border-b border-[#222]">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-[#10a37f] flex items-center justify-center text-white shadow-glow">
              <Sparkles size={16} />
            </div>
            <span className="font-semibold tracking-tight text-lg">
              Marginal <span className="text-xs text-neutral-400 font-normal">Admin</span>
            </span>
          </div>

          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-1 text-neutral-400 hover:text-white rounded-lg hover:bg-[#222]"
            title="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1.5">
          {navItems.map((item) => {
            const active = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleLinkClick}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all",
                  active
                    ? "bg-[#242424] text-white shadow-sm border border-[#333]"
                    : "text-neutral-400 hover:text-white hover:bg-[#1e1e1e]"
                )}
              >
                <Icon size={18} className={active ? "text-[#10a37f]" : "text-neutral-500"} />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <div className="pt-3">
            <Link
              href="/chat"
              onClick={handleLinkClick}
              className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-neutral-400 hover:text-white hover:bg-[#1e1e1e] transition-all"
            >
              <MessageSquareText size={18} className="text-[#10a37f]" />
              <span>Open Chat</span>
            </Link>
          </div>
        </nav>

        <div className="px-3 pb-5 border-t border-[#222] pt-4">
          <div className="px-3 mb-3">
            <p className="text-sm font-medium text-white truncate">{user?.name || "Admin"}</p>
            <p className="text-xs text-neutral-500 truncate font-mono">{user?.email || "admin@example.com"}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={17} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
