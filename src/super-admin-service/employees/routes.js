import { Router } from "express";
import { auth } from "../../api-gateway/middleware/auth.js";
import { validate } from "../../api-gateway/middleware/validate.js";
import { asyncHandler } from "../../shared/utils/async-handler.js";
import { employeeController } from "./controller.js";
import { createEmployeeSchema, employeeIdSchema, updateEmployeeSchema } from "./validation.js";

const router = Router();

router.get("/", auth(["super_admin"]), asyncHandler(employeeController.list));
router.post("/", auth(["super_admin"]), validate(createEmployeeSchema), asyncHandler(employeeController.create));
router.put("/:id", auth(["super_admin"]), validate(employeeIdSchema), validate(updateEmployeeSchema), asyncHandler(employeeController.update));

export { router as employeeSuperAdminRouter };
