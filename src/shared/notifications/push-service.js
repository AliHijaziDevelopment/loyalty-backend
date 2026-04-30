import { env } from "../config/env.js";
import { clientStore } from "../../client-service/clients/model.js";

let messagingPromise = null;

function pushEnabled() {
  return Boolean(env.firebaseProjectId && env.firebaseClientEmail && env.firebasePrivateKey);
}

function logPush(message, context = {}) {
  console.info(`[push] ${message}`, context);
}

async function importModule(specifier) {
  return import(specifier);
}

async function getMessagingClient() {
  if (!pushEnabled()) {
    return null;
  }

  messagingPromise ||= (async () => {
    const [{ cert, getApps, initializeApp }, { getMessaging }] = await Promise.all([
      importModule("firebase-admin/app"),
      importModule("firebase-admin/messaging"),
    ]);

    const app = getApps()[0] || initializeApp({
      credential: cert({
        projectId: env.firebaseProjectId,
        clientEmail: env.firebaseClientEmail,
        privateKey: env.firebasePrivateKey.replace(/\\n/g, "\n"),
      }),
    });

    logPush("Firebase Admin initialized", {
      projectId: env.firebaseProjectId,
      clientEmail: env.firebaseClientEmail,
    });

    return getMessaging(app);
  })();

  return messagingPromise;
}

function normalizeData(data = {}) {
  return Object.fromEntries(
    Object.entries(data)
      .filter(([, value]) => value !== undefined && value !== null)
      .map(([key, value]) => [key, typeof value === "string" ? value : JSON.stringify(value)]),
  );
}

function shouldRemoveToken(result) {
  const code = result.error?.code || "";
  return [
    "messaging/invalid-registration-token",
    "messaging/registration-token-not-registered",
    "messaging/mismatched-credential",
  ].includes(code);
}

async function safeSend(accountId, clientId, title, body, data = {}) {
  try {
    const messaging = await getMessagingClient();

    if (!messaging) {
      logPush("Firebase Admin is not configured; notification skipped", {
        accountId,
        clientId,
        title,
      });
      return;
    }

    const client = await clientStore.findByIdWithFcmTokens(accountId, clientId);
    const tokens = [...new Set(client?.fcmTokens || [])];

    if (!client) {
      logPush("Client not found for push notification", {
        accountId,
        clientId,
        title,
      });
      return;
    }

    if (tokens.length === 0) {
      logPush("No FCM tokens saved for client", {
        accountId,
        clientId,
        keycloakId: client.keycloakId,
        title,
      });
      return;
    }

    logPush("Sending notification", {
      accountId,
      clientId,
      keycloakId: client.keycloakId,
      tokenCount: tokens.length,
      title,
      type: data.type || "",
    });

    const response = await messaging.sendEachForMulticast({
      tokens,
      notification: { title, body },
      data: normalizeData({
        accountId,
        clientId,
        ...data,
      }),
      webpush: {
        fcmOptions: {
          link: data.link || "/",
        },
      },
    });

    const invalidTokens = response.responses
      .map((result, index) => (shouldRemoveToken(result) ? tokens[index] : null))
      .filter(Boolean);

    if (invalidTokens.length > 0) {
      await clientStore.removeFcmTokens(accountId, clientId, invalidTokens);
    }

    logPush("Firebase send result", {
      accountId,
      clientId,
      successCount: response.successCount,
      failureCount: response.failureCount,
      invalidTokenCount: invalidTokens.length,
      errors: response.responses
        .filter((result) => result.error)
        .map((result) => result.error.code || result.error.message)
        .slice(0, 5),
    });
  } catch (error) {
    console.warn("[push] notification skipped:", error?.message || error);
    messagingPromise = null;
  }
}

function pushClient(client, title, body, data = {}) {
  if (!client?.accountId || !client?.id) {
    return;
  }

  void safeSend(client.accountId, client.id, title, body, data);
}

export const pushNotificationService = {
  sendPushNotification(accountId, clientId, title, body, data = {}) {
    void safeSend(accountId, clientId, title, body, data);
  },
  notifyPointsEarned(client, amount) {
    if (amount <= 0) {
      return;
    }

    pushClient(client, "Points earned", `You received ${amount} points`, {
      type: "points_earned",
      amount,
      link: "/",
    });
  },
  notifyTierUpgrade(client) {
    const tierName = client?.tier?.name || "a new tier";
    pushClient(client, "Tier upgrade", `You reached ${tierName}`, {
      type: "tier_upgrade",
      tierId: client?.tierId || "",
      tierName,
      link: "/",
    });
  },
  notifyBirthdayAvailable(client) {
    pushClient(client, "Birthday gift", "Happy birthday! Your gift is ready", {
      type: "birthday_available",
      link: "/",
    });
  },
  notifyRewardUsed(client, claim) {
    pushClient(client, "Reward used", "Your reward was used successfully", {
      type: "reward_used",
      claimId: claim?.id || "",
      rewardTitle: claim?.rewardTitle || "",
      link: "/rewards/library",
    });
  },
  notifyRewardReceived(client, claim) {
    pushClient(client, "Reward received", claim?.rewardTitle || "You received a reward", {
      type: "reward_received",
      claimId: claim?.id || "",
      link: "/rewards/library",
    });
  },
};
