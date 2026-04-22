import { AppError } from "../../shared/errors/app-error.js";
import { companyStore } from "./model.js";

export const companyService = {
  async listCompanies() {
    return companyStore.list();
  },
  async getCompanyById(id) {
    const company = await companyStore.findById(id);

    if (!company) {
      throw new AppError(404, "Company account was not found.");
    }

    return company;
  },
  async createCompany(payload) {
    if (await companyStore.findBySlug(payload.slug)) {
      throw new AppError(409, "Company slug is already in use.");
    }

    if (await companyStore.findByDomain(payload.domain)) {
      throw new AppError(409, "Company domain is already in use.");
    }

    return companyStore.create(payload);
  },
  async getTenantCompany(accountId) {
    const company = await companyStore.findByAccountId(accountId);

    if (!company) {
      throw new AppError(404, "Company account was not found.");
    }

    return company;
  },
  async updateTenantCompany(accountId, payload) {
    const company = await companyStore.updateByAccountId(accountId, payload);

    if (!company) {
      throw new AppError(404, "Company account was not found.");
    }

    return company;
  },
  async updateCompanyById(id, payload) {
    const current = await companyStore.findById(id);

    if (!current) {
      throw new AppError(404, "Company account was not found.");
    }

    if (payload.slug && payload.slug !== current.slug && await companyStore.findBySlug(payload.slug)) {
      throw new AppError(409, "Company slug is already in use.");
    }

    if (payload.domain && payload.domain !== current.domain && await companyStore.findByDomain(payload.domain)) {
      throw new AppError(409, "Company domain is already in use.");
    }

    return companyStore.updateById(id, payload);
  },
};
