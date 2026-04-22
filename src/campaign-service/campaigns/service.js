import { campaignStore } from "./model.js";

export const campaignService = {
  async listCampaigns(accountId) {
    return campaignStore.listByAccount(accountId);
  },
  async createCampaign(accountId, payload) {
    return campaignStore.create(accountId, payload);
  },
};
