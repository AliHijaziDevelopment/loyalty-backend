import crypto from "crypto";
import mongoose from "mongoose";

const rewardClaimSchema = new mongoose.Schema(
  {
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
    clientPhone: {
      type: String,
      required: true,
      trim: true,
    },
    accountId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    rewardId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    rewardTitle: {
      type: String,
      required: true,
      trim: true,
    },
    pointsUsed: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      required: true,
      enum: ["PENDING", "USED"],
      default: "PENDING",
      index: true,
    },
    source: {
      type: String,
      required: true,
      enum: ["STANDARD", "BIRTHDAY"],
      default: "STANDARD",
      index: true,
    },
    message: {
      type: String,
      trim: true,
      default: "",
    },
    birthdayYear: {
      type: Number,
      default: null,
    },
    qrSecret: {
      type: String,
      required: true,
      unique: true,
      index: true,
      default: () => crypto.randomBytes(16).toString("hex"),
    },
    usedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

rewardClaimSchema.index({ accountId: 1, clientId: 1, status: 1, createdAt: -1 });
rewardClaimSchema.index({ accountId: 1, rewardId: 1, createdAt: -1 });
rewardClaimSchema.index({ accountId: 1, clientId: 1, rewardId: 1, source: 1, birthdayYear: 1 });

rewardClaimSchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.qrSecret;
    return ret;
  },
});

export const RewardClaimModel = mongoose.models.RewardClaim || mongoose.model("RewardClaim", rewardClaimSchema);

function normalizeRewardClaim(document, options = {}) {
  if (!document) {
    return null;
  }

  if (typeof document.toJSON === "function") {
    const json = document.toJSON();

    if (options.includeQrSecret) {
      json.qrSecret = document.qrSecret;
    }

    return json;
  }

  const normalized = {
    ...document,
    id: document._id.toString(),
    _id: undefined,
  };

  if (!options.includeQrSecret) {
    delete normalized.qrSecret;
  }

  return normalized;
}

export const rewardClaimsStore = {
  async create(payload) {
    const claim = await RewardClaimModel.create(payload);
    return claim.toJSON();
  },
  async listByClient(accountId, clientId, status = "PENDING") {
    const filter = { accountId, clientId };

    if (status && status !== "ALL") {
      filter.status = status;
    }

    const claims = await RewardClaimModel.find(filter).sort({ createdAt: -1 });
    return claims.map((claim) => normalizeRewardClaim(claim));
  },
  async findById(accountId, id) {
    return normalizeRewardClaim(await RewardClaimModel.findOne({ _id: id, accountId }));
  },
  async findByIdWithSecret(accountId, id) {
    return normalizeRewardClaim(await RewardClaimModel.findOne({ _id: id, accountId }), { includeQrSecret: true });
  },
  async markUsed(accountId, id, usedAt = new Date()) {
    return normalizeRewardClaim(await RewardClaimModel.findOneAndUpdate(
      { _id: id, accountId },
      { $set: { status: "USED", usedAt } },
      { new: true },
    ));
  },
  async findBirthdayClaim(accountId, clientId, rewardId, year) {
    return normalizeRewardClaim(await RewardClaimModel.findOne({
      accountId,
      clientId,
      rewardId,
      source: "BIRTHDAY",
      birthdayYear: year,
    }));
  },
  async listByAccount(accountId, options = {}) {
    const filter = { accountId };

    if (options.status && options.status !== "ALL") {
      filter.status = options.status;
    }

    if (options.search) {
      filter.$or = [
        { clientName: { $regex: options.search, $options: "i" } },
        { clientPhone: { $regex: options.search, $options: "i" } },
        { rewardTitle: { $regex: options.search, $options: "i" } },
      ];
    }

    if (options.dateFrom || options.dateTo) {
      filter.createdAt = {};
      if (options.dateFrom) {
        filter.createdAt.$gte = new Date(`${options.dateFrom}T00:00:00.000Z`);
      }
      if (options.dateTo) {
        filter.createdAt.$lte = new Date(`${options.dateTo}T23:59:59.999Z`);
      }
    }

    const claims = await RewardClaimModel.find(filter).sort({ createdAt: -1 }).limit(options.limit || 100);
    return claims.map((claim) => normalizeRewardClaim(claim));
  },
};
