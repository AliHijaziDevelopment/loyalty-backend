import { AppError } from "../../shared/errors/app-error.js";
import { clientStore } from "../../client-service/clients/model.js";
import { transactionService } from "../../client-service/transactions/service.js";
import { tierSettingsService } from "../../company-service/tier-settings/service.js";
import { emitRewardRedeemed } from "../../shared/realtime/events.js";
import { rewardClaimsService } from "../reward-claims/service.js";
import { rewardsStore } from "./model.js";

export const rewardsService = {
  async listRewards(accountId) {
    return rewardsStore.listByAccount(accountId);
  },
  async listClientRewards(accountId) {
    return rewardsStore.listByAccount(accountId, { activeOnly: true });
  },
  async createReward(accountId, payload) {
    return rewardsStore.create(accountId, payload);
  },
  async updateReward(accountId, id, payload) {
    const reward = await rewardsStore.updateById(accountId, id, payload);

    if (!reward) {
      throw new AppError(404, "Reward was not found.");
    }

    return reward;
  },
  async deleteReward(accountId, id) {
    const reward = await rewardsStore.deleteById(accountId, id);

    if (!reward) {
      throw new AppError(404, "Reward was not found.");
    }

    return reward;
  },
  async redeemReward(accountId, rewardId, client) {
    const reward = await rewardsStore.findById(accountId, rewardId);

    if (!reward || !reward.active) {
      throw new AppError(404, "Reward was not found.");
    }

    if (client.points < reward.pointsRequired) {
      throw new AppError(422, "You do not have enough points to redeem this reward.");
    }

    const updatedMetrics = await clientStore.incrementMetrics(accountId, client.id, {
      points: -reward.pointsRequired,
      redemptionsCount: 1,
    });
    const nextTier = await tierSettingsService.resolveTier(accountId, updatedMetrics.visits, updatedMetrics.redemptionsCount);
    const updatedClient = await clientStore.updateById(accountId, client.id, { tier: nextTier });

    const transaction = await transactionService.createTransaction(accountId, {
      clientId: client.id,
      clientName: client.name,
      type: "redeem",
      points: reward.pointsRequired,
      description: `Redeemed reward: ${reward.title}`,
    });

    const claim = await rewardClaimsService.createPendingClaim(accountId, {
      clientId: client.id,
      clientName: client.name,
      clientPhone: client.phone,
      rewardId: reward.id,
      rewardTitle: reward.title,
      pointsUsed: reward.pointsRequired,
      source: "STANDARD",
    });

    await rewardsStore.incrementRedemptionCount(accountId, rewardId);
    emitRewardRedeemed(updatedClient, -reward.pointsRequired, reward, transaction);

    return {
      reward,
      claim,
      client: updatedClient,
      message: "Reward claimed successfully. Show the QR code in clinic to use it.",
    };
  },
};
