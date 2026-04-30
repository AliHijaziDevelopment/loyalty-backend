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

export const serviceGroupIdSchema = {
  params: {
    id: (value) => (typeof value === "string" && value.trim().length >= 10 ? null : "id must be valid."),
  },
};

export const createServiceGroupSchema = {
  body: {
    name: requiredText("name"),
    isActive: optionalBoolean("isActive"),
  },
};

export const updateServiceGroupSchema = {
  body: {
    name: optionalText("name"),
    isActive: optionalBoolean("isActive"),
  },
};
