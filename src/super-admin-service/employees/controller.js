import { employeeService } from "./service.js";

export const employeeController = {
  async list(req, res) {
    res.json(await employeeService.listEmployees(req.query));
  },
  async create(req, res) {
    res.status(201).json({ data: await employeeService.createEmployee(req.body) });
  },
  async update(req, res) {
    res.json({ data: await employeeService.updateEmployee(req.params.id, req.body) });
  },
};
