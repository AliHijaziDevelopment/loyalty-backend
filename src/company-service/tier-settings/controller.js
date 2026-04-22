import { tierSettingsService } from "./service.js";

function resolveAccountScope(req) {
  return req.auth.accountId || req.tenant?.accountId || null;
}

export const tierSettingsController = {
  async getCurrent(req, res) {
    res.json({ data: await tierSettingsService.getTierSettings(resolveAccountScope(req)) });
  },
  async saveCurrent(req, res) {
    res.json({ data: await tierSettingsService.saveTierSettings(resolveAccountScope(req), req.body) });
  },
};
