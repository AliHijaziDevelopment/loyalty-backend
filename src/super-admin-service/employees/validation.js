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
  return requiredText(label)(value);
};

const email = (label, required = true) => (value) => {
  if (!required && value === undefined) {
    return null;
  }
  if (typeof value !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
    return `${label} must be a valid email.`;
  }
  return null;
};

const percentage = (value) => {
  if (!Number.isFinite(Number(value)) || Number(value) < 0 || Number(value) > 100) {
    return "commissionPercentage must be between 0 and 100.";
  }
  return null;
};

const optionalPercentage = (value) => (value === undefined ? null : percentage(value));

export const employeeIdSchema = {
  params: {
    id: (value) => (typeof value === "string" && value.trim().length >= 10 ? null : "id must be valid."),
  },
};

export const createEmployeeSchema = {
  body: {
    name: requiredText("name"),
    email: email("email"),
    commissionPercentage: percentage,
    isActive: (value) => (value === undefined || typeof value === "boolean" ? null : "isActive must be boolean."),
  },
};

export const updateEmployeeSchema = {
  body: {
    name: optionalText("name"),
    email: email("email", false),
    commissionPercentage: optionalPercentage,
    isActive: (value) => (value === undefined || typeof value === "boolean" ? null : "isActive must be boolean."),
  },
};
