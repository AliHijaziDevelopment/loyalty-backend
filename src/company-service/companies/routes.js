import { Router } from "express";
import { auth } from "../../api-gateway/middleware/auth.js";
import { validate } from "../../api-gateway/middleware/validate.js";
import { asyncHandler } from "../../shared/utils/async-handler.js";
import { companyController } from "./controller.js";
import { companyIdSchema, createCompanySchema, updateCompanySchema } from "./validation.js";

const superAdminRouter = Router();
const adminRouter = Router();

superAdminRouter.get("/", auth(["super_admin"]), asyncHandler(companyController.list));
superAdminRouter.get("/:id", auth(["super_admin"]), validate(companyIdSchema), asyncHandler(companyController.getById));
superAdminRouter.post("/", auth(["super_admin"]), validate(createCompanySchema), asyncHandler(companyController.create));
superAdminRouter.patch("/:id", auth(["super_admin"]), validate(companyIdSchema), validate(updateCompanySchema), asyncHandler(companyController.updateById));
adminRouter.get("/me", auth(["admin", "staff"]), asyncHandler(companyController.getCurrent));
adminRouter.patch("/me", auth(["admin"]), validate(updateCompanySchema), asyncHandler(companyController.updateCurrent));

export { superAdminRouter as companySuperAdminRouter, adminRouter as companyAdminRouter };
