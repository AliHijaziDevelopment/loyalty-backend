import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import { attachTenant } from "../middleware/attach-tenant.js";
import { enforceTenantMatch } from "../middleware/enforce-tenant-match.js";
import { clientClientRoutes, transactionClientRoutes } from "../../client-service/index.js";
import { birthdayClientRoutes } from "../../company-service/index.js";
import { rewardClaimsClientRoutes, rewardsClientRoutes } from "../../rewards-service/index.js";

const router = Router();

router.use(authenticate, attachTenant({ required: false }), enforceTenantMatch);
router.use("/me", clientClientRoutes);
router.use("/transactions", transactionClientRoutes);
router.use("/rewards", rewardsClientRoutes);
router.use("/reward-claims", rewardClaimsClientRoutes);
router.use("/", birthdayClientRoutes);

export { router as clientRoutes };
