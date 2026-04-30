import { Router } from "express";
import { auth } from "../../api-gateway/middleware/auth.js";
import { validate } from "../../api-gateway/middleware/validate.js";
import { asyncHandler } from "../../shared/utils/async-handler.js";
import { commissionController } from "./controller.js";
import { employeeCommissionIdSchema } from "./validation.js";

const router = Router();

router.get("/", auth(["super_admin"]), asyncHandler(commissionController.list));
router.get("/:employeeId", auth(["super_admin"]), validate(employeeCommissionIdSchema), asyncHandler(commissionController.byEmployee));

export { router as commissionSuperAdminRouter };
