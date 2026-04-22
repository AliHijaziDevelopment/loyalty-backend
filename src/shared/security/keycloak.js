import { createRemoteJWKSet, jwtVerify } from "jose";
import { env } from "../config/env.js";
import { AppError } from "../errors/app-error.js";

const jwks = env.keycloakJwksUri ? createRemoteJWKSet(new URL(env.keycloakJwksUri)) : null;
const ROLE_ALIASES = {
  "super-admin": "super_admin",
  "super_admin": "super_admin",
  "company-admin": "admin",
  "company_admin": "admin",
  "admin": "admin",
  "staff": "staff",
  "client": "client",
};

function normalizeRole(role) {
  if (!role || typeof role !== "string") {
    return null;
  }

  return ROLE_ALIASES[role] || null;
}

export async function verifyAccessToken(token) {
  if (!jwks) {
    throw new AppError(500, "Keycloak JWKS is not configured.");
  }

  try {
    const { payload } = await jwtVerify(token, jwks, {
      issuer: env.keycloakIssuer,
      audience: env.keycloakAudience,
      clockTolerance: env.keycloakClockTolerance,
    });

    const roles = Array.isArray(payload.realm_access?.roles) ? payload.realm_access.roles : [];
    const normalizedPayloadRole = normalizeRole(payload.role);
    const normalizedRealmRole = roles.map(normalizeRole).find(Boolean) || null;

    return {
      sub: payload.sub,
      email: payload.email || null,
      accountId: payload.accountId || payload.account_id || null,
      role: normalizedPayloadRole || normalizedRealmRole,
      roles,
      raw: payload,
    };
  } catch {
    throw new AppError(401, "Invalid or expired access token.");
  }
}
