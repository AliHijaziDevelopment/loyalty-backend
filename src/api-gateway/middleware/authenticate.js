import { AppError } from "../../shared/errors/app-error.js";
import { verifyAccessToken } from "../../shared/security/keycloak.js";
import { companyUserService } from "../../company-service/company-users/service.js";
import { clientStore } from "../../client-service/clients/model.js";

export async function authenticate(req, _res, next) {
  const header = req.headers.authorization || "";

  if (!header.startsWith("Bearer ")) {
    return next(new AppError(401, "Bearer token is required."));
  }

  try {
    const auth = await verifyAccessToken(header.slice(7));

    if (auth.role === "super_admin") {
      req.auth = auth;
      return next();
    }

    if (auth.role === "client") {
      const client = await clientStore.findAnyByKeycloakId(auth.sub);

      if (!client) {
        return next(new AppError(403, "No client account exists for this user.", {
          code: "CLIENT_ACCOUNT_REQUIRED",
          keycloakId: auth.sub,
        }));
      }

      req.auth = {
        ...auth,
        accountId: client.accountId,
        role: "client",
        client,
      };
      return next();
    }

    if (auth.role !== "super_admin") {
      const assignment = await companyUserService.resolveAssignment(auth.sub);

      if (!assignment) {
        return next(new AppError(403, "No company assignment exists for this user.", {
          code: "COMPANY_ASSIGNMENT_REQUIRED",
          keycloakId: auth.sub,
        }));
      }

      req.auth = {
        ...auth,
        accountId: assignment.accountId,
        role: assignment.role,
        assignment,
      };
      return next();
    }

    next(new AppError(403, "Authenticated user role is not supported."));
  } catch (error) {
    next(error);
  }
}
