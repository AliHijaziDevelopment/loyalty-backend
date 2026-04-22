const integerField = (label) => (value) => (
  Number.isInteger(value) && value >= 0 ? null : `${label} must be a non-negative integer.`
);

function validateTier(expectedName) {
  return (value) => {
    if (!value || typeof value !== "object") {
      return `${expectedName} tier configuration is required.`;
    }

    if (value.name !== expectedName) {
      return `${expectedName} tier name must be "${expectedName}".`;
    }

    if (integerField(`${expectedName}.minVisits`)(value.minVisits)) {
      return `${expectedName} minVisits must be a non-negative integer.`;
    }

    if (integerField(`${expectedName}.minRedemptions`)(value.minRedemptions)) {
      return `${expectedName} minRedemptions must be a non-negative integer.`;
    }

    return null;
  };
}

export const saveTierSettingsSchema = {
  body: {
    tiers: (value) => {
      if (!Array.isArray(value) || value.length !== 3) {
        return "tiers must contain exactly Silver, Gold, and VIP.";
      }

      const validators = {
        Silver: validateTier("Silver"),
        Gold: validateTier("Gold"),
        VIP: validateTier("VIP"),
      };

      for (const tier of value) {
        const validator = validators[tier?.name];

        if (!validator) {
          return "tiers must only include Silver, Gold, and VIP.";
        }

        const error = validator(tier);

        if (error) {
          return error;
        }
      }

      return null;
    },
  },
};
