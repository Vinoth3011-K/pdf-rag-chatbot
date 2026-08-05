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
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-ink-900">Dashboard</h1>
        <p className="text-ink-400 mt-1">An overview of your knowledge base and chatbot activity.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-ink-300" size={28} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard label="Uploaded PDFs" value={stats?.totalDocuments ?? 0} icon={FileStack} accent />
            <StatCard label="Chat sessions" value={stats?.totalChatSessions ?? 0} icon={MessagesSquare} />
            <StatCard label="Questions asked" value={stats?.totalQuestionsAsked ?? 0} icon={HelpCircle} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recently uploaded</CardTitle>
              <CardDescription>The latest additions to the library.</CardDescription>
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
