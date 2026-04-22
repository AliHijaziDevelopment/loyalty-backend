import { AppError } from "../../shared/errors/app-error.js";
import { defaultTierSettings, tierSettingsStore } from "./model.js";

const tierOrder = {
  Silver: 1,
  Gold: 2,
  VIP: 3,
};

function sortTiers(tiers) {
  return [...tiers].sort((left, right) => tierOrder[left.name] - tierOrder[right.name]);
}

export const tierSettingsService = {
  async getTierSettings(accountId) {
    if (!accountId) {
      throw new AppError(400, "Tenant account scope is required for tier settings.");
    }

    const settings = await tierSettingsStore.findByAccountId(accountId);
    return settings || { ...defaultTierSettings, accountId };
  },
  async saveTierSettings(accountId, payload) {
    if (!accountId) {
      throw new AppError(400, "Tenant account scope is required for tier settings.");
    }

    return tierSettingsStore.upsert(accountId, { tiers: sortTiers(payload.tiers) });
  },
  async resolveTier(accountId, visits, redemptionsCount) {
    const settings = await this.getTierSettings(accountId);
    const matchingTier = sortTiers(settings.tiers)
      .filter((tier) => visits >= tier.minVisits && redemptionsCount >= tier.minRedemptions)
      .at(-1);

    return matchingTier?.name || "Silver";
  },
};
