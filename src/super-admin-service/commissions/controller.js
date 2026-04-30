import { commissionService } from "./service.js";

export const commissionController = {
  async list(_req, res) {
    res.json(await commissionService.listCommissions());
  },
  async byEmployee(req, res) {
    res.json(await commissionService.listCommissionsByEmployee(req.params.employeeId));
  },
};
