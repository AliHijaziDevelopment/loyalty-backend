import { CompanyModel } from "../../company-service/companies/model.js";
import { paymentStore } from "../payments/model.js";

function currentMonthRange() {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  return { start, end };
}

export const revenueService = {
  async getTotalRevenue() {
    const total = await paymentStore.totalPaid();
    return { totalRevenue: total };
  },
  async getMonthlyRevenue() {
    const payments = await paymentStore.monthlyPaid();
    const months = payments.map((item) => ({
      year: item._id.year,
      month: item._id.month,
      total: item.total,
    }));

    return { months };
  },
  async getRevenueByCompany() {
    const [paidByCompany, companies] = await Promise.all([
      paymentStore.paidByCompany(),
      CompanyModel.find({ deletedAt: null }).sort({ name: 1 }),
    ]);
    const revenueMap = new Map(paidByCompany.map((item) => [String(item._id), item.total]));

    return {
      companies: companies.map((company) => ({
        companyId: company._id.toString(),
        name: company.name,
        plan: company.plan,
        subscriptionAmount: company.subscriptionAmount || 0,
        totalRevenue: revenueMap.get(company._id.toString()) || 0,
      })),
    };
  },
  async getCurrentMonthlyRevenue() {
    const { start, end } = currentMonthRange();
    return paymentStore.totalPaid({ date: { $gte: start, $lt: end } });
  },
};
