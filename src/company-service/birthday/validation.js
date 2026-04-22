export const sendBirthdayRewardSchema = {
  body: {
    clientId: (value) => (typeof value === "string" && value.trim().length >= 10 ? null : "clientId must be valid."),
    allowOverride: (value) => (value === undefined || typeof value === "boolean" ? null : "allowOverride must be boolean."),
  },
};

export const claimBirthdayRewardSchema = {
  body: {
    rewardId: (value) => (typeof value === "string" && value.trim().length >= 10 ? null : "rewardId must be valid."),
  },
};
