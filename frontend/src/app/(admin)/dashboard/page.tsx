"use client";

import { useQuery } from "@tanstack/react-query";
import { FileStack, MessagesSquare, HelpCircle, Loader2 } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { DashboardStats } from "@/types";
import { StatCard } from "@/components/dashboard/stat-card";
import { RecentDocumentsTable } from "@/components/dashboard/recent-documents-table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => apiClient.get<DashboardStats>("/dashboard/stats"),
    refetchInterval: 15_000
  });

  const stats = data?.data;

  return (
    <div className="space-y-8 animate-fade-up">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">Dashboard</h1>
        <p className="text-neutral-400 text-sm mt-1">An overview of your PDF knowledge base and AI query activity.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-[#10a37f]" size={32} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard label="Uploaded PDFs" value={stats?.totalDocuments ?? 0} icon={FileStack} accent />
            <StatCard label="Chat sessions" value={stats?.totalChatSessions ?? 0} icon={MessagesSquare} />
            <StatCard label="Questions asked" value={stats?.totalQuestionsAsked ?? 0} icon={HelpCircle} />
          </div>

          <Card className="border-[#2a2a2a] bg-[#161616]">
            <CardHeader>
              <CardTitle>Recently Uploaded</CardTitle>
              <CardDescription>Latest additions to the knowledge base library.</CardDescription>
            </CardHeader>
            <CardContent>
              <RecentDocumentsTable documents={stats?.recentDocuments ?? []} />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
