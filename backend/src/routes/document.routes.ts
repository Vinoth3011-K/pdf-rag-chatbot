import { NextFunction, Request, Response, Router } from "express";
import * as documentController from "@controllers/document.controller";
import { requireAuth } from "@middlewares/auth";
import { validate } from "@middlewares/validate";
import { documentIdParamSchema, listDocumentsSchema } from "@validators/document.validator";
import { handleUploadErrors, uploadPdf } from "@middlewares/upload";

const router = Router();

function uploadMiddleware(req: Request, res: Response, next: NextFunction) {
  uploadPdf(req, res, (err) => {
    if (err) {
      try {
        handleUploadErrors(err);
      } catch (apiErr) {
        return next(apiErr);
      }
    }
    next();
  });
}

router.use(requireAuth);

router.post("/upload", uploadMiddleware, documentController.uploadDocument);
router.get("/", validate(listDocumentsSchema), documentController.listDocuments);
router.get("/:id", validate(documentIdParamSchema), documentController.getDocument);
router.delete("/:id", validate(documentIdParamSchema), documentController.deleteDocument);
router.post("/:id/reprocess", validate(documentIdParamSchema), documentController.reprocessDocument);

export default router;
