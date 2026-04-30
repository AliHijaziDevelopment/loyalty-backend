import { CompanyModel } from "../../company-service/companies/model.js";
import { employeeStore } from "../employees/model.js";
import { paymentStore } from "../payments/model.js";
import { revenueService } from "../revenue/service.js";
import { commissionService } from "../commissions/service.js";

export const superAdminDashboardService = {
  async getDashboard() {
    const [totalCompanies, activeCompanies, trialCompanies, expiredCompanies, totalEmployees, monthlyRevenue, totalRevenueResult, commissions] = await Promise.all([
      CompanyModel.countDocuments({ deletedAt: null }),
      CompanyModel.countDocuments({ deletedAt: null, status: "active" }),
      CompanyModel.countDocuments({ deletedAt: null, status: "trial" }),
      CompanyModel.countDocuments({ deletedAt: null, status: "expired" }),
      employeeStore.list({ isActive: true, limit: 1 }).then((result) => result.pagination.total),
      revenueService.getCurrentMonthlyRevenue(),
      paymentStore.totalPaid(),
      commissionService.listCommissions(),
    ]);

    const employeeTotals = new Map();

    for (const commission of commissions.data) {
      const current = employeeTotals.get(commission.employeeId) || {
        employeeId: commission.employeeId,
        name: commission.employeeName,
        totalCommission: 0,
        companies: 0,
      };
      current.totalCommission += commission.monthlyAmount;
      current.companies += 1;
      employeeTotals.set(commission.employeeId, current);
    }

    return {
      totalCompanies,
      activeCompanies,
      trialCompanies,
      expiredCompanies,
      monthlyRevenue,
      totalRevenue: totalRevenueResult,
      totalEmployees,
      topPerformingEmployees: Array.from(employeeTotals.values())
        .sort((a, b) => b.totalCommission - a.totalCommission)
        .slice(0, 5),
    };
  },
};
