import { birthdayRewardService } from "./service.js";

function resolveAccountScope(req) {
  return req.auth.accountId || req.tenant?.accountId || null;
}

export const birthdayController = {
  async send(req, res) {
    res.status(201).json({ data: await birthdayRewardService.sendBirthdayGift(resolveAccountScope(req), req.body) });
  },
  async listAvailable(req, res) {
    res.json({ data: await birthdayRewardService.getAvailableBirthdayRewards(resolveAccountScope(req), req.auth.client.id) });
  },
  async claim(req, res) {
    res.status(201).json({ data: await birthdayRewardService.claimBirthdayReward(resolveAccountScope(req), req.auth.client.id, req.body.rewardId) });
  },
};
