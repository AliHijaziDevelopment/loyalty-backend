import { Router } from "express";
import { auth } from "../../api-gateway/middleware/auth.js";
import { validate } from "../../api-gateway/middleware/validate.js";
import { asyncHandler } from "../../shared/utils/async-handler.js";
import { clientController } from "./controller.js";
import { changePasswordSchema, clientIdSchema, confirmVisitSchema, createClientSchema, listClientsSchema, pointsActionSchema, restoreClientSchema, scanQrSchema, updateClientSchema, updateSelfSchema } from "./validation.js";

const router = Router();
const clientRouter = Router();

router.get("/", auth(["super_admin", "admin", "staff"]), validate(listClientsSchema), asyncHandler(clientController.list));
router.get("/stats", auth(["super_admin", "admin", "staff"]), asyncHandler(clientController.stats));
router.post("/scan", auth(["admin", "staff"]), validate(scanQrSchema), asyncHandler(clientController.scan));
router.get("/:id", auth(["super_admin", "admin", "staff"]), validate(clientIdSchema), asyncHandler(clientController.getById));
router.post("/", auth(["super_admin", "admin"]), validate(createClientSchema), asyncHandler(clientController.create));
router.patch("/:id", auth(["super_admin", "admin"]), validate(clientIdSchema), validate(updateClientSchema), asyncHandler(clientController.update));
router.delete("/:id", auth(["super_admin", "admin"]), validate(clientIdSchema), asyncHandler(clientController.remove));
router.post("/:id/restore", auth(["super_admin", "admin"]), validate(restoreClientSchema), asyncHandler(clientController.restore));
router.post("/:id/add-points", auth(["super_admin", "admin"]), validate(clientIdSchema), validate(pointsActionSchema), asyncHandler(clientController.addPoints));
router.post("/:id/confirm-visit", auth(["admin", "staff"]), validate(confirmVisitSchema), asyncHandler(clientController.confirmVisit));
router.post("/:id/redeem-points", auth(["super_admin", "admin"]), validate(clientIdSchema), validate(pointsActionSchema), asyncHandler(clientController.redeemPoints));
clientRouter.get("/", auth(["client"]), asyncHandler(clientController.getSelf));
clientRouter.get("/qr-token", auth(["client"]), asyncHandler(clientController.getSelfQrToken));
clientRouter.patch("/", auth(["client"]), validate(updateSelfSchema), asyncHandler(clientController.updateSelf));
clientRouter.post("/change-password", auth(["client"]), validate(changePasswordSchema), asyncHandler(clientController.changeSelfPassword));

export { router as clientAdminRouter, clientRouter as clientClientRouter };
