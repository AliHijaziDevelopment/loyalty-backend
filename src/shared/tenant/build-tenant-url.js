export function buildTenantRedirectUrl({ protocol, port, slug, rootDomain, pathname = "/", search = "" }) {
  if (!slug || !rootDomain) {
    return null;
  }

  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const normalizedSearch = search ? (search.startsWith("?") ? search : `?${search}`) : "";
  const normalizedPort = port && !["80", "443"].includes(String(port)) ? `:${port}` : "";

  return `${protocol}://${slug}.${rootDomain}${normalizedPort}${normalizedPath}${normalizedSearch}`;
}
