import { serviceCatalogService } from "./service.js";

export const serviceCatalogController = {
  async listAdmin(req, res) {
    res.json(await serviceCatalogService.listAdminServices(req.auth.accountId, req.query));
  },
  async create(req, res) {
    res.status(201).json({ data: await serviceCatalogService.createService(req.auth.accountId, req.body, req.uploadedFile) });
  },
  async update(req, res) {
    res.json({ data: await serviceCatalogService.updateService(req.auth.accountId, req.params.id, req.body, req.uploadedFile) });
  },
  async remove(req, res) {
    res.json({ data: await serviceCatalogService.deleteService(req.auth.accountId, req.params.id) });
  },
  async listClient(req, res) {
    res.json(await serviceCatalogService.listClientServices(req.auth.accountId, req.query, req.auth.client));
  },
};
