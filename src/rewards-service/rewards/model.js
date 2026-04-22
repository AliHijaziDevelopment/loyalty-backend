import mongoose from "mongoose";

const rewardSchema = new mongoose.Schema(
  {
    accountId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    pointsRequired: {
      type: Number,
      required: true,
      min: 1,
    },
    active: {
      type: Boolean,
      default: true,
    },
    isBirthdayReward: {
      type: Boolean,
      default: false,
    },
    birthdayAutoEnabled: {
      type: Boolean,
      default: false,
    },
    redemptionCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

rewardSchema.index({ accountId: 1, title: 1 });

rewardSchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});

export const RewardModel = mongoose.models.Reward || mongoose.model("Reward", rewardSchema);

const normalizeReward = (document) => {
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

export const rewardsStore = {
  async listByAccount(accountId, { activeOnly = false } = {}) {
    const rewards = await RewardModel.find({
      accountId,
      ...(activeOnly ? { active: true } : {}),
    }).sort({ createdAt: -1 });

    return rewards.map(normalizeReward);
  },
  async create(accountId, payload) {
    const reward = await RewardModel.create({
      accountId,
      redemptionCount: 0,
      ...payload,
    });

    return reward.toJSON();
  },
  async findById(accountId, id) {
    return normalizeReward(await RewardModel.findOne({ _id: id, accountId }));
  },
  async updateById(accountId, id, payload) {
    return normalizeReward(await RewardModel.findOneAndUpdate(
      { _id: id, accountId },
      { $set: payload },
      { new: true },
    ));
  },
  async deleteById(accountId, id) {
    return normalizeReward(await RewardModel.findOneAndDelete({ _id: id, accountId }));
  },
  async incrementRedemptionCount(accountId, id) {
    return normalizeReward(await RewardModel.findOneAndUpdate(
      { _id: id, accountId },
      { $inc: { redemptionCount: 1 } },
      { new: true },
    ));
  },
};
