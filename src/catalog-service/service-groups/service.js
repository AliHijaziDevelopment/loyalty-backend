import { AppError } from "../../shared/errors/app-error.js";
import { serviceGroupStore } from "./model.js";

function normalizePayload(payload) {
  return {
    ...payload,
    ...(payload.name ? { name: payload.name.trim() } : {}),
  };
}

export const serviceGroupService = {
  async listGroups(companyId, filters) {
    return serviceGroupStore.list(companyId, filters);
  },
  async createGroup(companyId, payload) {
    try {
      return await serviceGroupStore.create(companyId, normalizePayload(payload));
    } catch (error) {
      if (error?.code === 11000) {
        throw new AppError(409, "Service group already exists.");
      }

      throw error;
    }
  },
  async updateGroup(companyId, id, payload) {
    try {
      const group = await serviceGroupStore.updateById(companyId, id, normalizePayload(payload));

      if (!group) {
        throw new AppError(404, "Service group was not found.");
      }

      return group;
    } catch (error) {
      if (error?.code === 11000) {
        throw new AppError(409, "Service group already exists.");
      }

      throw error;
    }
  },
  async deleteGroup(companyId, id) {
    const group = await serviceGroupStore.softDeleteById(companyId, id);

    if (!group) {
      throw new AppError(404, "Service group was not found.");
    }

    return group;
  },
};
