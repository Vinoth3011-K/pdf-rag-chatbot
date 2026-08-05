import { Request, Response } from "express";
import { dashboardService } from "@services/dashboard.service";
import { asyncHandler } from "@middlewares/errorHandler";

export const getDashboardStats = asyncHandler(async (_req: Request, res: Response) => {
  const stats = await dashboardService.getStats();
  res.status(200).json({ success: true, data: stats });
});
