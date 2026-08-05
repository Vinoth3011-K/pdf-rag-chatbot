"use client";

import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UploadCloud, Loader2, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { apiClient, ApiClientError } from "@/lib/api-client";

export function UploadDocumentDialog() {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (selected: File) => {
      const formData = new FormData();
      formData.append("file", selected);
      return apiClient.post("/documents/upload", formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      setOpen(false);
      setFile(null);
    },
    onError: (err) => {
      setError(err instanceof ApiClientError ? err.message : "Upload failed");
    }
  });

  const handleFile = (selected: File | undefined) => {
    if (!selected) return;
    if (selected.type !== "application/pdf") {
      setError("Only PDF files are supported");
      return;
    }
    setError(null);
    setFile(selected);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="highlight">
          <UploadCloud size={16} />
          Upload PDF
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Upload a PDF</DialogTitle>
        <DialogDescription>
          The document will be indexed automatically: text extracted, split into chunks, embedded, and
          stored for retrieval.
        </DialogDescription>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFile(e.dataTransfer.files?.[0]);
          }}
          onClick={() => inputRef.current?.click()}
          className={`mt-4 flex flex-col items-center justify-center gap-2 rounded-card border-2 border-dashed px-6 py-10 text-center cursor-pointer transition-colors ${
            dragOver ? "border-highlight bg-highlight-soft/40" : "border-ink-200 hover:border-ink-300"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          {file ? (
            <>
              <FileText size={28} className="text-highlight-strong" />
              <p className="text-sm font-medium text-ink-800">{file.name}</p>
              <p className="text-xs text-ink-400">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
            </>
          ) : (
            <>
              <UploadCloud size={28} className="text-ink-300" />
              <p className="text-sm text-ink-500">Drag and drop, or click to browse</p>
              <p className="text-xs text-ink-300">PDF up to 25MB</p>
            </>
          )}
        </div>

        {error && <p className="text-sm text-destructive mt-2">{error}</p>}

        <Button
          className="w-full mt-5"
          disabled={!file || uploadMutation.isPending}
          onClick={() => file && uploadMutation.mutate(file)}
        >
          {uploadMutation.isPending && <Loader2 size={16} className="animate-spin" />}
          Upload and process
        </Button>
      </DialogContent>
    </Dialog>
  );
}
