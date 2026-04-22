import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    accountId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    clientId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    clientName: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["earn", "redeem"],
      trim: true,
    },
    points: {
      type: Number,
      required: true,
      min: 1,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

transactionSchema.index({ accountId: 1, createdAt: -1 });

transactionSchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});

export const TransactionModel = mongoose.models.Transaction || mongoose.model("Transaction", transactionSchema);

const normalizeTransaction = (document) => {
  if (!document) {
    return null;
  }

  if (typeof document.toJSON === "function") {
    return document.toJSON();
  }

  return {
    ...document,
    id: document._id.toString(),
    _id: undefined,
  };
};

export const transactionStore = {
  async create(payload) {
    const transaction = await TransactionModel.create(payload);
    return transaction.toJSON();
  },
  async listByAccountId(accountId, options = {}) {
    const filter = { accountId };

    if (options.clientId) {
      filter.clientId = options.clientId;
    }

    if (options.type) {
      filter.type = options.type;
    }

    if (options.search) {
      filter.$or = [
        { clientName: { $regex: options.search, $options: "i" } },
        { description: { $regex: options.search, $options: "i" } },
      ];
    }

    if (options.dateFrom || options.dateTo) {
      filter.createdAt = {};
      if (options.dateFrom) {
        filter.createdAt.$gte = new Date(options.dateFrom);
      }
      if (options.dateTo) {
        filter.createdAt.$lte = new Date(`${options.dateTo}T23:59:59.999Z`);
      }
    }

    const transactions = await TransactionModel.find(filter).sort({ createdAt: -1 }).limit(options.limit || 50);
    return transactions.map(normalizeTransaction);
  },
  async listByClientId(accountId, clientId, options = {}) {
    const transactions = await TransactionModel.find({
      accountId,
      clientId,
      ...(options.type ? { type: options.type } : {}),
      ...(options.search ? { description: { $regex: options.search, $options: "i" } } : {}),
    }).sort({ createdAt: -1 }).limit(options.limit || 50);
    return transactions.map(normalizeTransaction);
  },
  async deleteByClientId(accountId, clientId) {
    await TransactionModel.deleteMany({ accountId, clientId });
  },
  async aggregateAccountMetrics(accountId) {
    const [stats] = await TransactionModel.aggregate([
      { $match: { accountId } },
      {
        $group: {
          _id: null,
          totalPointsIssued: {
            $sum: {
              $cond: [{ $eq: ["$type", "earn"] }, "$points", 0],
            },
          },
          totalRedemptions: {
            $sum: {
              $cond: [{ $eq: ["$type", "redeem"] }, 1, 0],
            },
          },
        },
      },
    ]);

    return {
      totalPointsIssued: stats?.totalPointsIssued || 0,
      totalRedemptions: stats?.totalRedemptions || 0,
    };
  },
};
