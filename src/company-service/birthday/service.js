import { AppError } from "../../shared/errors/app-error.js";
import { clientStore } from "../../client-service/clients/model.js";
import { rewardClaimsService } from "../../rewards-service/reward-claims/service.js";
import { rewardsStore } from "../../rewards-service/rewards/model.js";
import { emitBirthdayAvailable } from "../../shared/realtime/events.js";
import { birthdaySettingsService } from "../birthday-settings/service.js";

function hasBirthdayToday(date) {
  if (!date) {
    return false;
  }

  const current = new Date();
  const target = new Date(date);

  return current.getUTCMonth() === target.getUTCMonth() && current.getUTCDate() === target.getUTCDate();
}

export const birthdayRewardService = {
  async sendBirthdayGift(accountId, payload) {
    if (!accountId) {
      throw new AppError(400, "Tenant account scope is required for birthday gifts.");
    }

    const client = await clientStore.findById(accountId, payload.clientId);

    if (!client) {
      throw new AppError(404, "Client was not found.");
    }

    const settings = await birthdaySettingsService.getCurrent(accountId);

    if (!settings.rewards?.length) {
      throw new AppError(422, "Birthday reward settings are incomplete.");
    }

    if (!payload.allowOverride && !hasBirthdayToday(client.dateOfBirth)) {
      throw new AppError(422, "This client does not have a birthday today.");
    }

    const currentYear = new Date().getUTCFullYear();
    for (const rewardId of settings.rewards) {
      const existing = await rewardClaimsService.findBirthdayClaim(accountId, client.id, rewardId, currentYear);

      if (existing) {
        throw new AppError(409, "Birthday reward has already been claimed by this client this year.");
      }
    }

    const updated = await clientStore.setBirthdayAvailability(accountId, client.id, {
      birthdayAvailable: true,
      birthdayAvailableYear: currentYear,
      birthdayAllowOverride: Boolean(payload.allowOverride),
    });

    emitBirthdayAvailable(updated, settings);
    return updated;
  },
  async getAvailableBirthdayRewards(accountId, clientId) {
    if (!accountId) {
      throw new AppError(400, "Tenant account scope is required for birthday gifts.");
    }

    const client = await clientStore.findById(accountId, clientId);

    if (!client) {
      throw new AppError(404, "Client was not found.");
    }

    const settings = await birthdaySettingsService.getCurrent(accountId);
    const currentYear = new Date().getUTCFullYear();
    const isBirthdayEligible = hasBirthdayToday(client.dateOfBirth) || client.birthdayAllowOverride;

    if (!settings.enabled || !settings.rewards?.length || !client.birthdayAvailable || client.birthdayAvailableYear !== currentYear || !isBirthdayEligible) {
      if (client.birthdayAvailable) {
        await clientStore.setBirthdayAvailability(accountId, client.id, {
          birthdayAvailable: false,
          birthdayAvailableYear: null,
          birthdayAllowOverride: false,
        });
      }

      return {
        available: false,
        message: settings.message || "",
        rewards: [],
      };
    }

    for (const rewardId of settings.rewards) {
      const existing = await rewardClaimsService.findBirthdayClaim(accountId, client.id, rewardId, currentYear);

      if (existing) {
        await clientStore.setBirthdayAvailability(accountId, client.id, {
          birthdayAvailable: false,
          birthdayAvailableYear: null,
          birthdayAllowOverride: false,
        });

        return {
          available: false,
          message: settings.message || "",
          rewards: [],
        };
      }
    }

    const rewards = (await Promise.all(settings.rewards.map((rewardId) => rewardsStore.findById(accountId, rewardId))))
      .filter((reward) => reward && reward.active);

    return {
      available: true,
      message: settings.message || "",
      rewards,
    };
  },
  async claimBirthdayReward(accountId, clientId, rewardId) {
    if (!accountId) {
      throw new AppError(400, "Tenant account scope is required for birthday gifts.");
    }

    const client = await clientStore.findById(accountId, clientId);

    if (!client) {
      throw new AppError(404, "Client was not found.");
    }

    const settings = await birthdaySettingsService.getCurrent(accountId);
    const currentYear = new Date().getUTCFullYear();

    if (!client.birthdayAvailable || client.birthdayAvailableYear !== currentYear) {
      throw new AppError(422, "Birthday gift is not available.");
    }

    if (!(hasBirthdayToday(client.dateOfBirth) || client.birthdayAllowOverride)) {
      throw new AppError(422, "Birthday reward is not available for this client today.");
    }

    if (!settings.rewards?.includes(rewardId)) {
      throw new AppError(403, "Selected reward is not allowed for birthday gifts.");
    }

    for (const allowedRewardId of settings.rewards) {
      const existing = await rewardClaimsService.findBirthdayClaim(accountId, client.id, allowedRewardId, currentYear);

      if (existing) {
        throw new AppError(409, "Birthday gift has already been claimed this year.");
      }
    }

    const reward = await rewardsStore.findById(accountId, rewardId);

    if (!reward || !reward.active) {
      throw new AppError(404, "Selected birthday reward was not found.");
    }

    const claim = await rewardClaimsService.createPendingClaim(accountId, {
      clientId: client.id,
      clientName: client.name,
      clientPhone: client.phone,
      rewardId: reward.id,
      rewardTitle: reward.title,
      pointsUsed: 0,
      source: "BIRTHDAY",
      message: settings.message || "",
      birthdayYear: currentYear,
    });

    await clientStore.setBirthdayAvailability(accountId, client.id, {
      birthdayAvailable: false,
      birthdayAvailableYear: null,
      birthdayAllowOverride: false,
    });

    return claim;
  },
  async runDailyBirthdayRewards() {
    try {
      const settingsList = await birthdaySettingsService.listEnabled();
      const now = new Date();
      const month = now.getUTCMonth() + 1;
      const day = now.getUTCDate();
      const year = now.getUTCFullYear();

      for (const settings of settingsList) {
        if (!settings.rewards?.length) {
          continue;
        }

        const clients = await clientStore.listBirthdayClients(settings.accountId, month, day);

        for (const client of clients) {
          let alreadyClaimed = false;
          for (const rewardId of settings.rewards) {
            const existing = await rewardClaimsService.findBirthdayClaim(settings.accountId, client.id, rewardId, year);
            if (existing) {
              alreadyClaimed = true;
              break;
            }
          }

          if (alreadyClaimed || (client.birthdayAvailable && client.birthdayAvailableYear === year)) {
            continue;
          }

          const updated = await clientStore.setBirthdayAvailability(settings.accountId, client.id, {
            birthdayAvailable: true,
            birthdayAvailableYear: year,
            birthdayAllowOverride: false,
          });

          emitBirthdayAvailable(updated, settings);
        }
      }
    } catch (error) {
      console.error("Birthday reward job failed", error);
    }
  },
};
