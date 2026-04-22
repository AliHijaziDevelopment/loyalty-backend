import { Router } from "express";
import { auth } from "../../api-gateway/middleware/auth.js";
import { validate } from "../../api-gateway/middleware/validate.js";
import { asyncHandler } from "../../shared/utils/async-handler.js";
import { campaignController } from "./controller.js";
import { createCampaignSchema } from "./validation.js";

const router = Router();

router.get("/", auth(["admin", "staff"]), asyncHandler(campaignController.list));
router.post("/", auth(["admin"]), validate(createCampaignSchema), asyncHandler(campaignController.create));

export { router as campaignAdminRouter };
