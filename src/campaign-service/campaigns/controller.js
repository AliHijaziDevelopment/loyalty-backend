import { campaignService } from "./service.js";

function resolveAccountScope(req) {
  return req.auth.accountId || req.tenant?.accountId || null;
}

export const campaignController = {
  async list(req, res) {
    res.json({ data: await campaignService.listCampaigns(resolveAccountScope(req)) });
  },
  async create(req, res) {
    res.status(201).json({ data: await campaignService.createCampaign(resolveAccountScope(req), req.body) });
  },
};
