export const employeeCommissionIdSchema = {
  params: {
    employeeId: (value) => (typeof value === "string" && value.trim().length >= 10 ? null : "employeeId must be valid."),
  },
};
