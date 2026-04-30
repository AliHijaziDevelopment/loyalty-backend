import { superAdminDashboardService } from "./service.js";

export const superAdminDashboardController = {
  async get(_req, res) {
    res.json({ data: await superAdminDashboardService.getDashboard() });
  },
};
