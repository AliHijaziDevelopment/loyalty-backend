import { AppError } from "../../shared/errors/app-error.js";
import { tierSettingsService } from "../../company-service/tier-settings/service.js";
import { serviceStore } from "./model.js";

function applyTierPricing(service, discountPercentage) {
  if (service.price === null || service.price === undefined || !service.discountEnabled || discountPercentage <= 0) {
    return {
      ...service,
      originalPrice: service.price,
      finalPrice: service.price,
      discountPercentage: 0,
      discounted: false,
    };
  }

  const finalPrice = Math.max(0, Number((service.price - (service.price * discountPercentage / 100)).toFixed(2)));

  return {
    ...service,
    originalPrice: service.price,
    finalPrice,
    discountPercentage,
    discounted: finalPrice < service.price,
  };
}

export const serviceCatalogService = {
  async listAdminServices(companyId, filters) {
    return serviceStore.list(companyId, filters);
  },
  async listClientServices(companyId, filters, client = null) {
    const response = await serviceStore.list(companyId, { ...filters, activeOnly: true });
    const discountPercentage = await tierSettingsService.resolveTierDiscount(companyId, client?.tierId);

    return {
      ...response,
      data: response.data.map((service) => applyTierPricing(service, discountPercentage)),
    };
  },
  async createService(companyId, payload, uploadedFile = null) {
    return serviceStore.create(companyId, {
      ...payload,
      ...(uploadedFile ? { image: uploadedFile.publicPath } : {}),
    });
  },
  async updateService(companyId, id, payload, uploadedFile = null) {
    const service = await serviceStore.updateById(companyId, id, {
      ...payload,
      ...(uploadedFile ? { image: uploadedFile.publicPath } : {}),
    });

    if (!service) {
      throw new AppError(404, "Service was not found.");
    }

    return service;
  },
  async deleteService(companyId, id) {
    const service = await serviceStore.softDeleteById(companyId, id);

    if (!service) {
      throw new AppError(404, "Service was not found.");
    }

    return service;
  },
};
