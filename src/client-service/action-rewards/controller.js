import { actionRewardService } from "./service.js";

export const actionRewardController = {
  async listAdmin(req, res) {
    res.json(await actionRewardService.listAdmin(req.auth.accountId));
  },
  async create(req, res) {
    res.status(201).json({ data: await actionRewardService.create(req.auth.accountId, req.body) });
  },
  async update(req, res) {
    res.json({ data: await actionRewardService.update(req.auth.accountId, req.params.id, req.body) });
  },
  async remove(req, res) {
    res.json({ data: await actionRewardService.remove(req.auth.accountId, req.params.id) });
  },
  async listClient(req, res) {
    res.json(await actionRewardService.listClient(req.auth.accountId, req.auth.client));
  },
  async claim(req, res) {
    res.json({ data: await actionRewardService.claim(req.auth.accountId, req.params.id, req.auth.client) });
  },
};
