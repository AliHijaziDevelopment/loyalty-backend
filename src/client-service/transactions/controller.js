import { transactionService } from "./service.js";

export const transactionController = {
  async list(req, res) {
    res.json({
      data: await transactionService.listTransactions(req.auth.accountId, {
        limit: req.query.limit ? Number(req.query.limit) : undefined,
        type: req.query.type,
        search: req.query.search,
        dateFrom: req.query.dateFrom,
        dateTo: req.query.dateTo,
        clientId: req.query.clientId,
      }),
    });
  },
  async listForClient(req, res) {
    res.json({
      data: await transactionService.listClientTransactions(req.auth.accountId, req.auth.client.id, {
        limit: req.query.limit ? Number(req.query.limit) : undefined,
        type: req.query.type,
        search: req.query.search,
      }),
    });
  },
};
