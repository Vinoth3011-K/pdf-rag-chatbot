import { Document, DocumentStatus, Prisma } from "@prisma/client";
import { prisma } from "@config/prisma";

export interface ListDocumentsParams {
  search?: string;
  status?: DocumentStatus;
  page: number;
  limit: number;
}

export class DocumentRepository {
  create(data: Prisma.DocumentCreateInput): Promise<Document> {
    return prisma.document.create({ data });
  }

  findById(id: string): Promise<Document | null> {
    return prisma.document.findUnique({ where: { id } });
  }

  async list(params: ListDocumentsParams): Promise<{ items: Document[]; total: number }> {
    const { search, status, page, limit } = params;

    const where: Prisma.DocumentWhereInput = {
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" } },
              { originalFileName: { contains: search, mode: "insensitive" } }
            ]
          }
        : {})
    };

    const [items, total] = await Promise.all([
      prisma.document.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.document.count({ where })
    ]);

    return { items, total };
  }

  findRecent(limit: number): Promise<Document[]> {
    return prisma.document.findMany({
      orderBy: { createdAt: "desc" },
      take: limit
    });
  }

  updateStatus(
    id: string,
    status: DocumentStatus,
    extra?: Partial<Pick<Document, "pageCount" | "chunkCount" | "errorMessage">>
  ): Promise<Document> {
    return prisma.document.update({
      where: { id },
      data: { status, ...extra }
    });
  }

  delete(id: string): Promise<Document> {
    return prisma.document.delete({ where: { id } });
  }

  count(): Promise<number> {
    return prisma.document.count();
  }
}

export const documentRepository = new DocumentRepository();
