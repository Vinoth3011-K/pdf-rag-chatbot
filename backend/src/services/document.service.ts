import fs from "fs";
import { DocumentStatus } from "@prisma/client";
import {
  documentRepository,
  ListDocumentsParams
} from "@repositories/document.repository";
import { ApiError } from "@utils/ApiError";
import { logger } from "@utils/logger";
import {
  publishPdfProcessRequest,
  publishPdfDeleteRequest,
  waitForPdfProcessResponse
} from "@redis-service/pubsub.service";


interface UploadedFileMeta {
  originalName: string;
  storedPath: string;
  sizeBytes: number;
  mimeType: string;
}


export class DocumentService {


  async uploadAndProcess(
    uploadedBy: string,
    file: UploadedFileMeta
  ) {

    const document = await documentRepository.create({

      title: file.originalName.replace(/\.pdf$/i, ""),

      originalFileName: file.originalName,

      filePath: file.storedPath,

      fileSizeBytes: file.sizeBytes,

      mimeType: file.mimeType,

      status: DocumentStatus.PENDING,

      uploadedBy: {
        connect: {
          id: uploadedBy
        }
      }

    });


    this.triggerProcessing(
      document.id,
      document.filePath,
      document.originalFileName
    ).catch((err) => {

      logger.error(
        "Failed to trigger PDF processing",
        {
          err,
          documentId: document.id
        }
      );

    });


    return document;
  }





  async triggerProcessing(
    documentId: string,
    filePath: string,
    documentTitle: string
  ): Promise<void> {


    await documentRepository.updateStatus(
      documentId,
      DocumentStatus.PROCESSING
    );



    const requestId =
      await publishPdfProcessRequest({

        documentId,

        filePath,

        chromaCollection:
          "pdf_knowledge_base",

        // IMPORTANT
        // Send original PDF name
        documentTitle

      });



    try {


      const response =
        await waitForPdfProcessResponse(
          requestId
        );



      if (response.status === "READY") {


        await documentRepository.updateStatus(

          documentId,

          DocumentStatus.READY,

          {

            pageCount:
              response.pageCount,

            chunkCount:
              response.chunkCount,

            errorMessage:
              null
          }

        );


      } else {


        await documentRepository.updateStatus(

          documentId,

          DocumentStatus.FAILED,

          {

            errorMessage:
              response.errorMessage ||
              "Processing failed"

          }

        );

      }



    } catch (err) {


      logger.error(
        "PDF processing timed out or errored",
        {
          err,
          documentId
        }
      );



      await documentRepository.updateStatus(

        documentId,

        DocumentStatus.FAILED,

        {

          errorMessage:
            err instanceof Error
              ? err.message
              : "Unknown processing error"

        }

      );

    }

  }







  async list(
    params: ListDocumentsParams
  ) {


    const {
      items,
      total
    } =
      await documentRepository.list(params);



    return {

      items,

      pagination: {

        page:
          params.page,

        limit:
          params.limit,

        total,

        totalPages:
          Math.max(
            1,
            Math.ceil(
              total / params.limit
            )
          )

      }

    };

  }






  async getById(id:string) {


    const document =
      await documentRepository.findById(id);


    if(!document)
      throw ApiError.notFound(
        "Document not found"
      );


    return document;

  }







  async delete(id:string){


    const document =
      await documentRepository.findById(id);



    if(!document)
      throw ApiError.notFound(
        "Document not found"
      );



    await documentRepository.delete(id);

    await publishPdfDeleteRequest(id);

    fs.unlink(
      document.filePath,
      (err)=>{

        if(err)
          logger.warn(
            "Could not remove file from disk",
            {
              err,
              filePath:
                document.filePath
            }
          );

      }
    );



    return document;

  }







  async reprocess(id:string){


    const document =
      await documentRepository.findById(id);



    if(!document)
      throw ApiError.notFound(
        "Document not found"
      );




    this.triggerProcessing(

      document.id,

      document.filePath,

      document.originalFileName

    ).catch((err)=>{


      logger.error(
        "Failed to trigger reprocessing",
        {
          err,
          documentId:
            document.id
        }
      );


    });



    return documentRepository.updateStatus(
      id,
      DocumentStatus.PROCESSING
    );


  }



}



export const documentService =
  new DocumentService();