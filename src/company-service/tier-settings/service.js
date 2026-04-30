import { AppError } from "../../shared/errors/app-error.js";
import { tierStore } from "./model.js";

function requireCompanyScope(companyId) {
  if (!companyId) {
    throw new AppError(400, "Tenant company scope is required for tiers.");
  }

  return companyId;
}

function normalizePayload(payload) {
  return {
    ...payload,
    ...(payload.name ? { name: payload.name.trim() } : {}),
    ...(payload.discountPercentage !== undefined ? {
      discountPercentage: Math.min(Math.max(Number(payload.discountPercentage || 0), 0), 100),
    } : {}),
    ...(payload.minVisits !== undefined ? { minVisits: Math.max(Number(payload.minVisits || 0), 0) } : {}),
    ...(payload.cardColor ? { cardColor: payload.cardColor.trim() } : {}),
  };
}

export const tierSettingsService = {
  async listTiers(companyId, filters = {}) {
    return tierStore.list(requireCompanyScope(companyId), filters);
  },
  async getTier(companyId, id) {
    if (!id) {
      return null;
    }

    return tierStore.findById(requireCompanyScope(companyId), id);
  },
  async createTier(companyId, payload) {
    try {
      return await tierStore.create(requireCompanyScope(companyId), normalizePayload(payload));
    } catch (error) {
      if (error?.code === 11000) {
        throw new AppError(409, "Tier already exists.");
      }

      throw error;
    }
  },
  async updateTier(companyId, id, payload) {
    try {
      const tier = await tierStore.updateById(requireCompanyScope(companyId), id, normalizePayload(payload));

      if (!tier) {
        throw new AppError(404, "Tier was not found.");
      }

      return tier;
    } catch (error) {
      if (error?.code === 11000) {
        throw new AppError(409, "Tier already exists.");
      }

      throw error;
    }
  },
  async deleteTier(companyId, id) {
    const tier = await tierStore.softDeleteById(requireCompanyScope(companyId), id);

    if (!tier) {
      throw new AppError(404, "Tier was not found.");
    }

    return tier;
  },
  async resolveTierDiscount(companyId, tierId) {
    if (!tierId) {
      return 0;
    }

    const tier = await tierStore.findById(requireCompanyScope(companyId), tierId);

    if (!tier?.isActive) {
      return 0;
    }

    return Math.min(Math.max(Number(tier.discountPercentage || 0), 0), 100);
  },
  async resolveTierByVisits(companyId, visits) {
    const response = await tierStore.list(requireCompanyScope(companyId), { activeOnly: true });
    return response.data
      .filter((tier) => Number(visits || 0) >= Number(tier.minVisits || 0))
      .sort((left, right) => Number(right.minVisits || 0) - Number(left.minVisits || 0))[0] || null;
  },
  async attachTiers(companyId, clients) {
    const scopedCompanyId = requireCompanyScope(companyId);
    const list = Array.isArray(clients) ? clients : [clients];
    const tierIds = [...new Set(list.map((client) => client?.tierId).filter(Boolean))];
    const tiers = await tierStore.findManyByIds(scopedCompanyId, tierIds);
    const tierMap = new Map(tiers.map((tier) => [tier.id, tier]));
    const enriched = list.map((client) => ({
      ...client,
      tier: client?.tierId ? tierMap.get(client.tierId) || null : null,
    }));

    return Array.isArray(clients) ? enriched : enriched[0];
  },
};
