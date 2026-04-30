import { revenueService } from "./service.js";

export const revenueController = {
  async total(_req, res) {
    res.json({ data: await revenueService.getTotalRevenue() });
  },
  async monthly(_req, res) {
    res.json({ data: await revenueService.getMonthlyRevenue() });
  },
  async byCompany(_req, res) {
    res.json({ data: await revenueService.getRevenueByCompany() });
  },
};
