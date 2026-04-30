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

const optionalNumber = (label) => (value) => {
  if (value === undefined || value === null || value === "") {
    return null;
  }
  if (!Number.isFinite(Number(value)) || Number(value) < 0) {
    return `${label} must be a non-negative number.`;
  }
  return null;
};

const optionalEmail = (label) => (value) => {
  if (value === undefined || value === "") {
    return null;
  }
  if (typeof value !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
    return `${label} must be a valid email.`;
  }
  return null;
};

const optionalReference = (label) => (value) => {
  if (value === undefined || value === "") {
    return null;
  }
  if (typeof value !== "string" || value.trim().length < 10) {
    return `${label} must be valid.`;
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
      if (typeof value !== "string" || !/^[a-z0-9-]+(\.[a-z0-9.-]+)?$/.test(value.trim())) {
        return "domain must be a valid subdomain or hostname.";
      }
      return null;
    },
    plan: requiredText("plan"),
    primaryColor: requiredText("primaryColor"),
    locations: positiveInteger("locations"),
    ownerName: optionalText("ownerName"),
    ownerEmail: optionalEmail("ownerEmail"),
    subscriptionAmount: optionalNumber("subscriptionAmount"),
    notificationRewardPoints: positiveInteger("notificationRewardPoints"),
    status: optionalEnum("status", ["active", "trial", "suspended", "expired", "disabled"]),
    referredBy: optionalReference("referredBy"),
    notes: (value) => (value === undefined || typeof value === "string" ? null : "notes must be text."),
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
      if (typeof value !== "string" || !/^[a-z0-9-]+(\.[a-z0-9.-]+)?$/.test(value.trim())) {
        return "domain must be a valid subdomain or hostname.";
      }
      return null;
    },
    plan: optionalText("plan"),
    primaryColor: optionalText("primaryColor"),
    status: optionalEnum("status", ["active", "trial", "suspended", "expired", "disabled"]),
    locations: positiveInteger("locations"),
    ownerName: optionalText("ownerName"),
    ownerEmail: optionalEmail("ownerEmail"),
    subscriptionAmount: optionalNumber("subscriptionAmount"),
    notificationRewardPoints: positiveInteger("notificationRewardPoints"),
    referredBy: optionalReference("referredBy"),
    notes: (value) => (value === undefined || typeof value === "string" ? null : "notes must be text."),
  },
};

export const companyIdSchema = {
  params: {
    id: (value) => (typeof value === "string" && value.trim().length >= 10 ? null : "id must be valid."),
  },
};
