import { env } from "../../shared/config/env.js";
import { AppError } from "../../shared/errors/app-error.js";
import { resolveTenantFromHost } from "../../shared/tenant/resolve-subdomain.js";
import { companyStore } from "../../company-service/companies/model.js";

export function attachTenant({ required = true } = {}) {
  return async (req, _res, next) => {
    try {
      const appOrigin = req.headers["x-app-origin"];
      const originUrl = typeof appOrigin === "string" ? new URL(appOrigin) : null;
      const host = originUrl?.host || req.headers["x-forwarded-host"] || req.headers.host;
      const subdomain = resolveTenantFromHost(host, {
        rootDomains: env.appRootDomains,
        localhostRootDomains: env.localhostRootDomains,
      });

      if (!subdomain) {
        if (required) {
          return next(new AppError(400, "Tenant subdomain could not be resolved from the request host."));
        }

        req.tenant = null;
        return next();
      }

      const account = await companyStore.findBySlug(subdomain);

      if (!account) {
        return next(new AppError(404, "Company account for this subdomain was not found."));
      }

      req.tenant = {
        host,
        slug: subdomain,
        accountId: account.accountId,
        account,
      };

      next();
    } catch (error) {
      next(error);
    }
  };
}
