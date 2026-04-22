import { env } from "../config/env.js";
import { AppError } from "../errors/app-error.js";

function parseIssuer() {
  const issuerUrl = new URL(env.keycloakIssuer);
  const segments = issuerUrl.pathname.split("/").filter(Boolean);
  const realmIndex = segments.indexOf("realms");

  if (realmIndex === -1 || !segments[realmIndex + 1]) {
    throw new AppError(500, "Keycloak issuer must include /realms/{realm}.");
  }

  return {
    realm: segments[realmIndex + 1],
    baseUrl: `${issuerUrl.origin}${segments.slice(0, realmIndex).length ? `/${segments.slice(0, realmIndex).join("/")}` : ""}`,
  };
}

async function getAdminAccessToken() {
  const { realm, baseUrl } = parseIssuer();
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: env.keycloakAdminClientId,
  });

  if (env.keycloakAdminClientSecret) {
    body.set("client_secret", env.keycloakAdminClientSecret);
  }

  const response = await fetch(`${baseUrl}/realms/${realm}/protocol/openid-connect/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!response.ok) {
    throw new AppError(502, "Could not authenticate with the Keycloak admin API.");
  }

  const data = await response.json();
  return data.access_token;
}

async function keycloakRequest(pathname, init = {}) {
  const { realm, baseUrl } = parseIssuer();
  const token = await getAdminAccessToken();
  const response = await fetch(`${baseUrl}/admin/realms/${realm}${pathname}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });

  return response;
}

function splitFullName(name) {
  const value = (name || "").trim();

  if (!value) {
    return { firstName: "", lastName: "" };
  }

  const parts = value.split(/\s+/);

  return {
    firstName: parts[0] || "",
    lastName: parts.slice(1).join(" "),
  };
}

export const keycloakAdminService = {
  async findUserByEmail(email) {
    const response = await keycloakRequest(`/users?email=${encodeURIComponent(email)}&exact=true`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new AppError(502, "Could not query Keycloak users.");
    }

    const users = await response.json();
    return Array.isArray(users) && users.length > 0 ? users[0] : null;
  },
  async createOrResolveUser({ email, username, firstName, lastName, password }) {
    const existingUser = await this.findUserByEmail(email);

    if (existingUser) {
      return {
        id: existingUser.id,
        email: existingUser.email || email,
        username: existingUser.username || username,
      };
    }

    const response = await keycloakRequest("/users", {
      method: "POST",
      body: JSON.stringify({
        username,
        email,
        enabled: true,
        emailVerified: false,
        firstName,
        lastName,
        credentials: [
          {
            type: "password",
            value: password,
            temporary: false,
          },
        ],
      }),
    });

    if (response.status === 409) {
      const duplicateUser = await this.findUserByEmail(email);

      if (duplicateUser) {
        return {
          id: duplicateUser.id,
          email: duplicateUser.email || email,
          username: duplicateUser.username || username,
        };
      }
    }

    if (!response.ok) {
      throw new AppError(502, "Could not create the Keycloak user.");
    }

    const location = response.headers.get("location") || "";
    const id = location.split("/").filter(Boolean).at(-1);

    if (!id) {
      throw new AppError(502, "Keycloak user was created but the identifier could not be resolved.");
    }

    return {
      id,
      email,
      username,
    };
  },
  async getRealmRole(roleName) {
    const response = await keycloakRequest(`/roles/${encodeURIComponent(roleName)}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new AppError(502, `Could not resolve the Keycloak realm role "${roleName}".`);
    }

    return response.json();
  },
  async assignRealmRole(userId, roleName) {
    const role = await this.getRealmRole(roleName);
    const response = await keycloakRequest(`/users/${userId}/role-mappings/realm`, {
      method: "POST",
      body: JSON.stringify([
        {
          id: role.id,
          name: role.name,
        },
      ]),
    });

    if (!response.ok) {
      throw new AppError(502, `Could not assign the Keycloak role "${roleName}" to the user.`);
    }
  },
  async updateUser(userId, { username, email, name, firstName, lastName }) {
    const resolvedName = firstName !== undefined || lastName !== undefined
      ? { firstName: firstName || "", lastName: lastName || "" }
      : splitFullName(name);
    const response = await keycloakRequest(`/users/${userId}`, {
      method: "PUT",
      body: JSON.stringify({
        username,
        email,
        firstName: resolvedName.firstName,
        lastName: resolvedName.lastName,
        enabled: true,
      }),
    });

    if (!response.ok) {
      throw new AppError(502, "Could not update the Keycloak user.");
    }
  },
  async setUserPassword(userId, password) {
    const response = await keycloakRequest(`/users/${userId}/reset-password`, {
      method: "PUT",
      body: JSON.stringify({
        type: "password",
        value: password,
        temporary: false,
      }),
    });

    if (!response.ok) {
      throw new AppError(502, "Could not update the Keycloak password.");
    }
  },
  async disableUser(userId) {
    const response = await keycloakRequest(`/users/${userId}`, {
      method: "PUT",
      body: JSON.stringify({
        enabled: false,
      }),
    });

    if (!response.ok) {
      throw new AppError(502, "Could not disable the Keycloak user.");
    }
  },
};
