import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import { attachTenant } from "../middleware/attach-tenant.js";
import { asyncHandler } from "../../shared/utils/async-handler.js";
import { sessionController } from "../../session-service/sessions/controller.js";

const router = Router();

router.get("/context", authenticate, attachTenant({ required: false }), asyncHandler(sessionController.getContext));

export { router as sessionRoutes };
