"use client";

import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UploadCloud, Loader2, FileText, CheckCircle2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { apiClient, ApiClientError } from "@/lib/api-client";
import { formatBytes } from "@/lib/format";

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
    if (selected.type !== "application/pdf" && !selected.name.toLowerCase().endsWith(".pdf")) {
      setError("Only PDF files are supported");
      return;
    }
    setError(null);
    setFile(selected);
  };

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="highlight" className="gap-2 shadow-glow">
          <UploadCloud size={17} />
          <span>Upload PDF</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogTitle>Upload Document</DialogTitle>
        <DialogDescription>
          Your PDF will be split into contextual chunks, vector-embedded, and indexed for instant AI retrieval.
        </DialogDescription>

        {/* Drag & Drop Zone */}
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
          className={`mt-3 sm:mt-4 flex flex-col items-center justify-center gap-2.5 sm:gap-3 rounded-2xl border-2 border-dashed px-4 sm:px-6 py-7 sm:py-10 text-center cursor-pointer transition-all ${
            dragOver
              ? "border-[#10a37f] bg-[#10a37f]/10 scale-[1.01]"
              : "border-[#333] hover:border-[#555] bg-[#121212] hover:bg-[#161616]"
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
            <div className="flex flex-col items-center gap-2 w-full">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-[#10a37f]/15 text-[#10a37f] flex items-center justify-center">
                <FileText size={22} className="sm:w-6 sm:h-6" />
              </div>
              <div className="w-full max-w-[220px] sm:max-w-[260px]">
                <p className="text-xs sm:text-sm font-medium text-white truncate">{file.name}</p>
                <p className="text-[11px] sm:text-xs text-neutral-400 font-mono mt-0.5">{formatBytes(file.size)}</p>
              </div>
              <button
                type="button"
                onClick={removeFile}
                className="mt-0.5 inline-flex items-center gap-1 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 px-2.5 py-1 rounded-md transition-colors"
              >
                <X size={13} />
                <span>Remove file</span>
              </button>
            </div>
          ) : (
            <>
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-[#1e1e1e] border border-[#333] text-neutral-400 flex items-center justify-center">
                <UploadCloud size={20} className="text-[#10a37f] sm:w-6 sm:h-6" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-neutral-200">
                  Drag and drop PDF here
                </p>
                <p className="text-[11px] sm:text-xs text-neutral-500 mt-0.5">or tap to browse files</p>
              </div>
              <span className="inline-block text-[10px] sm:text-[11px] font-mono text-neutral-500 bg-[#1c1c1c] border border-[#2c2c2c] px-2 py-0.5 rounded-full mt-0.5">
                Max 25 MB · PDF
              </span>
            </>
          )}
        </div>

        {error && (
          <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 mt-3">
            {error}
          </p>
        )}

        <Button
          className="w-full mt-5 gap-2 h-11"
          disabled={!file || uploadMutation.isPending}
          onClick={() => file && uploadMutation.mutate(file)}
        >
          {uploadMutation.isPending ? (
            <>
              <Loader2 size={17} className="animate-spin" />
              <span>Extracting & indexing vectors...</span>
            </>
          ) : (
            <>
              <CheckCircle2 size={17} />
              <span>Upload and Process</span>
            </>
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
