import { companyUserService } from "./service.js";

export const companyUserController = {
  async create(req, res) {
    res.status(201).json({ data: await companyUserService.createAssignment(req.body) });
  },
  async list(req, res) {
    res.json({ data: await companyUserService.listAssignments(req.query.accountId) });
  },
};
