import { Router } from "express";
import * as authController from "@controllers/auth.controller";
import { validate } from "@middlewares/validate";
import { loginSchema, refreshSchema } from "@validators/auth.validator";
import { requireAuth } from "@middlewares/auth";

const router = Router();

router.post("/signup", authController.signup);
router.post("/login", validate(loginSchema), authController.login);
router.post("/refresh", validate(refreshSchema), authController.refresh);
router.post("/logout", requireAuth, authController.logout);
router.get("/me", requireAuth, authController.me);

export default router;
