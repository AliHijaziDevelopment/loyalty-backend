import { AppError } from "../../shared/errors/app-error.js";
import { keycloakAdminService } from "../../shared/security/keycloak-admin.js";
import { companyStore } from "../companies/model.js";
import { companyUserStore } from "./model.js";

export const companyUserService = {
  async createAssignment(payload) {
    const company = await companyStore.findByAccountId(payload.accountId);

    if (!company) {
      throw new AppError(404, "Company account was not found.");
    }

    const keycloakUser = await keycloakAdminService.createOrResolveUser({
      email: payload.email,
      username: payload.username,
      firstName: payload.firstName,
      lastName: payload.lastName,
      password: payload.password,
    });
    const existing = await companyUserStore.findAnyByKeycloakId(keycloakUser.id);

    if (existing && existing.accountId !== payload.accountId) {
      throw new AppError(409, "This Keycloak user is already assigned to another company.");
    }

    if (existing && existing.accountId === payload.accountId) {
      throw new AppError(409, "This Keycloak user is already assigned to the selected company.");
    }

    await keycloakAdminService.assignRealmRole(keycloakUser.id, payload.role);

    return companyUserStore.create({
      accountId: payload.accountId,
      role: payload.role,
      keycloakId: keycloakUser.id,
      email: keycloakUser.email,
      fullName: `${payload.firstName} ${payload.lastName}`.trim(),
    });
  },
  async listAssignments(accountId) {
    if (!accountId) {
      return companyUserStore.list();
    }

    return companyUserStore.findByAccountId(accountId);
  },
  async resolveAssignment(keycloakId) {
    return companyUserStore.findByKeycloakId(keycloakId);
  },
};
