import { Router } from "express";
import { auth } from "../../api-gateway/middleware/auth.js";
import { validate } from "../../api-gateway/middleware/validate.js";
import { asyncHandler } from "../../shared/utils/async-handler.js";
import { birthdaySettingsController } from "./controller.js";
import { saveBirthdaySettingsSchema } from "./validation.js";

const router = Router();

router.get("/", auth(["admin", "staff"]), asyncHandler(birthdaySettingsController.getCurrent));
router.put("/", auth(["admin"]), validate(saveBirthdaySettingsSchema), asyncHandler(birthdaySettingsController.saveCurrent));

export { router as birthdaySettingsAdminRouter };
