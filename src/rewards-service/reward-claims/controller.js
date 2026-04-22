import { rewardClaimsService } from "./service.js";

export const rewardClaimsController = {
  async listForAdmin(req, res) {
    res.json({
      data: await rewardClaimsService.listForAdmin(req.auth.accountId, {
        status: req.query.status || "PENDING",
        search: req.query.search,
        dateFrom: req.query.dateFrom,
        dateTo: req.query.dateTo,
      }),
    });
  },
  async listForClient(req, res) {
    res.json({ data: await rewardClaimsService.listForClient(req.auth.accountId, req.auth.client.id, req.query.status || "PENDING") });
  },
  async getQrToken(req, res) {
    res.json({ data: await rewardClaimsService.getQrTokenForClient(req.auth.accountId, req.auth.client.id, req.params.id) });
  },
  async scan(req, res) {
    res.json({ data: await rewardClaimsService.previewByQrToken(req.auth.accountId, req.body.qrToken) });
  },
  async use(req, res) {
    res.json({ data: await rewardClaimsService.markUsed(req.auth.accountId, req.params.id) });
  },
};
