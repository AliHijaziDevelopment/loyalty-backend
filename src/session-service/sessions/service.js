import { env } from "../../shared/config/env.js";
import { buildTenantRedirectUrl } from "../../shared/tenant/build-tenant-url.js";
import { companyStore } from "../../company-service/companies/model.js";

function resolveBestRootDomain(host) {
  const hostname = (host || "").split(":")[0].toLowerCase();
  const configuredDomains = [...env.appRootDomains, ...env.localhostRootDomains];
  const matchedRootDomain = configuredDomains.find((rootDomain) => hostname === rootDomain || hostname.endsWith(`.${rootDomain}`));

  return matchedRootDomain || env.localhostRootDomains[0] || env.appRootDomains[0] || null;
}

export const sessionService = {
  async getContext({ auth, tenant, host, protocol, pathname = "/" }) {
    const user = {
      sub: auth.sub,
      email: auth.email,
      accountId: auth.accountId,
      role: auth.role,
      roles: auth.roles,
    };

    if (auth.role === "super_admin") {
      return {
        user,
        tenant: tenant ? { slug: tenant.slug, accountId: tenant.accountId } : null,
        expectedTenant: null,
        redirectUrl: null,
        birthdayAvailable: false,
      };
    }

    const expectedCompany = auth.accountId ? await companyStore.findByAccountId(auth.accountId) : null;
    const port = host.includes(":") ? host.split(":")[1] : "";
    const rootDomain = resolveBestRootDomain(host);
    const needsRedirect = expectedCompany && (!tenant || tenant.accountId !== expectedCompany.accountId);

    return {
      user,
      tenant: tenant ? { slug: tenant.slug, accountId: tenant.accountId } : null,
      expectedTenant: expectedCompany ? { slug: expectedCompany.slug, accountId: expectedCompany.accountId } : null,
      redirectUrl: needsRedirect
        ? buildTenantRedirectUrl({
            protocol,
            port,
            slug: expectedCompany.slug,
            rootDomain,
            pathname,
          })
        : null,
      birthdayAvailable: auth.role === "client" ? Boolean(auth.client?.birthdayAvailable) : false,
    };
  },
};
