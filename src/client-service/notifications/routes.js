import { Router } from "express";
import { auth } from "../../api-gateway/middleware/auth.js";
import { validate } from "../../api-gateway/middleware/validate.js";
import { asyncHandler } from "../../shared/utils/async-handler.js";
import { clientNotificationController } from "./controller.js";
import { registerNotificationTokenSchema } from "./validation.js";

const router = Router();

router.post("/register-token", auth(["client"]), validate(registerNotificationTokenSchema), asyncHandler(clientNotificationController.registerToken));

export { router as clientNotificationRoutes };
