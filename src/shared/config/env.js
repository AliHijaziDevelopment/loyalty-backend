import dotenv from "dotenv";

dotenv.config();

const required = ["APP_ROOT_DOMAINS", "MONGODB_URI", "KEYCLOAK_ISSUER", "KEYCLOAK_AUDIENCE", "KEYCLOAK_JWKS_URI"];

for (const key of required) {
  if (!process.env[key]) {
    process.env[key] = "";
  }
}

export const env = {
  port: Number(process.env.PORT || 4000),
  nodeEnv: process.env.NODE_ENV || "development",
  appRootDomains: (process.env.APP_ROOT_DOMAINS || "mydomain.com").split(",").map((value) => value.trim().toLowerCase()).filter(Boolean),
  adminAppDomains: (process.env.ADMIN_APP_DOMAINS || "admin.mydomain.com,hq.mydomain.com,admin.localhost,hq.localhost").split(",").map((value) => value.trim().toLowerCase()).filter(Boolean),
  localhostRootDomains: (process.env.LOCALHOST_ROOT_DOMAINS || "localhost,lvh.me").split(",").map((value) => value.trim().toLowerCase()).filter(Boolean),
  allowedLocalAppPorts: (process.env.ALLOWED_LOCAL_APP_PORTS || "3000,3001").split(",").map((value) => value.trim()).filter(Boolean),
  allowedProductionAppPorts: (process.env.ALLOWED_PRODUCTION_APP_PORTS || "").split(",").map((value) => value.trim()).filter(Boolean),
  allowedOrigins: (process.env.ALLOWED_ORIGINS || "").split(",").map((value) => value.trim()).filter(Boolean),
  mongodbUri: process.env.MONGODB_URI || "",
  keycloakIssuer: process.env.KEYCLOAK_ISSUER || "",
  keycloakAudience: process.env.KEYCLOAK_AUDIENCE || "",
  keycloakJwksUri: process.env.KEYCLOAK_JWKS_URI || "",
  keycloakClockTolerance: Number(process.env.KEYCLOAK_CLOCK_TOLERANCE || 5),
  keycloakLocalRedirectUris: (process.env.KEYCLOAK_LOCAL_REDIRECT_URIS || "").split(",").map((value) => value.trim()).filter(Boolean),
  keycloakAdminClientId: process.env.KEYCLOAK_ADMIN_CLIENT_ID || "",
  keycloakAdminClientSecret: process.env.KEYCLOAK_ADMIN_CLIENT_SECRET || "",
  qrTokenSecret: process.env.QR_TOKEN_SECRET || "dev-qr-secret",
  qrTokenTtlMinutes: Number(process.env.QR_TOKEN_TTL_MINUTES || 15),
};
