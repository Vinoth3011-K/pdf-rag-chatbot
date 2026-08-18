"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { Loader2, Menu, Sparkles } from "lucide-react";
import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { ready } = useRequireAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d0d0d]">
        <Loader2 className="animate-spin text-[#10a37f]" size={32} />
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row bg-[#0d0d0d] min-h-screen text-[#ececec] overflow-x-hidden">
      {/* Mobile Topbar for Admin */}
      <header className="lg:hidden h-14 border-b border-[#262626] bg-[#141414] px-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-1 text-neutral-300 hover:text-white rounded-lg hover:bg-[#222] transition-colors"
            title="Open navigation menu"
          >
            <Menu size={20} />
          </button>
          <Link href="/dashboard" className="flex items-center gap-2 text-white">
            <div className="h-6 w-6 rounded-md bg-[#10a37f] flex items-center justify-center text-white shadow-glow">
              <Sparkles size={14} />
            </div>
            <span className="font-semibold text-sm">Marginal Admin</span>
          </Link>
        </div>
      </header>

      {/* Responsive Sidebar (desktop static + mobile drawer) */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <main className="flex-1 px-4 sm:px-8 py-6 sm:py-8 max-w-6xl w-full mx-auto overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
