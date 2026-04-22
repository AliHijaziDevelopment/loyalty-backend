export const saveBirthdaySettingsSchema = {
  body: {
    enabled: (value) => (typeof value === "boolean" ? null : "enabled must be boolean."),
    rewards: (value) => {
      if (value === undefined) {
        return null;
      }

      if (!Array.isArray(value)) {
        return "rewards must be an array when provided.";
      }

      for (const rewardId of value) {
        if (typeof rewardId !== "string" || rewardId.trim().length < 10) {
          return "each birthday reward id must be valid.";
        }
      }

      return null;
    },
    message: (value) => {
      if (value === undefined || value === "") {
        return null;
      }

      return typeof value === "string" && value.trim().length >= 2 ? null : "message must be at least 2 characters when provided.";
    },
  },
};
