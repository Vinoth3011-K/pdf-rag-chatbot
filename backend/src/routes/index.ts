import { Router } from "express";
import authRoutes from "./auth.routes";
import documentRoutes from "./document.routes";
import chatRoutes from "./chat.routes";
import dashboardRoutes from "./dashboard.routes";

const router = Router();

router.get("/health", (_req, res) => {
  res.status(200).json({ success: true, data: { status: "ok", timestamp: new Date().toISOString() } });
});

router.use("/auth", authRoutes);
router.use("/documents", documentRoutes);
router.use("/chat", chatRoutes);
router.use("/dashboard", dashboardRoutes);

export default router;
