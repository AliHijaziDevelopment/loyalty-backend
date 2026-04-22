const requiredText = (label) => (value) => {
  if (typeof value !== "string" || value.trim().length < 2) {
    return `${label} must be at least 2 characters.`;
  }
  return null;
};

const optionalText = (label) => (value) => {
  if (value === undefined) {
    return null;
  }
  if (typeof value !== "string" || value.trim().length < 2) {
    return `${label} must be at least 2 characters when provided.`;
  }
  return null;
};

const optionalEnum = (label, values) => (value) => {
  if (value === undefined) {
    return null;
  }
  if (!values.includes(value)) {
    return `${label} must be one of: ${values.join(", ")}.`;
  }
  return null;
};

const positiveInteger = (label) => (value) => {
  if (value === undefined) {
    return null;
  }
  if (!Number.isInteger(value) || value < 0) {
    return `${label} must be a non-negative integer.`;
  }
  return null;
};

export const createCompanySchema = {
  body: {
    name: requiredText("name"),
    slug: (value) => {
      if (typeof value !== "string" || !/^[a-z0-9-]{3,30}$/.test(value)) {
        return "slug must use lowercase letters, numbers, or dashes.";
      }
      return null;
    },
    domain: (value) => {
      if (typeof value !== "string" || !/^[a-z0-9.-]+\.[a-z]{2,}$/.test(value.trim())) {
        return "domain must be a valid hostname.";
      }
      return null;
    },
    plan: requiredText("plan"),
    primaryColor: requiredText("primaryColor"),
    locations: positiveInteger("locations"),
  },
};

export const updateCompanySchema = {
  body: {
    name: optionalText("name"),
    slug: (value) => {
      if (value === undefined) {
        return null;
      }
      if (typeof value !== "string" || !/^[a-z0-9-]{3,30}$/.test(value)) {
        return "slug must use lowercase letters, numbers, or dashes.";
      }
      return null;
    },
    domain: (value) => {
      if (value === undefined) {
        return null;
      }
      if (typeof value !== "string" || !/^[a-z0-9.-]+\.[a-z]{2,}$/.test(value.trim())) {
        return "domain must be a valid hostname.";
      }
      return null;
    },
    plan: optionalText("plan"),
    primaryColor: optionalText("primaryColor"),
    status: optionalEnum("status", ["active", "disabled"]),
    locations: positiveInteger("locations"),
  },
};

export const companyIdSchema = {
  params: {
    id: (value) => (typeof value === "string" && value.trim().length >= 10 ? null : "id must be valid."),
  },
};
