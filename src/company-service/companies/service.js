import { AppError } from "../../shared/errors/app-error.js";
import { companyStore } from "./model.js";

function normalizeCompanyPayload(payload) {
  const next = { ...payload };

  if (next.referredBy === "") {
    next.referredBy = null;
  }

  if (next.subscriptionAmount !== undefined) {
    next.subscriptionAmount = Number(next.subscriptionAmount);
  }

  if (next.notificationRewardPoints !== undefined) {
    next.notificationRewardPoints = Number(next.notificationRewardPoints);
  }

  if (next.status === "trial" && !next.trialEndsAt) {
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 14);
    next.trialEndsAt = trialEndsAt;
  }

  return next;
}

export const companyService = {
  async listCompanies(filters = {}) {
    return companyStore.list(filters);
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

    return companyStore.create(normalizeCompanyPayload(payload));
  },
  async getTenantCompany(accountId) {
    const company = await companyStore.findByAccountId(accountId);

    if (!company) {
      throw new AppError(404, "Company account was not found.");
    }

    return company;
  },
  async updateTenantCompany(accountId, payload) {
    const company = await companyStore.updateByAccountId(accountId, normalizeCompanyPayload(payload));

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

    return companyStore.updateById(id, normalizeCompanyPayload(payload));
  },
  async deleteCompanyById(id) {
    const company = await companyStore.softDeleteById(id);

    if (!company) {
      throw new AppError(404, "Company account was not found.");
    }

    return company;
  },
};
