export const rewardClaimIdSchema = {
  params: {
    id: (value) => (typeof value === "string" && value.trim().length >= 10 ? null : "id must be valid."),
  },
};

export const rewardClaimsAdminListSchema = {
  query: {
    status: (value) => (
      value === undefined || ["PENDING", "USED", "ALL"].includes(value)
        ? null
        : "status must be PENDING, USED, or ALL."
    ),
    search: (value) => (
      value === undefined || typeof value === "string"
        ? null
        : "search must be text when provided."
    ),
    dateFrom: (value) => (
      value === undefined || (typeof value === "string" && !Number.isNaN(Date.parse(value)))
        ? null
        : "dateFrom must be a valid date."
    ),
    dateTo: (value) => (
      value === undefined || (typeof value === "string" && !Number.isNaN(Date.parse(value)))
        ? null
        : "dateTo must be a valid date."
    ),
  },
};

export const rewardClaimsListSchema = {
  query: {
    status: (value) => (
      value === undefined || ["PENDING", "USED", "ALL"].includes(value)
        ? null
        : "status must be PENDING, USED, or ALL."
    ),
  },
};

export const rewardClaimScanSchema = {
  body: {
    qrToken: (value) => (typeof value === "string" && value.trim().length >= 16 ? null : "qrToken must be valid."),
  },
};
