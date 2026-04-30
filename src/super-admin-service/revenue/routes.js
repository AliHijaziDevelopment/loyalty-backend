import { Router } from "express";
import { auth } from "../../api-gateway/middleware/auth.js";
import { asyncHandler } from "../../shared/utils/async-handler.js";
import { revenueController } from "./controller.js";

const router = Router();

router.get("/total", auth(["super_admin"]), asyncHandler(revenueController.total));
router.get("/monthly", auth(["super_admin"]), asyncHandler(revenueController.monthly));
router.get("/by-company", auth(["super_admin"]), asyncHandler(revenueController.byCompany));

export { router as revenueSuperAdminRouter };
