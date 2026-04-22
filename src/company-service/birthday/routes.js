import { Router } from "express";
import { auth } from "../../api-gateway/middleware/auth.js";
import { validate } from "../../api-gateway/middleware/validate.js";
import { asyncHandler } from "../../shared/utils/async-handler.js";
import { birthdayController } from "./controller.js";
import { claimBirthdayRewardSchema, sendBirthdayRewardSchema } from "./validation.js";

const router = Router();
const clientRouter = Router();

router.post("/send", auth(["admin"]), validate(sendBirthdayRewardSchema), asyncHandler(birthdayController.send));
clientRouter.get("/birthday-rewards", auth(["client"]), asyncHandler(birthdayController.listAvailable));
clientRouter.post("/birthday-claim", auth(["client"]), validate(claimBirthdayRewardSchema), asyncHandler(birthdayController.claim));

export { router as birthdayAdminRouter, clientRouter as birthdayClientRouter };
