import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import { auth } from "../middleware/auth.js";
import { companySuperAdminRoutes, companyUsersSuperAdminRoutes } from "../../company-service/index.js";

const router = Router();

router.use(authenticate, auth(["super_admin"]));
router.use("/companies", companySuperAdminRoutes);
router.use("/company-users", companyUsersSuperAdminRoutes);

export { router as superAdminRoutes };
