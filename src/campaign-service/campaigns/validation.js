export const createCampaignSchema = {
  body: {
    name: (value) => (typeof value === "string" && value.trim().length >= 3 ? null : "name must be at least 3 characters."),
    audience: (value) => (typeof value === "string" && value.trim().length >= 3 ? null : "audience must be at least 3 characters."),
  },
};
