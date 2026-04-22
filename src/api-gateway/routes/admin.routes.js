import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import { attachTenant } from "../middleware/attach-tenant.js";
import { enforceTenantMatch } from "../middleware/enforce-tenant-match.js";
import { birthdayAdminRoutes, birthdaySettingsAdminRoutes, companyAdminRoutes, tierSettingsAdminRoutes } from "../../company-service/index.js";
import { rewardClaimsAdminRoutes, rewardsAdminRoutes } from "../../rewards-service/index.js";
import { campaignAdminRoutes } from "../../campaign-service/index.js";
import { clientAdminRoutes, transactionAdminRoutes } from "../../client-service/index.js";

const router = Router();

router.use(authenticate, attachTenant({ required: false }), enforceTenantMatch);
router.use("/company", companyAdminRoutes);
router.use("/tier-settings", tierSettingsAdminRoutes);
router.use("/birthday-settings", birthdaySettingsAdminRoutes);
router.use("/birthday", birthdayAdminRoutes);
router.use("/clients", clientAdminRoutes);
router.use("/transactions", transactionAdminRoutes);
router.use("/rewards", rewardsAdminRoutes);
router.use("/reward-claims", rewardClaimsAdminRoutes);
router.use("/campaigns", campaignAdminRoutes);

export { router as adminRoutes };
