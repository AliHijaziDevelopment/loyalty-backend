import { Router } from "express";
import { auth } from "../../api-gateway/middleware/auth.js";
import { validate } from "../../api-gateway/middleware/validate.js";
import { asyncHandler } from "../../shared/utils/async-handler.js";
import { serviceGroupController } from "./controller.js";
import { createServiceGroupSchema, serviceGroupIdSchema, updateServiceGroupSchema } from "./validation.js";

const adminRouter = Router();
const clientRouter = Router();

adminRouter.get("/", auth(["admin", "staff"]), asyncHandler(serviceGroupController.list));
adminRouter.post("/", auth(["admin"]), validate(createServiceGroupSchema), asyncHandler(serviceGroupController.create));
adminRouter.put("/:id", auth(["admin"]), validate(serviceGroupIdSchema), validate(updateServiceGroupSchema), asyncHandler(serviceGroupController.update));
adminRouter.delete("/:id", auth(["admin"]), validate(serviceGroupIdSchema), asyncHandler(serviceGroupController.remove));
clientRouter.get("/", auth(["client"]), asyncHandler(serviceGroupController.list));

export { adminRouter as serviceGroupsAdminRouter, clientRouter as serviceGroupsClientRouter };
