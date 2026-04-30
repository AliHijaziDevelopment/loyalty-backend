import { Router } from "express";
import { auth } from "../../api-gateway/middleware/auth.js";
import { validate } from "../../api-gateway/middleware/validate.js";
import { asyncHandler } from "../../shared/utils/async-handler.js";
import { actionRewardController } from "./controller.js";
import { actionRewardIdSchema, createActionRewardSchema, updateActionRewardSchema } from "./validation.js";

const adminRouter = Router();
const clientRouter = Router();

adminRouter.get("/", auth(["admin", "staff"]), asyncHandler(actionRewardController.listAdmin));
adminRouter.post("/", auth(["admin"]), validate(createActionRewardSchema), asyncHandler(actionRewardController.create));
adminRouter.put("/:id", auth(["admin"]), validate(actionRewardIdSchema), validate(updateActionRewardSchema), asyncHandler(actionRewardController.update));
adminRouter.delete("/:id", auth(["admin"]), validate(actionRewardIdSchema), asyncHandler(actionRewardController.remove));
clientRouter.get("/", auth(["client"]), asyncHandler(actionRewardController.listClient));
clientRouter.post("/:id/claim", auth(["client"]), validate(actionRewardIdSchema), asyncHandler(actionRewardController.claim));

export { adminRouter as actionRewardAdminRouter, clientRouter as actionRewardClientRouter };
