export const createRewardSchema = {
  body: {
    title: (value) => (typeof value === "string" && value.trim().length >= 3 ? null : "title must be at least 3 characters."),
    description: (value) => (typeof value === "string" && value.trim().length >= 5 ? null : "description must be at least 5 characters."),
    pointsRequired: (value) => (Number.isInteger(value) && value > 0 ? null : "pointsRequired must be a positive integer."),
    active: (value) => (value === undefined || typeof value === "boolean" ? null : "active must be boolean."),
    isBirthdayReward: (value) => (value === undefined || typeof value === "boolean" ? null : "isBirthdayReward must be boolean."),
    birthdayAutoEnabled: (value) => (value === undefined || typeof value === "boolean" ? null : "birthdayAutoEnabled must be boolean."),
  },
};

export const updateRewardSchema = {
  body: {
    title: (value) => (value === undefined || (typeof value === "string" && value.trim().length >= 3) ? null : "title must be at least 3 characters."),
    description: (value) => (value === undefined || (typeof value === "string" && value.trim().length >= 5) ? null : "description must be at least 5 characters."),
    pointsRequired: (value) => (value === undefined || (Number.isInteger(value) && value > 0) ? null : "pointsRequired must be a positive integer."),
    active: (value) => (value === undefined || typeof value === "boolean" ? null : "active must be boolean."),
    isBirthdayReward: (value) => (value === undefined || typeof value === "boolean" ? null : "isBirthdayReward must be boolean."),
    birthdayAutoEnabled: (value) => (value === undefined || typeof value === "boolean" ? null : "birthdayAutoEnabled must be boolean."),
  },
};

export const rewardIdSchema = {
  params: {
    id: (value) => (typeof value === "string" && value.trim().length >= 10 ? null : "id must be valid."),
  },
};
