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

const urlValue = (value) => {
  if (typeof value !== "string") {
    return "link must be a valid URL.";
  }

  try {
    const url = new URL(value.trim());
    return ["http:", "https:"].includes(url.protocol) ? null : "link must use http or https.";
  } catch {
    return "link must be a valid URL.";
  }
};

const pointsValue = (value) => {
  if (!Number.isInteger(Number(value)) || Number(value) <= 0) {
    return "points must be a positive integer.";
  }

  return null;
};

const optionalBoolean = (label) => (value) => {
  if (value === undefined || typeof value === "boolean") {
    return null;
  }

  return `${label} must be boolean.`;
};

export const actionRewardIdSchema = {
  params: {
    id: (value) => (typeof value === "string" && value.trim().length >= 10 ? null : "id must be valid."),
  },
};

export const createActionRewardSchema = {
  body: {
    title: requiredText("title"),
    description: optionalText("description"),
    link: urlValue,
    points: pointsValue,
    isActive: optionalBoolean("isActive"),
  },
};

export const updateActionRewardSchema = {
  body: {
    title: optionalText("title"),
    description: (value) => (value === undefined || typeof value === "string" ? null : "description must be text."),
    link: (value) => (value === undefined ? null : urlValue(value)),
    points: (value) => (value === undefined ? null : pointsValue(value)),
    isActive: optionalBoolean("isActive"),
  },
};
