import { AppError } from "../../shared/errors/app-error.js";
import { env } from "../../shared/config/env.js";
import { buildTenantRedirectUrl } from "../../shared/tenant/build-tenant-url.js";
import { companyStore } from "../../company-service/companies/model.js";

function resolveBestRootDomain(host) {
  const hostname = (host || "").split(":")[0].toLowerCase();
  const matchedConfiguredDomain = [...env.appRootDomains, ...env.localhostRootDomains]
    .find((rootDomain) => hostname === rootDomain || hostname.endsWith(`.${rootDomain}`));

  return matchedConfiguredDomain || env.localhostRootDomains[0] || env.appRootDomains[0] || null;
}

export async function enforceTenantMatch(req, _res, next) {
  if (!req.auth) {
    return next(new AppError(401, "Authenticated request context is missing."));
  }

  if (req.auth.role === "super_admin") {
    return next();
  }

  if (!req.auth.accountId) {
    return next(new AppError(403, "Token is missing account scope."));
  }

  const expectedCompany = await companyStore.findByAccountId(req.auth.accountId);
  const appOrigin = req.headers["x-app-origin"];
  const appPathname = req.headers["x-app-pathname"];
  const originUrl = typeof appOrigin === "string" ? new URL(appOrigin) : null;
  const forwardedProtocol = originUrl?.protocol.replace(":", "") || req.headers["x-forwarded-proto"] || req.protocol || "http";
  const forwardedHost = originUrl?.host || req.headers["x-forwarded-host"] || req.headers.host || "";
  const targetPathname = typeof appPathname === "string" ? appPathname : "/";

  if (!req.tenant?.accountId) {
    const redirectUrl = expectedCompany
      ? buildTenantRedirectUrl({
          protocol: forwardedProtocol,
          slug: expectedCompany.slug,
          rootDomain: resolveBestRootDomain(forwardedHost),
          pathname: targetPathname,
        })
      : null;

    return next(new AppError(403, "Tenant subdomain is required for this account-scoped request.", {
      code: "TENANT_REQUIRED",
      expectedAccountId: req.auth.accountId,
      expectedSlug: expectedCompany?.slug || null,
      redirectUrl,
    }));
  }

  if (req.auth.accountId !== req.tenant.accountId) {
    const redirectUrl = expectedCompany
      ? buildTenantRedirectUrl({
          protocol: forwardedProtocol,
          slug: expectedCompany.slug,
          rootDomain: resolveBestRootDomain(forwardedHost),
          pathname: targetPathname,
        })
      : null;

    return next(new AppError(403, "Token account scope does not match the requested tenant.", {
      code: "TENANT_MISMATCH",
      expectedAccountId: req.auth.accountId,
      requestedAccountId: req.tenant.accountId,
      expectedSlug: expectedCompany?.slug || null,
      redirectUrl,
    }));
  }

  next();
}
