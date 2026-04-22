const RESERVED_SUBDOMAINS = new Set(["www", "api", "admin", "app"]);

function getMatchingRootDomain(host, rootDomains) {
  return rootDomains.find((rootDomain) => host === rootDomain || host.endsWith(`.${rootDomain}`)) || null;
}

export function resolveTenantFromHost(hostname, options = {}) {
  if (!hostname) {
    return null;
  }

  const host = hostname.split(":")[0].toLowerCase();
  const rootDomains = options.rootDomains || [];
  const localhostRootDomains = options.localhostRootDomains || [];

  if (host === "localhost" || /^\d+\.\d+\.\d+\.\d+$/.test(host)) {
    return null;
  }

  const matchedRootDomain = getMatchingRootDomain(host, [...rootDomains, ...localhostRootDomains]);

  if (!matchedRootDomain || host === matchedRootDomain) {
    return null;
  }

  const suffix = `.${matchedRootDomain}`;
  const prefix = host.endsWith(suffix) ? host.slice(0, -suffix.length) : "";
  const segments = prefix.split(".").filter(Boolean);
  const subdomain = segments.at(-1);

  if (!subdomain || RESERVED_SUBDOMAINS.has(subdomain)) {
    return null;
  }

  return subdomain;
}
