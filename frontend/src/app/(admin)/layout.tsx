"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { Loader2 } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { ready } = useRequireAuth();

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <Loader2 className="animate-spin text-ink-300" size={28} />
      </div>
    );
  }

  return (
    <div className="flex bg-paper min-h-screen">
      <Sidebar />
      <main className="flex-1 px-8 py-8 max-w-6xl">{children}</main>
    </div>
  );
}
