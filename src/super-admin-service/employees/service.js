import { AppError } from "../../shared/errors/app-error.js";
import { employeeStore } from "./model.js";

export const employeeService = {
  async listEmployees(filters) {
    return employeeStore.list(filters);
  },
  async listAllEmployees() {
    return employeeStore.listAll();
  },
  async createEmployee(payload) {
    if (await employeeStore.findByEmail(payload.email)) {
      throw new AppError(409, "Employee email is already in use.");
    }

    return employeeStore.create(payload);
  },
  async updateEmployee(id, payload) {
    const current = await employeeStore.findById(id);

    if (!current) {
      throw new AppError(404, "Employee was not found.");
    }

    if (payload.email && payload.email !== current.email && await employeeStore.findByEmail(payload.email)) {
      throw new AppError(409, "Employee email is already in use.");
    }

    return employeeStore.updateById(id, payload);
  },
};
