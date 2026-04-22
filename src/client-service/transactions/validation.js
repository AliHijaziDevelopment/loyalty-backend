export const listTransactionsSchema = {
  query: {
    limit: (value) => {
      if (value === undefined || value === "") {
        return null;
      }

      const parsed = Number(value);

      if (!Number.isInteger(parsed) || parsed <= 0 || parsed > 100) {
        return "limit must be an integer between 1 and 100.";
      }

      return null;
    },
    type: (value) => {
      if (value === undefined || value === "") {
        return null;
      }

      return ["earn", "redeem"].includes(value) ? null : "type must be earn or redeem.";
    },
    search: (value) => {
      if (value === undefined || value === "") {
        return null;
      }

      return typeof value === "string" ? null : "search must be text when provided.";
    },
    dateFrom: (value) => {
      if (value === undefined || value === "") {
        return null;
      }

      return /^\d{4}-\d{2}-\d{2}$/.test(value) ? null : "dateFrom must be YYYY-MM-DD.";
    },
    dateTo: (value) => {
      if (value === undefined || value === "") {
        return null;
      }

      return /^\d{4}-\d{2}-\d{2}$/.test(value) ? null : "dateTo must be YYYY-MM-DD.";
    },
    clientId: (value) => {
      if (value === undefined || value === "") {
        return null;
      }

      return typeof value === "string" && value.trim().length >= 10 ? null : "clientId must be valid when provided.";
    },
  },
};
