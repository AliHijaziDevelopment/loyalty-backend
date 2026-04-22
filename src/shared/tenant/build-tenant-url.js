export function buildTenantRedirectUrl({ protocol, slug, rootDomain, pathname = "/", search = "" }) {
  if (!slug || !rootDomain) {
    return null;
  }

  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const normalizedSearch = search ? (search.startsWith("?") ? search : `?${search}`) : "";

  return `${protocol}://${slug}.${rootDomain}${normalizedPath}${normalizedSearch}`;
}
