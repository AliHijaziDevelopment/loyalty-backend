import { tierSettingsService } from "./service.js";

function resolveCompanyScope(req) {
  return req.auth.accountId || req.tenant?.accountId || null;
}

export const tierSettingsController = {
  async list(req, res) {
    res.json(await tierSettingsService.listTiers(resolveCompanyScope(req), req.query));
  },
  async create(req, res) {
    res.status(201).json({ data: await tierSettingsService.createTier(resolveCompanyScope(req), req.body) });
  },
  async update(req, res) {
    res.json({ data: await tierSettingsService.updateTier(resolveCompanyScope(req), req.params.id, req.body) });
  },
  async remove(req, res) {
    res.json({ data: await tierSettingsService.deleteTier(resolveCompanyScope(req), req.params.id) });
  },
};
