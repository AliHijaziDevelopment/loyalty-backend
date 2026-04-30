import mongoose from "mongoose";

const actionRewardSchema = new mongoose.Schema(
  {
    companyId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    link: {
      type: String,
      required: true,
      trim: true,
    },
    points: {
      type: Number,
      required: true,
      min: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const userActionClaimSchema = new mongoose.Schema(
  {
    companyId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    actionRewardId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    claimedAt: {
      type: Date,
      default: () => new Date(),
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

actionRewardSchema.index({ companyId: 1, isActive: 1, createdAt: -1 });
userActionClaimSchema.index({ companyId: 1, userId: 1, actionRewardId: 1 }, { unique: true });

actionRewardSchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});

userActionClaimSchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});

export const ActionRewardModel = mongoose.models.ActionReward || mongoose.model("ActionReward", actionRewardSchema);
export const UserActionClaimModel = mongoose.models.UserActionClaim || mongoose.model("UserActionClaim", userActionClaimSchema);

const normalize = (document) => {
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

export const actionRewardStore = {
  async list(companyId, filters = {}) {
    const query = { companyId, deletedAt: null };

    if (filters.activeOnly) {
      query.isActive = true;
    }

    const actions = await ActionRewardModel.find(query).sort({ createdAt: -1 });
    return actions.map(normalize);
  },
  async findById(companyId, id) {
    return normalize(await ActionRewardModel.findOne({ _id: id, companyId, deletedAt: null }));
  },
  async create(companyId, payload) {
    const action = await ActionRewardModel.create({ companyId, ...payload });
    return action.toJSON();
  },
  async updateById(companyId, id, payload) {
    return normalize(await ActionRewardModel.findOneAndUpdate(
      { _id: id, companyId, deletedAt: null },
      { $set: payload },
      { new: true },
    ));
  },
  async softDeleteById(companyId, id) {
    return normalize(await ActionRewardModel.findOneAndUpdate(
      { _id: id, companyId, deletedAt: null },
      { $set: { isActive: false, deletedAt: new Date() } },
      { new: true },
    ));
  },
  async listClaimedIds(companyId, userId) {
    const claims = await UserActionClaimModel.find({ companyId, userId }).select("actionRewardId");
    return new Set(claims.map((claim) => claim.actionRewardId));
  },
  async findClaim(companyId, userId, actionRewardId) {
    return normalize(await UserActionClaimModel.findOne({ companyId, userId, actionRewardId }));
  },
  async createClaim(companyId, userId, actionRewardId) {
    const claim = await UserActionClaimModel.create({ companyId, userId, actionRewardId });
    return claim.toJSON();
  },
};
