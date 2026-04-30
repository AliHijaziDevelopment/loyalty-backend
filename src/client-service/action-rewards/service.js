import { AppError } from "../../shared/errors/app-error.js";
import { tierSettingsService } from "../../company-service/tier-settings/service.js";
import { clientStore } from "../clients/model.js";
import { transactionService } from "../transactions/service.js";
import { actionRewardStore } from "./model.js";

function requireCompanyScope(companyId) {
  if (!companyId) {
    throw new AppError(400, "Tenant company scope is required for action rewards.");
  }

  return companyId;
}

function normalizePayload(payload) {
  return {
    ...payload,
    title: payload.title?.trim(),
    description: payload.description?.trim() || "",
    link: payload.link?.trim(),
    points: Number(payload.points),
    isActive: payload.isActive ?? true,
  };
}

function withClaimStatus(actions, claimedIds) {
  return actions.map((action) => ({
    ...action,
    claimed: claimedIds.has(action.id),
  }));
}

export const actionRewardService = {
  async listAdmin(companyId) {
    return { data: await actionRewardStore.list(requireCompanyScope(companyId)) };
  },
  async create(companyId, payload) {
    return actionRewardStore.create(requireCompanyScope(companyId), normalizePayload(payload));
  },
  async update(companyId, id, payload) {
    const action = await actionRewardStore.updateById(requireCompanyScope(companyId), id, normalizePayload(payload));

    if (!action) {
      throw new AppError(404, "Action reward was not found.");
    }

    return action;
  },
  async remove(companyId, id) {
    const action = await actionRewardStore.softDeleteById(requireCompanyScope(companyId), id);

    if (!action) {
      throw new AppError(404, "Action reward was not found.");
    }

    return action;
  },
  async listClient(companyId, client) {
    const scopedCompanyId = requireCompanyScope(companyId);
    const [actions, claimedIds] = await Promise.all([
      actionRewardStore.list(scopedCompanyId, { activeOnly: true }),
      actionRewardStore.listClaimedIds(scopedCompanyId, client.id),
    ]);

    return { data: withClaimStatus(actions, claimedIds) };
  },
  async claim(companyId, actionRewardId, client) {
    const scopedCompanyId = requireCompanyScope(companyId);
    const action = await actionRewardStore.findById(scopedCompanyId, actionRewardId);

    if (!action || !action.isActive) {
      throw new AppError(404, "Action reward was not found.");
    }

    if (await actionRewardStore.findClaim(scopedCompanyId, client.id, action.id)) {
      throw new AppError(409, "This action has already been claimed.");
    }

    try {
      await actionRewardStore.createClaim(scopedCompanyId, client.id, action.id);
    } catch (error) {
      if (error?.code === 11000) {
        throw new AppError(409, "This action has already been claimed.");
      }

      throw error;
    }

    const updatedMetrics = await clientStore.incrementMetrics(scopedCompanyId, client.id, {
      points: action.points,
    });
    const updatedClient = await tierSettingsService.attachTiers(scopedCompanyId, updatedMetrics);
    const transaction = await transactionService.createTransaction(scopedCompanyId, {
      clientId: client.id,
      clientName: client.name,
      type: "earn",
      points: action.points,
      description: `Free points: ${action.title}`,
    });

    return {
      action: {
        ...action,
        claimed: true,
      },
      client: updatedClient,
      transaction,
    };
  },
};
