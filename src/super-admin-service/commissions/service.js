import { CompanyModel } from "../../company-service/companies/model.js";
import { AppError } from "../../shared/errors/app-error.js";
import { employeeStore } from "../employees/model.js";
import { CommissionModel } from "./model.js";

function getCommissionAmount(company, employee) {
  return Math.round((Number(company.subscriptionAmount || 0) * Number(employee.commissionPercentage || 0)) / 100);
}

async function generateCurrentCommissions(employeeId = null) {
  const employees = employeeId ? [await employeeStore.findById(employeeId)] : await employeeStore.listAll();
  const activeEmployees = employees.filter(Boolean).filter((employee) => employee.isActive);
  const employeeMap = new Map(activeEmployees.map((employee) => [employee.id, employee]));

  const companies = await CompanyModel.find({
    deletedAt: null,
    referredBy: { $in: activeEmployees.map((employee) => employee.id) },
    status: { $in: ["active", "trial"] },
  }).sort({ createdAt: -1 });

  const generatedAt = new Date();
  const commissions = [];

  for (const company of companies) {
    const employee = employeeMap.get(company.referredBy?.toString());

    if (!employee) {
      continue;
    }

    commissions.push({
      id: `${employee.id}:${company._id.toString()}`,
      employeeId: employee.id,
      employeeName: employee.name,
      companyId: company._id.toString(),
      companyName: company.name,
      monthlyAmount: getCommissionAmount(company, employee),
      percentage: employee.commissionPercentage,
      generatedAt: generatedAt.toISOString(),
    });
  }

  return commissions;
}

export const commissionService = {
  async listCommissions() {
    return { data: await generateCurrentCommissions() };
  },
  async listCommissionsByEmployee(employeeId) {
    const employee = await employeeStore.findById(employeeId);

    if (!employee) {
      throw new AppError(404, "Employee was not found.");
    }

    return { data: await generateCurrentCommissions(employeeId) };
  },
  async storeSnapshot(employeeId, companyId, monthlyAmount, percentage) {
    return CommissionModel.create({ employeeId, companyId, monthlyAmount, percentage });
  },
};
