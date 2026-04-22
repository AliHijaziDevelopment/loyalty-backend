import { AppError } from "../../shared/errors/app-error.js";
import { birthdaySettingsStore, defaultBirthdaySettings } from "./model.js";

export const birthdaySettingsService = {
  async getCurrent(accountId) {
    if (!accountId) {
      throw new AppError(400, "Tenant account scope is required for birthday settings.");
    }

    const settings = await birthdaySettingsStore.findByAccountId(accountId);
    return settings || { ...defaultBirthdaySettings, accountId };
  },
  async saveCurrent(accountId, payload) {
    if (!accountId) {
      throw new AppError(400, "Tenant account scope is required for birthday settings.");
    }

    return birthdaySettingsStore.upsert(accountId, {
      enabled: Boolean(payload.enabled),
      rewards: Array.isArray(payload.rewards) ? payload.rewards.map((value) => value.trim()).filter(Boolean) : [],
      message: payload.message?.trim() || "",
    });
  },
  async listEnabled() {
    return birthdaySettingsStore.listEnabled();
  },
};
