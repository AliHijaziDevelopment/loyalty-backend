export const registerNotificationTokenSchema = {
  body: {
    token: (value) => {
      if (typeof value !== "string" || value.trim().length < 20) {
        return "token must be a valid FCM registration token.";
      }

      return null;
    },
  },
};
