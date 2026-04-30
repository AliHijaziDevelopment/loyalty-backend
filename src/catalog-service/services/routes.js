import { Router } from "express";
import { auth } from "../../api-gateway/middleware/auth.js";
import { validate } from "../../api-gateway/middleware/validate.js";
import { serviceImageUpload } from "../../api-gateway/middleware/image-upload.js";
import { asyncHandler } from "../../shared/utils/async-handler.js";
import { serviceCatalogController } from "./controller.js";
import { createServiceSchema, serviceIdSchema, updateServiceSchema } from "./validation.js";

const adminRouter = Router();
const clientRouter = Router();

adminRouter.get("/", auth(["admin", "staff"]), asyncHandler(serviceCatalogController.listAdmin));
adminRouter.post("/", auth(["admin"]), serviceImageUpload(), validate(createServiceSchema), asyncHandler(serviceCatalogController.create));
adminRouter.put("/:id", auth(["admin"]), serviceImageUpload(), validate(serviceIdSchema), validate(updateServiceSchema), asyncHandler(serviceCatalogController.update));
adminRouter.delete("/:id", auth(["admin"]), validate(serviceIdSchema), asyncHandler(serviceCatalogController.remove));
clientRouter.get("/", auth(["client"]), asyncHandler(serviceCatalogController.listClient));

export { adminRouter as servicesAdminRouter, clientRouter as servicesClientRouter };
