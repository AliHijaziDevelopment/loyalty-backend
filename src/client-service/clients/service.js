import crypto from "crypto";
import { AppError } from "../../shared/errors/app-error.js";
import { clientStore } from "./model.js";
import { transactionService } from "../transactions/service.js";
import { keycloakAdminService } from "../../shared/security/keycloak-admin.js";
import { tierSettingsService } from "../../company-service/tier-settings/service.js";
import { createQrToken, verifyQrToken } from "../../shared/security/qr-token.js";
import { emitPointsUpdate, emitVisitAdded } from "../../shared/realtime/events.js";

function normalizeEmail(email) {
  return email?.trim().toLowerCase() || "";
}

function normalizePhone(phone) {
  return phone?.trim() || "";
}

function normalizeUsername(username) {
  return username?.trim().toLowerCase() || "";
}

function generateTemporaryPassword() {
  const token = Math.random().toString(36).slice(2, 10);
  return `Medspa!${token}9`;
}

function requireAccountScope(accountId) {
  if (!accountId) {
    throw new AppError(400, "Tenant account scope is required for this client operation.");
  }

  return accountId;
}

export const clientService = {
  async getSelf(accountId, keycloakId) {
    const scopedAccountId = requireAccountScope(accountId);
    const client = await clientStore.findAnyByKeycloakId(keycloakId);

    if (!client || client.accountId !== scopedAccountId) {
      throw new AppError(404, "Client account was not found.");
    }

    return client;
  },
  async getSelfQrToken(accountId, keycloakId) {
    let client = await clientStore.findAnyByKeycloakIdWithSecret(keycloakId);
    const scopedAccountId = requireAccountScope(accountId);

    if (!client || client.accountId !== scopedAccountId) {
      throw new AppError(404, "Client account was not found.");
    }

    if (!client.qrSecret) {
      client = await clientStore.ensureQrSecret(
        client.accountId,
        client.id,
        crypto.randomBytes(16).toString("hex"),
      );
    }

    if (!client?.qrSecret) {
      throw new AppError(500, "Client QR secret could not be prepared.");
    }

    return createQrToken(client.qrSecret);
  },
  async updateSelf(accountId, keycloakId, payload) {
    const client = await this.getSelf(accountId, keycloakId);

    return clientStore.updateById(client.accountId, client.id, {
      ...(payload.avatarUrl !== undefined ? { avatarUrl: payload.avatarUrl.trim() } : {}),
    });
  },
  async changeSelfPassword(accountId, keycloakId, password) {
    const client = await this.getSelf(accountId, keycloakId);
    await keycloakAdminService.setUserPassword(client.keycloakId, password.trim());
    return { success: true };
  },
  async listClients(accountId, search, includeArchived = false) {
    if (!accountId) {
      return clientStore.list(search?.trim(), { includeArchived });
    }

    return clientStore.listByAccountId(accountId, search?.trim(), { includeArchived });
  },
  async getClientById(accountId, id) {
    const scopedAccountId = requireAccountScope(accountId);
    const client = await clientStore.findByIdIncludingArchived(scopedAccountId, id);

    if (!client) {
      throw new AppError(404, "Client was not found.");
    }

    return client;
  },
  async previewClientByQrToken(accountId, qrToken) {
    const scopedAccountId = requireAccountScope(accountId);
    const payload = verifyQrToken(qrToken.trim());
    const client = await clientStore.findByQrSecret(scopedAccountId, payload.nonce);

    if (!client) {
      throw new AppError(404, "Client could not be resolved from this QR token.");
    }

    if (client.status !== "active") {
      throw new AppError(422, "Archived clients cannot be scanned.");
    }

    if (client.accountId !== scopedAccountId) {
      throw new AppError(403, "Client does not belong to this tenant.");
    }

    return {
      id: client.id,
      name: client.name,
      phone: client.phone,
      tier: client.tier,
      points: client.points,
    };
  },
  async createClient(accountId, payload) {
    const scopedAccountId = requireAccountScope(accountId);
    const firstName = payload.firstName.trim();
    const lastName = payload.lastName.trim();
    const username = normalizeUsername(payload.username);
    const phone = normalizePhone(payload.phone);
    const email = normalizeEmail(payload.email);
    const dateOfBirth = payload.dateOfBirth ? new Date(payload.dateOfBirth) : null;
    const name = `${firstName} ${lastName}`.trim();

    if (await clientStore.findByPhone(scopedAccountId, phone)) {
      throw new AppError(409, "A client with this phone number already exists for this company.");
    }

    const temporaryPassword = payload.password?.trim() || generateTemporaryPassword();
    const keycloakUser = await keycloakAdminService.createOrResolveUser({
      email,
      username,
      firstName,
      lastName,
      password: temporaryPassword,
    });

    await keycloakAdminService.assignRealmRole(keycloakUser.id, "client");

    const existingClient = await clientStore.findAnyByKeycloakId(keycloakUser.id);

    if (existingClient && existingClient.accountId !== accountId) {
      throw new AppError(409, "This Keycloak user is already linked to another company.");
    }

    if (existingClient && existingClient.accountId === accountId) {
      throw new AppError(409, "This client already exists for the selected company.");
    }

    const client = await clientStore.create({
      keycloakId: keycloakUser.id,
      accountId: scopedAccountId,
      name,
      firstName,
      lastName,
      username,
      phone,
      email,
      dateOfBirth,
      avatarUrl: "",
      qrSecret: crypto.randomBytes(16).toString("hex"),
      points: 0,
      visits: 0,
      redemptionsCount: 0,
      tier: "Silver",
      status: "active",
      birthdayAvailable: false,
      birthdayAvailableYear: null,
      birthdayAllowOverride: false,
    });

    return {
      client,
      temporaryPassword: payload.password?.trim() ? null : temporaryPassword,
    };
  },
  async updateClient(accountId, id, payload) {
    const scopedAccountId = requireAccountScope(accountId);
    const existing = await clientStore.findById(scopedAccountId, id);

    if (!existing) {
      throw new AppError(404, "Client was not found.");
    }

    const firstName = payload.firstName !== undefined ? payload.firstName.trim() : existing.firstName;
    const lastName = payload.lastName !== undefined ? payload.lastName.trim() : existing.lastName;
    const username = payload.username !== undefined ? normalizeUsername(payload.username) : existing.username;
    const phone = payload.phone !== undefined ? normalizePhone(payload.phone) : existing.phone;
    const dateOfBirth = payload.dateOfBirth !== undefined
      ? (payload.dateOfBirth ? new Date(payload.dateOfBirth) : null)
      : existing.dateOfBirth || null;
    const duplicatePhoneClient = phone !== existing.phone ? await clientStore.findByPhone(scopedAccountId, phone) : null;

    if (duplicatePhoneClient && duplicatePhoneClient.id !== existing.id) {
      throw new AppError(409, "A client with this phone number already exists for this company.");
    }

    await keycloakAdminService.updateUser(existing.keycloakId, {
      username,
      email: payload.email !== undefined ? normalizeEmail(payload.email) : existing.email,
      firstName,
      lastName,
    });

    return clientStore.updateById(scopedAccountId, id, {
      firstName,
      lastName,
      username,
      name: `${firstName} ${lastName}`.trim(),
      ...(payload.phone !== undefined ? { phone } : {}),
      ...(payload.email !== undefined ? { email: normalizeEmail(payload.email) } : {}),
      ...(payload.dateOfBirth !== undefined ? { dateOfBirth } : {}),
    });
  },
  async deleteClient(accountId, id) {
    const scopedAccountId = requireAccountScope(accountId);
    const existing = await clientStore.findByIdIncludingArchived(scopedAccountId, id);

    if (!existing) {
      throw new AppError(404, "Client was not found.");
    }

    await keycloakAdminService.disableUser(existing.keycloakId);
    const client = await clientStore.archiveById(scopedAccountId, id);
    return client;
  },
  async restoreClient(accountId, id) {
    const scopedAccountId = requireAccountScope(accountId);
    const existing = await clientStore.findByIdIncludingArchived(scopedAccountId, id);

    if (!existing) {
      throw new AppError(404, "Client was not found.");
    }

    const client = await clientStore.restoreById(scopedAccountId, id);
    await keycloakAdminService.updateUser(existing.keycloakId, {
      username: existing.username,
      email: existing.email,
      firstName: existing.firstName,
      lastName: existing.lastName,
    });
    return client;
  },
  async addPoints(accountId, id, payload) {
    const scopedAccountId = requireAccountScope(accountId);
    const client = await clientStore.findById(scopedAccountId, id);

    if (!client) {
      throw new AppError(404, "Client was not found.");
    }

    if (client.status !== "active") {
      throw new AppError(422, "Archived clients must be restored before points can be updated.");
    }

    const updatedMetrics = await clientStore.incrementMetrics(scopedAccountId, id, {
      points: payload.points,
      visits: 1,
    });
    const nextTier = await tierSettingsService.resolveTier(scopedAccountId, updatedMetrics.visits, updatedMetrics.redemptionsCount);
    const updated = await clientStore.updateById(scopedAccountId, id, { tier: nextTier });

    const transaction = await transactionService.createTransaction(scopedAccountId, {
      clientId: id,
      clientName: client.name,
      type: "earn",
      points: payload.points,
      description: payload.description,
    });
    emitPointsUpdate(updated, payload.points, transaction);

    return updated;
  },
  async confirmVisit(accountId, id, payload) {
    const scopedAccountId = requireAccountScope(accountId);
    const client = await clientStore.findById(scopedAccountId, id);

    if (!client) {
      throw new AppError(404, "Client was not found.");
    }

    if (client.status !== "active") {
      throw new AppError(422, "Archived clients cannot be checked in.");
    }

    const awardedPoints = Number.isInteger(payload.points) ? payload.points : 0;
    const description = payload.description?.trim() || "Visit confirmed";

    const updatedMetrics = await clientStore.incrementMetrics(scopedAccountId, id, {
      visits: 1,
      ...(awardedPoints > 0 ? { points: awardedPoints } : {}),
    });
    const nextTier = await tierSettingsService.resolveTier(scopedAccountId, updatedMetrics.visits, updatedMetrics.redemptionsCount);
    const updated = await clientStore.updateById(scopedAccountId, id, { tier: nextTier });
    let transaction = null;

    if (awardedPoints > 0) {
      transaction = await transactionService.createTransaction(scopedAccountId, {
        clientId: id,
        clientName: client.name,
        type: "earn",
        points: awardedPoints,
        description,
      });
    }

    emitVisitAdded(updated, awardedPoints, transaction);

    return updated;
  },
  async redeemPoints(accountId, id, payload) {
    const scopedAccountId = requireAccountScope(accountId);
    const client = await clientStore.findById(scopedAccountId, id);

    if (!client) {
      throw new AppError(404, "Client was not found.");
    }

    if (client.status !== "active") {
      throw new AppError(422, "Archived clients must be restored before points can be updated.");
    }

    if (client.points < payload.points) {
      throw new AppError(422, "Client does not have enough points for this redemption.");
    }

    const updatedMetrics = await clientStore.incrementMetrics(scopedAccountId, id, {
      points: -payload.points,
      redemptionsCount: 1,
    });
    const nextTier = await tierSettingsService.resolveTier(scopedAccountId, updatedMetrics.visits, updatedMetrics.redemptionsCount);
    const updated = await clientStore.updateById(scopedAccountId, id, { tier: nextTier });

    const transaction = await transactionService.createTransaction(scopedAccountId, {
      clientId: id,
      clientName: client.name,
      type: "redeem",
      points: payload.points,
      description: payload.description,
    });
    emitPointsUpdate(updated, -payload.points, transaction);

    return updated;
  },
  async getClientStats(accountId) {
    if (!accountId) {
      return clientStore.aggregateGlobalStats();
    }

    const [clientStats, transactionMetrics] = await Promise.all([
      clientStore.aggregateStats(accountId),
      transactionService.getAccountMetrics(accountId),
    ]);

    return {
      totalClients: clientStats.totalClients,
      totalVisits: clientStats.totalVisits,
      totalRedemptions: transactionMetrics.totalRedemptions,
      totalPointsIssued: transactionMetrics.totalPointsIssued,
    };
  },
};
