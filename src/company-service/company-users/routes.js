import { Router } from "express";
import { auth } from "../../api-gateway/middleware/auth.js";
import { validate } from "../../api-gateway/middleware/validate.js";
import { asyncHandler } from "../../shared/utils/async-handler.js";
import { companyUserController } from "./controller.js";
import { createCompanyUserSchema, listCompanyUsersSchema } from "./validation.js";

const router = Router();

router.get("/", auth(["super_admin"]), validate(listCompanyUsersSchema), asyncHandler(companyUserController.list));
router.post("/", auth(["super_admin"]), validate(createCompanyUserSchema), asyncHandler(companyUserController.create));

export { router as companyUsersSuperAdminRouter };
