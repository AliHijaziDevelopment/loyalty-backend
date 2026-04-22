import { sessionService } from "./service.js";

export const sessionController = {
  async getContext(req, res) {
    const appOrigin = req.headers["x-app-origin"];
    const appPathname = req.headers["x-app-pathname"];
    const originUrl = typeof appOrigin === "string" ? new URL(appOrigin) : null;
    const protocol = originUrl?.protocol.replace(":", "") || req.headers["x-forwarded-proto"] || req.protocol || "http";
    const host = originUrl?.host || req.headers["x-forwarded-host"] || req.headers.host || "";

    res.json({
      data: await sessionService.getContext({
        auth: req.auth,
        tenant: req.tenant,
        host,
        protocol,
        pathname: typeof appPathname === "string" ? appPathname : "/",
      }),
    });
  },
};
