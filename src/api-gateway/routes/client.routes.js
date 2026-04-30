import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import { attachTenant } from "../middleware/attach-tenant.js";
import { enforceTenantMatch } from "../middleware/enforce-tenant-match.js";
import { actionRewardClientRoutes, clientClientRoutes, clientNotificationRoutes, transactionClientRoutes } from "../../client-service/index.js";
import { birthdayClientRoutes } from "../../company-service/index.js";
import { rewardClaimsClientRoutes, rewardsClientRoutes } from "../../rewards-service/index.js";
import { serviceGroupsClientRouter, servicesClientRouter } from "../../catalog-service/index.js";

const router = Router();

router.use(authenticate, attachTenant({ required: false }), enforceTenantMatch);
router.use("/me", clientClientRoutes);
router.use("/transactions", transactionClientRoutes);
router.use("/action-rewards", actionRewardClientRoutes);
router.use("/notifications", clientNotificationRoutes);
router.use("/rewards", rewardsClientRoutes);
router.use("/reward-claims", rewardClaimsClientRoutes);
router.use("/services", servicesClientRouter);
router.use("/service-groups", serviceGroupsClientRouter);
router.use("/", birthdayClientRoutes);

export { router as clientRoutes };
