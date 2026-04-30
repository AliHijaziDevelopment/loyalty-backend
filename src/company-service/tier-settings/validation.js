const requiredText = (label) => (value) => {
  if (typeof value !== "string" || value.trim().length < 2) {
    return `${label} must be at least 2 characters.`;
  }

  return null;
};

const optionalText = (label) => (value) => {
  if (value === undefined || value === "") {
    return null;
  }

  return requiredText(label)(value);
};

const optionalBoolean = (label) => (value) => {
  if (value === undefined || typeof value === "boolean") {
    return null;
  }

  return `${label} must be boolean.`;
};

const percentage = (value) => {
  if (!Number.isFinite(Number(value)) || Number(value) < 0 || Number(value) > 100) {
    return "discountPercentage must be between 0 and 100.";
  }

  return null;
};

const nonNegativeInteger = (label) => (value) => {
  if (!Number.isInteger(Number(value)) || Number(value) < 0) {
    return `${label} must be a non-negative integer.`;
  }

  return null;
};

const optionalHexColor = (value) => {
  if (value === undefined || value === "") {
    return null;
  }

  if (typeof value !== "string" || !/^#[0-9a-fA-F]{6}$/.test(value.trim())) {
    return "cardColor must be a valid hex color.";
  }

  return null;
};

export const tierIdSchema = {
  params: {
    id: (value) => (typeof value === "string" && value.trim().length >= 10 ? null : "id must be valid."),
  },
};

export const createTierSchema = {
  body: {
    name: requiredText("name"),
    discountPercentage: percentage,
    minVisits: nonNegativeInteger("minVisits"),
    cardColor: optionalHexColor,
    isActive: optionalBoolean("isActive"),
  },
};

export const updateTierSchema = {
  body: {
    name: optionalText("name"),
    discountPercentage: (value) => (value === undefined ? null : percentage(value)),
    minVisits: (value) => (value === undefined ? null : nonNegativeInteger("minVisits")(value)),
    cardColor: optionalHexColor,
    isActive: optionalBoolean("isActive"),
  },
};
