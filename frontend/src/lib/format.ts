import { DocumentStatus } from "@/types";

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export function statusBadgeVariant(status: DocumentStatus): "success" | "warning" | "destructive" | "pending" {
  switch (status) {
    case "READY":
      return "success";
    case "PROCESSING":
      return "warning";
    case "PENDING":
      return "pending";
    case "FAILED":
      return "destructive";
    default:
      return "pending";
  }
}
