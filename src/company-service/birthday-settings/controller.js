import { birthdaySettingsService } from "./service.js";

function resolveAccountScope(req) {
  return req.auth.accountId || req.tenant?.accountId || null;
}

export const birthdaySettingsController = {
  async getCurrent(req, res) {
    res.json({ data: await birthdaySettingsService.getCurrent(resolveAccountScope(req)) });
  },
  async saveCurrent(req, res) {
    res.json({ data: await birthdaySettingsService.saveCurrent(resolveAccountScope(req), req.body) });
  },
};
