import { Router } from "express";
import { auth } from "../../api-gateway/middleware/auth.js";
import { validate } from "../../api-gateway/middleware/validate.js";
import { asyncHandler } from "../../shared/utils/async-handler.js";
import { tierSettingsController } from "./controller.js";
import { saveTierSettingsSchema } from "./validation.js";

const router = Router();

router.get("/", auth(["admin", "staff"]), asyncHandler(tierSettingsController.getCurrent));
router.put("/", auth(["admin"]), validate(saveTierSettingsSchema), asyncHandler(tierSettingsController.saveCurrent));

export { router as tierSettingsAdminRouter };
