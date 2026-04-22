import { Router } from "express";
import { auth } from "../../api-gateway/middleware/auth.js";
import { validate } from "../../api-gateway/middleware/validate.js";
import { asyncHandler } from "../../shared/utils/async-handler.js";
import { rewardsController } from "./controller.js";
import { createRewardSchema, rewardIdSchema, updateRewardSchema } from "./validation.js";

const adminRouter = Router();
const clientRouter = Router();

adminRouter.get("/", auth(["admin", "staff"]), asyncHandler(rewardsController.list));
adminRouter.post("/", auth(["admin"]), validate(createRewardSchema), asyncHandler(rewardsController.create));
adminRouter.patch("/:id", auth(["admin"]), validate(rewardIdSchema), validate(updateRewardSchema), asyncHandler(rewardsController.update));
adminRouter.delete("/:id", auth(["admin"]), validate(rewardIdSchema), asyncHandler(rewardsController.remove));
clientRouter.get("/", auth(["client"]), asyncHandler(rewardsController.listForClient));
clientRouter.post("/:id/redeem", auth(["client"]), validate(rewardIdSchema), asyncHandler(rewardsController.redeem));

export { adminRouter as rewardsAdminRouter, clientRouter as rewardsClientRouter };
