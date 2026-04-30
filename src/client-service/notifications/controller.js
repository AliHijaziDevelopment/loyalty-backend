import { clientNotificationService } from "./service.js";

export const clientNotificationController = {
  async registerToken(req, res) {
    res.json({
      data: await clientNotificationService.registerToken(req.auth.accountId, req.auth.client, req.body.token),
    });
  },
};
