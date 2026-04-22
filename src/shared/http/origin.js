import { env } from "../config/env.js";

function normalizePort(protocol, port) {
  if (port) {
    return port;
  }

  if (protocol === "http:") {
    return "80";
  }

  if (protocol === "https:") {
    return "443";
  }

  return "";
}

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
  const port = normalizePort(protocol, url.port);

  if (
    protocol === "http:"
    && env.allowedLocalAppPorts.includes(port)
    && matchesRootDomain(hostname, env.localhostRootDomains)
  ) {
    return true;
  }

  if (
    protocol === "https:"
    && matchesRootDomain(hostname, env.appRootDomains)
    && (
      env.allowedProductionAppPorts.length === 0
      || env.allowedProductionAppPorts.includes(port)
    )
  ) {
    return true;
  }

  return false;
}
