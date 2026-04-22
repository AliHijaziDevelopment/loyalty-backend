import { Router } from "express";
import { auth } from "../../api-gateway/middleware/auth.js";
import { validate } from "../../api-gateway/middleware/validate.js";
import { asyncHandler } from "../../shared/utils/async-handler.js";
import { rewardClaimsController } from "./controller.js";
import { rewardClaimIdSchema, rewardClaimsAdminListSchema, rewardClaimsListSchema, rewardClaimScanSchema } from "./validation.js";

const adminRouter = Router();
const clientRouter = Router();

adminRouter.get("/", auth(["admin", "staff"]), validate(rewardClaimsAdminListSchema), asyncHandler(rewardClaimsController.listForAdmin));
adminRouter.post("/scan", auth(["admin", "staff"]), validate(rewardClaimScanSchema), asyncHandler(rewardClaimsController.scan));
adminRouter.post("/:id/use", auth(["admin", "staff"]), validate(rewardClaimIdSchema), asyncHandler(rewardClaimsController.use));
clientRouter.get("/", auth(["client"]), validate(rewardClaimsListSchema), asyncHandler(rewardClaimsController.listForClient));
clientRouter.get("/:id/qr-token", auth(["client"]), validate(rewardClaimIdSchema), asyncHandler(rewardClaimsController.getQrToken));

export { adminRouter as rewardClaimsAdminRouter, clientRouter as rewardClaimsClientRouter };
