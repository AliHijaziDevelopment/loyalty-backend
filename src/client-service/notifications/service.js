import { AppError } from "../../shared/errors/app-error.js";
import { companyStore } from "../../company-service/companies/model.js";
import { emitPointsUpdate } from "../../shared/realtime/events.js";
import { clientStore } from "../clients/model.js";
import { transactionService } from "../transactions/service.js";

function requireClientScope(accountId, client) {
  if (!accountId || !client?.id || client.accountId !== accountId) {
    throw new AppError(403, "Client notification registration is not allowed for this tenant.");
  }
}

export const clientNotificationService = {
  async registerToken(accountId, client, token) {
    requireClientScope(accountId, client);

    const currentClient = await clientStore.findById(accountId, client.id);

    if (!currentClient) {
      throw new AppError(404, "Client account was not found.");
    }

    const updated = await clientStore.addFcmToken(accountId, client.id, token.trim());

    if (!updated) {
      throw new AppError(404, "Client account was not found.");
    }

    console.info("[push] FCM token registered", {
      accountId,
      clientId: client.id,
      keycloakId: client.keycloakId,
      tokenCount: updated.fcmTokens?.length || 0,
    });

    const company = await companyStore.findByAccountId(accountId);
    const pointsAdded = Number(company?.notificationRewardPoints || 0);
    let rewardedClient = updated;
    let awardedPoints = 0;

    console.info("[push] notification reward check", {
      accountId,
      clientId: client.id,
      notificationRewardPoints: pointsAdded,
      hasClaimedNotificationReward: Boolean(currentClient.hasClaimedNotificationReward),
    });

    if (pointsAdded > 0 && !currentClient.hasClaimedNotificationReward) {
      const claimed = await clientStore.claimNotificationReward(accountId, client.id, pointsAdded);

      if (claimed) {
        const transaction = await transactionService.createTransaction(accountId, {
          clientId: client.id,
          clientName: client.name,
          type: "earn",
          points: pointsAdded,
          description: "Enabled push notifications",
        });

        rewardedClient = claimed;
        awardedPoints = pointsAdded;
        emitPointsUpdate(rewardedClient, pointsAdded, transaction);
      } else {
        console.info("[push] notification reward already claimed before update completed", {
          accountId,
          clientId: client.id,
        });
      }
    }

    return {
      enabled: true,
      tokenCount: updated.fcmTokens?.length || 0,
      pointsAdded: awardedPoints,
      client: {
        id: rewardedClient.id,
        points: rewardedClient.points,
        hasClaimedNotificationReward: rewardedClient.hasClaimedNotificationReward,
      },
    };
  },
};
