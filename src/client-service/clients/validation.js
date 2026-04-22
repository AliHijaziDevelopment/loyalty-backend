const requiredText = (label) => (value) => {
  if (typeof value !== "string" || value.trim().length < 2) {
    return `${label} must be at least 2 characters.`;
  }
  return null;
};

const requiredPhone = (value) => {
  if (typeof value !== "string" || value.trim().length < 7) {
    return "phone must be at least 7 characters.";
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

const optionalEmail = (value) => {
  if (typeof value !== "string" || !value.trim()) {
    return "email is required.";
  }
  if (typeof value !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
    return "email must be valid.";
  }
  return null;
};

const pointsValue = (value) => {
  if (!Number.isInteger(value) || value <= 0) {
    return "points must be a positive integer.";
  }
  return null;
};

const optionalPassword = (value) => {
  if (value === undefined || value === "") {
    return null;
  }
  if (typeof value !== "string" || value.trim().length < 8) {
    return "password must be at least 8 characters when provided.";
  }
  return null;
};

const optionalAvatarUrl = (value) => {
  if (value === undefined || value === "") {
    return null;
  }

  if (typeof value !== "string") {
    return "avatarUrl must be text when provided.";
  }

  const trimmed = value.trim();

  if (!trimmed.startsWith("data:image/")) {
    return "avatarUrl must be a valid image data URL.";
  }

  if (trimmed.length > 2_000_000) {
    return "avatarUrl image payload is too large.";
  }

  return null;
};

const optionalDate = (label) => (value) => {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  if (typeof value !== "string" || Number.isNaN(Date.parse(value))) {
    return `${label} must be a valid date when provided.`;
  }

  return null;
};

const qrTokenValue = (value) => {
  if (typeof value !== "string" || value.trim().length < 20) {
    return "qrToken must be valid.";
  }
  return null;
};

export const listClientsSchema = {
  query: {
    search: (value) => {
      if (value === undefined || value === "") {
        return null;
      }
      if (typeof value !== "string") {
        return "search must be text when provided.";
      }
      return null;
    },
    includeArchived: (value) => {
      if (value === undefined || value === "") {
        return null;
      }

      return ["true", "false"].includes(value) ? null : "includeArchived must be true or false.";
    },
  },
};

export const createClientSchema = {
  body: {
    firstName: requiredText("firstName"),
    lastName: requiredText("lastName"),
    username: requiredText("username"),
    phone: requiredPhone,
    email: optionalEmail,
    password: optionalPassword,
    dateOfBirth: optionalDate("dateOfBirth"),
  },
};

export const updateClientSchema = {
  body: {
    firstName: optionalText("firstName"),
    lastName: optionalText("lastName"),
    username: optionalText("username"),
    phone: (value) => {
      if (value === undefined) {
        return null;
      }
      return requiredPhone(value);
    },
    email: (value) => {
      if (value === undefined) {
        return null;
      }
      return optionalEmail(value);
    },
    dateOfBirth: optionalDate("dateOfBirth"),
  },
};

export const updateSelfSchema = {
  body: {
    avatarUrl: optionalAvatarUrl,
  },
};

export const changePasswordSchema = {
  body: {
    password: (value) => {
      if (typeof value !== "string" || value.trim().length < 8) {
        return "password must be at least 8 characters.";
      }
      return null;
    },
  },
};

export const scanQrSchema = {
  body: {
    qrToken: qrTokenValue,
  },
};

export const confirmVisitSchema = {
  params: {
    id: (value) => (typeof value === "string" && value.trim().length >= 10 ? null : "id must be valid."),
  },
  body: {
    points: (value) => {
      if (value === undefined) {
        return null;
      }
      if (!Number.isInteger(value) || value < 0) {
        return "points must be a non-negative integer.";
      }
      return null;
    },
    description: (value) => {
      if (value === undefined || value === "") {
        return null;
      }
      if (typeof value !== "string" || value.trim().length < 2) {
        return "description must be at least 2 characters when provided.";
      }
      return null;
    },
  },
};

export const clientIdSchema = {
  params: {
    id: (value) => (typeof value === "string" && value.trim().length >= 10 ? null : "id must be valid."),
  },
};

export const pointsActionSchema = {
  body: {
    points: pointsValue,
    description: requiredText("description"),
  },
};

export const restoreClientSchema = {
  params: {
    id: (value) => (typeof value === "string" && value.trim().length >= 10 ? null : "id must be valid."),
  },
};
