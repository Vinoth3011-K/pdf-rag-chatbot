"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { RefreshCw, Trash2, FileText, Loader2 } from "lucide-react";
import { Document } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";
import { formatBytes, formatDate, statusBadgeVariant } from "@/lib/format";

export function DocumentsTable({ documents }: { documents: Document[] }) {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["documents"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
  };

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/documents/${id}`),
    onSuccess: invalidate
  });

  const reprocessMutation = useMutation({
    mutationFn: (id: string) => apiClient.post(`/documents/${id}/reprocess`),
    onSuccess: invalidate
  });

  if (documents.length === 0) {
    return (
      <div className="text-center py-16">
        <FileText size={32} className="mx-auto text-ink-200 mb-3" />
        <p className="text-ink-500 font-medium">No documents match your search</p>
        <p className="text-sm text-ink-300">Try a different keyword or upload a new PDF.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs font-mono uppercase tracking-wide text-ink-400 border-b border-ink-100">
            <th className="py-2.5 font-medium">Title</th>
            <th className="py-2.5 font-medium">Pages</th>
            <th className="py-2.5 font-medium">Chunks</th>
            <th className="py-2.5 font-medium">Size</th>
            <th className="py-2.5 font-medium">Status</th>
            <th className="py-2.5 font-medium">Uploaded</th>
            <th className="py-2.5 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {documents.map((doc) => {
            const deleting = deleteMutation.isPending && deleteMutation.variables === doc.id;
            const reprocessing = reprocessMutation.isPending && reprocessMutation.variables === doc.id;

            return (
              <tr key={doc.id} className="border-b border-ink-50 last:border-0 group">
                <td className="py-3 pr-4">
                  <p className="font-medium text-ink-800">{doc.title}</p>
                  <p className="text-xs text-ink-400 font-mono">{doc.originalFileName}</p>
                  {doc.status === "FAILED" && doc.errorMessage && (
                    <p className="text-xs text-destructive mt-0.5">{doc.errorMessage}</p>
                  )}
                </td>
                <td className="py-3 text-ink-500">{doc.pageCount ?? "—"}</td>
                <td className="py-3 text-ink-500">{doc.chunkCount ?? "—"}</td>
                <td className="py-3 text-ink-500">{formatBytes(doc.fileSizeBytes)}</td>
                <td className="py-3">
                  <Badge variant={statusBadgeVariant(doc.status)}>{doc.status}</Badge>
                </td>
                <td className="py-3 text-ink-500">{formatDate(doc.createdAt)}</td>
                <td className="py-3">
                  <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Reprocess"
                      disabled={reprocessing}
                      onClick={() => reprocessMutation.mutate(doc.id)}
                    >
                      {reprocessing ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <RefreshCw size={16} />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Delete"
                      disabled={deleting}
                      onClick={() => {
                        if (confirm(`Delete "${doc.title}"? This cannot be undone.`)) {
                          deleteMutation.mutate(doc.id);
                        }
                      }}
                    >
                      {deleting ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Trash2 size={16} className="text-destructive" />
                      )}
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
