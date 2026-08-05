import Link from "next/link";
import { Document } from "@/types";
import { Badge } from "@/components/ui/badge";
import { statusBadgeVariant, formatBytes, formatDate } from "@/lib/format";

export function RecentDocumentsTable({ documents }: { documents: Document[] }) {
  if (documents.length === 0) {
    return (
      <div className="text-center py-10 text-sm text-ink-400">
        No PDFs uploaded yet. Head to the knowledge base to add your first document.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs font-mono uppercase tracking-wide text-ink-400 border-b border-ink-100">
            <th className="py-2.5 font-medium">Title</th>
            <th className="py-2.5 font-medium">Size</th>
            <th className="py-2.5 font-medium">Status</th>
            <th className="py-2.5 font-medium">Uploaded</th>
          </tr>
        </thead>
        <tbody>
          {documents.map((doc) => (
            <tr key={doc.id} className="border-b border-ink-50 last:border-0">
              <td className="py-3 pr-4">
                <Link href="/documents" className="font-medium text-ink-800 hover:text-highlight-strong">
                  {doc.title}
                </Link>
              </td>
              <td className="py-3 text-ink-500">{formatBytes(doc.fileSizeBytes)}</td>
              <td className="py-3">
                <Badge variant={statusBadgeVariant(doc.status)}>{doc.status}</Badge>
              </td>
              <td className="py-3 text-ink-500">{formatDate(doc.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
