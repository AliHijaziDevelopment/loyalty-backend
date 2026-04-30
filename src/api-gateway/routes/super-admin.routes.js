import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import { auth } from "../middleware/auth.js";
import { companySuperAdminRoutes, companyUsersSuperAdminRoutes } from "../../company-service/index.js";
import {
  commissionSuperAdminRoutes,
  dashboardSuperAdminRoutes,
  employeeSuperAdminRoutes,
  revenueSuperAdminRoutes,
} from "../../super-admin-service/index.js";

const router = Router();

router.use(authenticate, auth(["super_admin"]));
router.use("/dashboard", dashboardSuperAdminRoutes);
router.use("/companies", companySuperAdminRoutes);
router.use("/company-users", companyUsersSuperAdminRoutes);
router.use("/employees", employeeSuperAdminRoutes);
router.use("/revenue", revenueSuperAdminRoutes);
router.use("/commissions", commissionSuperAdminRoutes);

export { router as superAdminRoutes };
