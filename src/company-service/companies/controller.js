import { companyService } from "./service.js";

function resolveAccountScope(req) {
  return req.auth.accountId || req.tenant?.accountId || null;
}

export const companyController = {
  async list(_req, res) {
    res.json({ data: await companyService.listCompanies() });
  },
  async getById(req, res) {
    res.json({ data: await companyService.getCompanyById(req.params.id) });
  },
  async create(req, res) {
    res.status(201).json({ data: await companyService.createCompany(req.body) });
  },
  async getCurrent(req, res) {
    res.json({ data: await companyService.getTenantCompany(resolveAccountScope(req)) });
  },
  async updateCurrent(req, res) {
    res.json({ data: await companyService.updateTenantCompany(resolveAccountScope(req), req.body) });
  },
  async updateById(req, res) {
    res.json({ data: await companyService.updateCompanyById(req.params.id, req.body) });
  },
};
