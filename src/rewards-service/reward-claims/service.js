import { AppError } from "../../shared/errors/app-error.js";
import { createSignedQrToken, verifyQrToken } from "../../shared/security/qr-token.js";
import { clientStore } from "../../client-service/clients/model.js";
import { emitRewardUsed } from "../../shared/realtime/events.js";
import { rewardClaimsStore } from "./model.js";

function requireAccountScope(accountId) {
  if (!accountId) {
    throw new AppError(400, "Tenant account scope is required for this reward claim operation.");
  }

  return accountId;
}

export const rewardClaimsService = {
  async createPendingClaim(accountId, payload) {
    const scopedAccountId = requireAccountScope(accountId);

    return rewardClaimsStore.create({
      accountId: scopedAccountId,
      clientId: payload.clientId,
      clientName: payload.clientName,
      clientPhone: payload.clientPhone,
      rewardId: payload.rewardId,
      rewardTitle: payload.rewardTitle,
      pointsUsed: payload.pointsUsed,
      status: "PENDING",
      source: payload.source || "STANDARD",
      message: payload.message || "",
      birthdayYear: payload.birthdayYear || null,
    });
  },
  async findBirthdayClaim(accountId, clientId, rewardId, year) {
    const scopedAccountId = requireAccountScope(accountId);
    return rewardClaimsStore.findBirthdayClaim(scopedAccountId, clientId, rewardId, year);
  },
  async listForClient(accountId, clientId, status = "PENDING") {
    const scopedAccountId = requireAccountScope(accountId);
    return rewardClaimsStore.listByClient(scopedAccountId, clientId, status);
  },
  async getQrTokenForClient(accountId, clientId, claimId) {
    const scopedAccountId = requireAccountScope(accountId);
    const claim = await rewardClaimsStore.findByIdWithSecret(scopedAccountId, claimId);

    if (!claim || claim.clientId !== clientId) {
      throw new AppError(404, "Reward claim was not found.");
    }

    if (claim.status !== "PENDING") {
      throw new AppError(422, "Only pending reward claims can generate a QR code.");
    }

    if (!claim.qrSecret) {
      throw new AppError(500, "Reward claim QR secret is unavailable.");
    }

    const qrToken = createSignedQrToken({
      claimId: claim.id,
      qrSecret: claim.qrSecret,
      kind: "reward_claim",
    });

    return {
      claim,
      ...qrToken,
    };
  },
  async previewByQrToken(accountId, qrToken) {
    const scopedAccountId = requireAccountScope(accountId);
    const payload = verifyQrToken(qrToken.trim());

    if (payload.kind !== "reward_claim" || !payload.claimId || !payload.qrSecret) {
      throw new AppError(400, "Reward QR token is invalid.");
    }

    const claim = await rewardClaimsStore.findByIdWithSecret(scopedAccountId, payload.claimId);

    if (!claim || claim.qrSecret !== payload.qrSecret) {
      throw new AppError(404, "Reward claim could not be resolved from this QR token.");
    }

    if (claim.status !== "PENDING") {
      throw new AppError(422, "This reward claim has already been used.");
    }

    const client = await clientStore.findById(scopedAccountId, claim.clientId);

    if (!client) {
      throw new AppError(404, "Client linked to this reward claim was not found.");
    }

    return {
      id: claim.id,
      clientId: client.id,
      clientName: client.name,
      phone: client.phone,
      rewardTitle: claim.rewardTitle,
      pointsUsed: claim.pointsUsed,
      status: claim.status,
      createdAt: claim.createdAt,
    };
  },
  async markUsed(accountId, claimId) {
    const scopedAccountId = requireAccountScope(accountId);
    const claim = await rewardClaimsStore.findById(scopedAccountId, claimId);

    if (!claim) {
      throw new AppError(404, "Reward claim was not found.");
    }

    if (claim.status !== "PENDING") {
      throw new AppError(422, "This reward claim has already been used.");
    }

    const updated = await rewardClaimsStore.markUsed(scopedAccountId, claimId, new Date());
    const client = await clientStore.findById(scopedAccountId, updated.clientId);

    if (client) {
      emitRewardUsed(client, updated);
    }

    return updated;
  },
  async listForAdmin(accountId, filters) {
    const scopedAccountId = requireAccountScope(accountId);
    return rewardClaimsStore.listByAccount(scopedAccountId, filters);
  },
};
