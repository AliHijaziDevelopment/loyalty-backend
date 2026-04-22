import { env } from "../../shared/config/env.js";
import { buildTenantRedirectUrl } from "../../shared/tenant/build-tenant-url.js";
import { companyStore } from "../../company-service/companies/model.js";

function resolveAppKind(appKindHeader, host) {
  if (appKindHeader === "admin" || appKindHeader === "client") {
    return appKindHeader;
  }

  const hostname = (host || "").split(":")[0].toLowerCase();

  if (env.adminAppDomains.includes(hostname)) {
    return "admin";
  }

  return "client";
}

function resolveBestRootDomain(host) {
  const hostname = (host || "").split(":")[0].toLowerCase();
  const configuredDomains = [...env.appRootDomains, ...env.localhostRootDomains];
  const matchedRootDomain = configuredDomains.find((rootDomain) => hostname === rootDomain || hostname.endsWith(`.${rootDomain}`));

  return matchedRootDomain || env.localhostRootDomains[0] || env.appRootDomains[0] || null;
}

export const sessionService = {
  async getContext({ auth, tenant, host, protocol, pathname = "/", appKind = null }) {
    const user = {
      sub: auth.sub,
      email: auth.email,
      accountId: auth.accountId,
      role: auth.role,
      roles: auth.roles,
    };
    const resolvedAppKind = resolveAppKind(appKind, host);

    if (auth.role === "super_admin") {
      return {
        user,
        tenant: null,
        expectedTenant: null,
        redirectUrl: null,
        birthdayAvailable: false,
      };
    }

    const expectedCompany = auth.accountId ? await companyStore.findByAccountId(auth.accountId) : null;
    const rootDomain = resolveBestRootDomain(host);
    const needsRedirect = resolvedAppKind === "client" && expectedCompany && (!tenant || tenant.accountId !== expectedCompany.accountId);
    const resolvedTenant = resolvedAppKind === "admin"
      ? (expectedCompany ? { slug: expectedCompany.slug, accountId: expectedCompany.accountId } : null)
      : (tenant ? { slug: tenant.slug, accountId: tenant.accountId } : null);

    return {
      user,
      tenant: resolvedTenant,
      expectedTenant: expectedCompany ? { slug: expectedCompany.slug, accountId: expectedCompany.accountId } : null,
      redirectUrl: needsRedirect
        ? buildTenantRedirectUrl({
            protocol,
            slug: expectedCompany.slug,
            rootDomain,
            pathname,
          })
        : null,
      birthdayAvailable: auth.role === "client" ? Boolean(auth.client?.birthdayAvailable) : false,
    };
  },
};
