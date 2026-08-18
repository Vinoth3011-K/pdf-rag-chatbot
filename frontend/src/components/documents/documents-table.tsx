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
        <FileText size={36} className="mx-auto text-neutral-600 mb-3" />
        <p className="text-neutral-300 font-medium">No documents match your search</p>
        <p className="text-xs text-neutral-500 mt-1">Try a different keyword or upload a new PDF.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead>
          <tr className="text-xs font-mono uppercase tracking-wider text-neutral-400 border-b border-[#2e2e2e]">
            <th className="py-3 px-2 font-medium">Title</th>
            <th className="py-3 px-2 font-medium">Pages</th>
            <th className="py-3 px-2 font-medium">Chunks</th>
            <th className="py-3 px-2 font-medium">Size</th>
            <th className="py-3 px-2 font-medium">Status</th>
            <th className="py-3 px-2 font-medium">Uploaded</th>
            <th className="py-3 px-2 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#262626]">
          {documents.map((doc) => {
            const deleting = deleteMutation.isPending && deleteMutation.variables === doc.id;
            const reprocessing = reprocessMutation.isPending && reprocessMutation.variables === doc.id;

            return (
              <tr key={doc.id} className="hover:bg-[#1f1f1f] transition-colors group">
                <td className="py-3.5 px-2 pr-4">
                  <p className="font-medium text-white group-hover:text-[#10a37f] transition-colors">{doc.title}</p>
                  <p className="text-xs text-neutral-500 font-mono mt-0.5">{doc.originalFileName}</p>
                  {doc.status === "FAILED" && doc.errorMessage && (
                    <p className="text-xs text-red-400 bg-red-500/10 px-2 py-0.5 rounded mt-1 inline-block border border-red-500/20">{doc.errorMessage}</p>
                  )}
                </td>
                <td className="py-3.5 px-2 text-neutral-300 font-mono text-xs">{doc.pageCount ?? "—"}</td>
                <td className="py-3.5 px-2 text-neutral-300 font-mono text-xs">{doc.chunkCount ?? "—"}</td>
                <td className="py-3.5 px-2 text-neutral-300 font-mono text-xs">{formatBytes(doc.fileSizeBytes)}</td>
                <td className="py-3.5 px-2">
                  <Badge variant={statusBadgeVariant(doc.status)}>{doc.status}</Badge>
                </td>
                <td className="py-3.5 px-2 text-neutral-400 text-xs">{formatDate(doc.createdAt)}</td>
                <td className="py-3.5 px-2">
                  <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Reprocess document"
                      disabled={reprocessing}
                      onClick={() => reprocessMutation.mutate(doc.id)}
                      className="hover:bg-[#2c2c2c] text-neutral-300 hover:text-white"
                    >
                      {reprocessing ? (
                        <Loader2 size={15} className="animate-spin text-[#10a37f]" />
                      ) : (
                        <RefreshCw size={15} />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Delete document"
                      disabled={deleting}
                      onClick={() => {
                        if (confirm(`Delete "${doc.title}"? This cannot be undone.`)) {
                          deleteMutation.mutate(doc.id);
                        }
                      }}
                      className="hover:bg-red-500/20 text-neutral-400 hover:text-red-400"
                    >
                      {deleting ? (
                        <Loader2 size={15} className="animate-spin text-red-400" />
                      ) : (
                        <Trash2 size={15} />
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
