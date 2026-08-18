import Link from "next/link";
import { Document } from "@/types";
import { Badge } from "@/components/ui/badge";
import { statusBadgeVariant, formatBytes, formatDate } from "@/lib/format";

export function RecentDocumentsTable({ documents }: { documents: Document[] }) {
  if (documents.length === 0) {
    return (
      <div className="text-center py-10 text-sm text-neutral-500">
        No PDFs uploaded yet. Head to the knowledge base to add your first document.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead>
          <tr className="text-xs font-mono uppercase tracking-wider text-neutral-400 border-b border-[#2a2a2a]">
            <th className="py-2.5 px-2 font-medium">Title</th>
            <th className="py-2.5 px-2 font-medium">Size</th>
            <th className="py-2.5 px-2 font-medium">Status</th>
            <th className="py-2.5 px-2 font-medium">Uploaded</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#242424]">
          {documents.map((doc) => (
            <tr key={doc.id} className="hover:bg-[#1f1f1f] transition-colors">
              <td className="py-3 px-2 pr-4">
                <Link href="/documents" className="font-medium text-white hover:text-[#10a37f] transition-colors">
                  {doc.title}
                </Link>
              </td>
              <td className="py-3 px-2 text-neutral-300 font-mono text-xs">{formatBytes(doc.fileSizeBytes)}</td>
              <td className="py-3 px-2">
                <Badge variant={statusBadgeVariant(doc.status)}>{doc.status}</Badge>
              </td>
              <td className="py-3 px-2 text-neutral-400 text-xs">{formatDate(doc.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
