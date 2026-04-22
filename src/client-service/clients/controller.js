import { clientService } from "./service.js";

function resolveAccountScope(req) {
  return req.auth.accountId || req.tenant?.accountId || null;
}

export const clientController = {
  async getSelf(req, res) {
    res.json({ data: await clientService.getSelf(resolveAccountScope(req), req.auth.sub) });
  },
  async getSelfQrToken(req, res) {
    res.json({ data: await clientService.getSelfQrToken(resolveAccountScope(req), req.auth.sub) });
  },
  async updateSelf(req, res) {
    res.json({ data: await clientService.updateSelf(resolveAccountScope(req), req.auth.sub, req.body) });
  },
  async changeSelfPassword(req, res) {
    res.json({ data: await clientService.changeSelfPassword(resolveAccountScope(req), req.auth.sub, req.body.password) });
  },
  async getById(req, res) {
    res.json({ data: await clientService.getClientById(resolveAccountScope(req), req.params.id) });
  },
  async list(req, res) {
    res.json({
      data: await clientService.listClients(
        resolveAccountScope(req),
        req.query.search,
        req.query.includeArchived === "true",
      ),
    });
  },
  async scan(req, res) {
    res.json({ data: await clientService.previewClientByQrToken(resolveAccountScope(req), req.body.qrToken) });
  },
  async create(req, res) {
    res.status(201).json({ data: await clientService.createClient(resolveAccountScope(req), req.body) });
  },
  async update(req, res) {
    res.json({ data: await clientService.updateClient(resolveAccountScope(req), req.params.id, req.body) });
  },
  async remove(req, res) {
    res.json({ data: await clientService.deleteClient(resolveAccountScope(req), req.params.id) });
  },
  async restore(req, res) {
    res.json({ data: await clientService.restoreClient(resolveAccountScope(req), req.params.id) });
  },
  async addPoints(req, res) {
    res.json({ data: await clientService.addPoints(resolveAccountScope(req), req.params.id, req.body) });
  },
  async confirmVisit(req, res) {
    res.json({ data: await clientService.confirmVisit(resolveAccountScope(req), req.params.id, req.body) });
  },
  async redeemPoints(req, res) {
    res.json({ data: await clientService.redeemPoints(resolveAccountScope(req), req.params.id, req.body) });
  },
  async stats(req, res) {
    res.json({ data: await clientService.getClientStats(resolveAccountScope(req)) });
  },
};
