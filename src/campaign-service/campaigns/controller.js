import { campaignService } from "./service.js";

export const campaignController = {
  async list(req, res) {
    res.json({ data: await campaignService.listCampaigns(req.tenant.accountId) });
  },
  async create(req, res) {
    res.status(201).json({ data: await campaignService.createCampaign(req.tenant.accountId, req.body) });
  },
};
