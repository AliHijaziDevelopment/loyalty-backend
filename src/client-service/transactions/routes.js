import { Router } from "express";
import { auth } from "../../api-gateway/middleware/auth.js";
import { validate } from "../../api-gateway/middleware/validate.js";
import { asyncHandler } from "../../shared/utils/async-handler.js";
import { transactionController } from "./controller.js";
import { listTransactionsSchema } from "./validation.js";

const router = Router();
const clientRouter = Router();

router.get("/", auth(["admin", "staff"]), validate(listTransactionsSchema), asyncHandler(transactionController.list));
clientRouter.get("/", auth(["client"]), validate(listTransactionsSchema), asyncHandler(transactionController.listForClient));

export { router as transactionAdminRouter, clientRouter as transactionClientRouter };
