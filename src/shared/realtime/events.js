import { emitToClient } from "./socket.js";
import { pushNotificationService } from "../notifications/push-service.js";

function buildBasePayload(client, amount, transaction = null) {
  return {
    clientId: client.id,
    keycloakId: client.keycloakId,
    updatedPoints: client.points,
    amount,
    updatedTierId: client.tierId || null,
    updatedTier: client.tier || null,
    visits: client.visits,
    redemptionsCount: client.redemptionsCount,
    transaction,
  };
}

export function emitPointsUpdate(client, amount, transaction = null) {
  emitToClient(client.keycloakId, "points_update", buildBasePayload(client, amount, transaction));
  pushNotificationService.notifyPointsEarned(client, amount);
}

export function emitRewardRedeemed(client, amount, reward, transaction = null) {
  emitToClient(client.keycloakId, "reward_redeemed", {
    ...buildBasePayload(client, amount, transaction),
    reward: reward
      ? {
          id: reward.id,
          title: reward.title,
          pointsRequired: reward.pointsRequired,
        }
      : null,
  });
}

export function emitVisitAdded(client, amount, transaction = null) {
  emitToClient(client.keycloakId, "visit_added", buildBasePayload(client, amount, transaction));
  pushNotificationService.notifyPointsEarned(client, amount);
}

export function emitRewardUsed(client, claim) {
  emitToClient(client.keycloakId, "reward_used", {
    ...buildBasePayload(client, 0, null),
    claimId: claim.id,
    rewardTitle: claim.rewardTitle,
    status: claim.status,
    usedAt: claim.usedAt,
  });
  pushNotificationService.notifyRewardUsed(client, claim);
}

export function emitRewardReceived(client, claim) {
  emitToClient(client.keycloakId, "reward_received", {
    ...buildBasePayload(client, 0, null),
    claimId: claim.id,
    rewardTitle: claim.rewardTitle,
    status: claim.status,
    createdAt: claim.createdAt,
    source: claim.source,
    message: claim.message || "",
  });
  pushNotificationService.notifyRewardReceived(client, claim);
}

export function emitBirthdayAvailable(client, settings = null) {
  emitToClient(client.keycloakId, "birthday_available", {
    ...buildBasePayload(client, 0, null),
    available: true,
    message: settings?.message || "",
  });
  pushNotificationService.notifyBirthdayAvailable(client);
}
