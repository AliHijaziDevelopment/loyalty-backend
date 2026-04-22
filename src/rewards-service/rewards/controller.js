import { rewardsService } from "./service.js";

export const rewardsController = {
  async list(req, res) {
    res.json({ data: await rewardsService.listRewards(req.auth.accountId) });
  },
  async create(req, res) {
    res.status(201).json({ data: await rewardsService.createReward(req.auth.accountId, req.body) });
  },
  async update(req, res) {
    res.json({ data: await rewardsService.updateReward(req.auth.accountId, req.params.id, req.body) });
  },
  async remove(req, res) {
    res.json({ data: await rewardsService.deleteReward(req.auth.accountId, req.params.id) });
  },
  async listForClient(req, res) {
    res.json({ data: await rewardsService.listClientRewards(req.auth.accountId) });
  },
  async redeem(req, res) {
    res.json({ data: await rewardsService.redeemReward(req.auth.accountId, req.params.id, req.auth.client) });
  },
};
