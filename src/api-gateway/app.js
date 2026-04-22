import cors from "cors";
import express from "express";
import helmet from "helmet";
import { isAllowedAppOrigin } from "../shared/http/origin.js";
import { requestContext } from "./middleware/request-context.js";
import { corsErrorHandler } from "./middleware/cors-error-handler.js";
import { errorHandler } from "./middleware/error-handler.js";
import { notFound } from "./middleware/not-found.js";
import { adminRoutes } from "./routes/admin.routes.js";
import { clientRoutes } from "./routes/client.routes.js";
import { healthRoutes } from "./routes/health.routes.js";
import { sessionRoutes } from "./routes/session.routes.js";
import { superAdminRoutes } from "./routes/super-admin.routes.js";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({
    origin(origin, callback) {
      if (isAllowedAppOrigin(origin)) {
        return callback(null, true);
      }

      callback(new Error("Origin is not allowed by CORS."));
    },
    credentials: true,
  }));
  app.use(corsErrorHandler);
  app.use(express.json());
  app.use(requestContext);

  app.use("/health", healthRoutes);
  app.use("/session", sessionRoutes);
  app.use("/super-admin", superAdminRoutes);
  app.use("/admin", adminRoutes);
  app.use("/client", clientRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
