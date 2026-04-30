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

const optionalPrice = (value) => {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  if (!Number.isFinite(Number(value)) || Number(value) < 0) {
    return "price must be a non-negative number when provided.";
  }

  return null;
};

const optionalBoolean = (label) => (value) => {
  if (value === undefined || typeof value === "boolean" || value === "true" || value === "false") {
    return null;
  }
  return `${label} must be boolean.`;
};

export const serviceIdSchema = {
  params: {
    id: (value) => (typeof value === "string" && value.trim().length >= 10 ? null : "id must be valid."),
  },
};

export const createServiceSchema = {
  body: {
    name: requiredText("name"),
    description: requiredText("description"),
    group: (value) => (value === undefined || typeof value === "string" ? null : "group must be text."),
    price: optionalPrice,
    image: (value) => (value === undefined || typeof value === "string" ? null : "image must be text."),
    isActive: optionalBoolean("isActive"),
    discountEnabled: optionalBoolean("discountEnabled"),
  },
};

export const updateServiceSchema = {
  body: {
    name: optionalText("name"),
    description: optionalText("description"),
    group: (value) => (value === undefined || typeof value === "string" ? null : "group must be text."),
    price: optionalPrice,
    image: (value) => (value === undefined || typeof value === "string" ? null : "image must be text."),
    isActive: optionalBoolean("isActive"),
    discountEnabled: optionalBoolean("discountEnabled"),
  },
};
