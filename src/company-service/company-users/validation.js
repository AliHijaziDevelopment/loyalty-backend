const requiredText = (label) => (value) => {
  if (typeof value !== "string" || value.trim().length < 2) {
    return `${label} must be at least 2 characters.`;
  }
  return null;
};

export const createCompanyUserSchema = {
  body: {
    accountId: requiredText("accountId"),
    username: requiredText("username"),
    firstName: requiredText("firstName"),
    lastName: requiredText("lastName"),
    email: (value) => (typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? null : "email must be valid."),
    password: (value) => (typeof value === "string" && value.length >= 8 ? null : "password must be at least 8 characters."),
    role: (value) => (["admin", "staff"].includes(value) ? null : "role must be admin or staff."),
  },
};

export const listCompanyUsersSchema = {
  query: {
    accountId: (value) => {
      if (value === undefined) {
        return null;
      }
      return requiredText("accountId")(value);
    },
  },
};
