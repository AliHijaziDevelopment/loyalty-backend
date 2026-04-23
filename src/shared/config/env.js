import dotenv from "dotenv";

dotenv.config();

const required = ["APP_ROOT_DOMAINS", "MONGODB_URI", "KEYCLOAK_ISSUER", "KEYCLOAK_AUDIENCE", "KEYCLOAK_JWKS_URI"];

for (const key of required) {
  if (!process.env[key]) {
    process.env[key] = "";
  }
}

function cleanDomain(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .replace(/^\*\./, "")
    .replace(/:\d+$/, "");
}

function parseList(value) {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function parseDomains(value) {
  return parseList(value).map(cleanDomain).filter(Boolean);
}

const appRootDomains = [
  ...parseDomains(process.env.APP_DOMAIN || ""),
  ...parseDomains(process.env.APP_ROOT_DOMAINS || "mydomain.com"),
];

export const env = {
  port: Number(process.env.PORT || 4000),
  nodeEnv: process.env.NODE_ENV || "development",
  appRootDomains: [...new Set(appRootDomains)],
  adminAppDomains: parseDomains(process.env.ADMIN_APP_DOMAINS || "admin.mydomain.com,hq.mydomain.com,admin.localhost,hq.localhost"),
  localhostRootDomains: parseDomains(process.env.LOCALHOST_ROOT_DOMAINS || "localhost,lvh.me"),
  allowedLocalAppPorts: parseList(process.env.ALLOWED_LOCAL_APP_PORTS || "3000,3001"),
  allowedProductionAppPorts: parseList(process.env.ALLOWED_PRODUCTION_APP_PORTS || ""),
  allowedOrigins: parseList(process.env.ALLOWED_ORIGINS || ""),
  mongodbUri: process.env.MONGODB_URI || "",
  keycloakIssuer: process.env.KEYCLOAK_ISSUER || "",
  keycloakAudience: process.env.KEYCLOAK_AUDIENCE || "",
  keycloakJwksUri: process.env.KEYCLOAK_JWKS_URI || "",
  keycloakClockTolerance: Number(process.env.KEYCLOAK_CLOCK_TOLERANCE || 5),
  keycloakLocalRedirectUris: parseList(process.env.KEYCLOAK_LOCAL_REDIRECT_URIS || ""),
  keycloakAdminClientId: process.env.KEYCLOAK_ADMIN_CLIENT_ID || "",
  keycloakAdminClientSecret: process.env.KEYCLOAK_ADMIN_CLIENT_SECRET || "",
  qrTokenSecret: process.env.QR_TOKEN_SECRET || "dev-qr-secret",
  qrTokenTtlMinutes: Number(process.env.QR_TOKEN_TTL_MINUTES || 15),
};
