import { env } from "../config/env.js";

function matchesRootDomain(hostname, rootDomains) {
  return rootDomains.some((rootDomain) => hostname === rootDomain || hostname.endsWith(`.${rootDomain}`));
}

export function isAllowedAppOrigin(origin) {
  if (!origin) {
    return true;
  }

  if (env.allowedOrigins.includes(origin)) {
    return true;
  }

  let url;

  try {
    url = new URL(origin);
  } catch {
    return false;
  }

  const hostname = url.hostname.toLowerCase();
  const protocol = url.protocol.toLowerCase();

  if (env.adminAppDomains.includes(hostname)) {
    return true;
  }

  if (
    protocol === "http:"
    && matchesRootDomain(hostname, env.localhostRootDomains)
  ) {
    return true;
  }

  if (
    protocol === "https:"
    && matchesRootDomain(hostname, env.appRootDomains)
  ) {
    return true;
  }

  return false;
}
