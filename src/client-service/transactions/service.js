import { transactionStore } from "./model.js";

export const transactionService = {
  async createTransaction(accountId, payload) {
    return transactionStore.create({
      accountId,
      ...payload,
    });
  },
  async listTransactions(accountId, options) {
    return transactionStore.listByAccountId(accountId, options);
  },
  async listClientTransactions(accountId, clientId, options) {
    return transactionStore.listByClientId(accountId, clientId, options);
  },
  async deleteClientTransactions(accountId, clientId) {
    await transactionStore.deleteByClientId(accountId, clientId);
  },
  async getAccountMetrics(accountId) {
    return transactionStore.aggregateAccountMetrics(accountId);
  },
};
