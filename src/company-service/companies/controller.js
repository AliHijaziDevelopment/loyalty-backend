import { companyService } from "./service.js";

function resolveAccountScope(req) {
  return req.auth.accountId || req.tenant?.accountId || null;
}

export const companyController = {
  async list(req, res) {
    const result = await companyService.listCompanies(req.query);
    res.json(result);
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
  async deleteById(req, res) {
    res.json({ data: await companyService.deleteCompanyById(req.params.id) });
  },
};
