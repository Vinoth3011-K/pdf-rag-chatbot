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
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl text-ink-900">Knowledge base</h1>
          <p className="text-ink-400 mt-1">Upload, search, and manage the PDFs your chatbot can answer from.</p>
        </div>
        <UploadDocumentDialog />
      </div>

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
        <Input
          placeholder="Search by title or filename..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleSearchKeyDown}
        />
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="animate-spin text-ink-300" size={28} />
            </div>
          ) : (
            <div className="px-5 py-2">
              <DocumentsTable documents={documents} />
            </div>
          )}
        </CardContent>
      </Card>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-ink-400">
            Page {pagination.page} of {pagination.totalPages} · {pagination.total} documents
            {isFetching && " · refreshing..."}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
