"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Loader2 } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { Document } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UploadDocumentDialog } from "@/components/documents/upload-document-dialog";
import { DocumentsTable } from "@/components/documents/documents-table";

const PAGE_SIZE = 10;

export default function DocumentsPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["documents", debouncedSearch, page],
    queryFn: () =>
      apiClient.get<Document[]>(
        `/documents?page=${page}&limit=${PAGE_SIZE}${
          debouncedSearch ? `&search=${encodeURIComponent(debouncedSearch)}` : ""
        }`
      ),
    refetchInterval: 8_000
  });

  const documents = data?.data ?? [];
  const pagination = data?.pagination;

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setPage(1);
      setDebouncedSearch(search);
    }
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">Knowledge Base</h1>
          <p className="text-neutral-400 text-sm mt-1">Upload, index, and manage the PDF documents available to the AI.</p>
        </div>
        <UploadDocumentDialog />
      </div>

      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
        <Input
          placeholder="Search documents by title or filename..."
          className="pl-10 h-11 bg-[#181818] border-[#2e2e2e] text-sm focus-visible:border-[#10a37f]"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleSearchKeyDown}
        />
      </div>

      <Card className="border-[#2a2a2a] bg-[#161616] overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="animate-spin text-[#10a37f]" size={32} />
            </div>
          ) : (
            <div className="px-2 sm:px-5 py-2">
              <DocumentsTable documents={documents} />
            </div>
          )}
        </CardContent>
      </Card>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
          <p className="text-xs sm:text-sm text-neutral-400 font-mono">
            Page {pagination.page} of {pagination.totalPages} · {pagination.total} documents
            {isFetching && " · refreshing..."}
          </p>
          <div className="flex gap-2 w-full sm:w-auto justify-end">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="text-xs h-9 px-3.5"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="text-xs h-9 px-3.5"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
