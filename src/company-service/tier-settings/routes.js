import { Router } from "express";
import { auth } from "../../api-gateway/middleware/auth.js";
import { validate } from "../../api-gateway/middleware/validate.js";
import { asyncHandler } from "../../shared/utils/async-handler.js";
import { tierSettingsController } from "./controller.js";
import { createTierSchema, tierIdSchema, updateTierSchema } from "./validation.js";

const router = Router();

router.get("/", auth(["admin", "staff"]), asyncHandler(tierSettingsController.list));
router.post("/", auth(["admin"]), validate(createTierSchema), asyncHandler(tierSettingsController.create));
router.put("/:id", auth(["admin"]), validate(tierIdSchema), validate(updateTierSchema), asyncHandler(tierSettingsController.update));
router.delete("/:id", auth(["admin"]), validate(tierIdSchema), asyncHandler(tierSettingsController.remove));

export { router as tierSettingsAdminRouter };
