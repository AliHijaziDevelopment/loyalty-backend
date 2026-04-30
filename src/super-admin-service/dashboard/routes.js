import { Router } from "express";
import { auth } from "../../api-gateway/middleware/auth.js";
import { asyncHandler } from "../../shared/utils/async-handler.js";
import { superAdminDashboardController } from "./controller.js";

const router = Router();

router.get("/", auth(["super_admin"]), asyncHandler(superAdminDashboardController.get));

export { router as dashboardSuperAdminRouter };
