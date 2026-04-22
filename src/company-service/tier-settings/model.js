import mongoose from "mongoose";

const tierThresholdSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      enum: ["Silver", "Gold", "VIP"],
      trim: true,
    },
    minVisits: {
      type: Number,
      required: true,
      min: 0,
    },
    minRedemptions: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    _id: false,
  },
);

const tierSettingsSchema = new mongoose.Schema(
  {
    accountId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    tiers: {
      type: [tierThresholdSchema],
      required: true,
      default: [
        { name: "Silver", minVisits: 0, minRedemptions: 0 },
        { name: "Gold", minVisits: 5, minRedemptions: 1 },
        { name: "VIP", minVisits: 10, minRedemptions: 3 },
      ],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

tierSettingsSchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});

export const TierSettingsModel = mongoose.models.TierSettings || mongoose.model("TierSettings", tierSettingsSchema);

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

export const defaultTierSettings = {
  accountId: "",
  tiers: [
    { name: "Silver", minVisits: 0, minRedemptions: 0 },
    { name: "Gold", minVisits: 5, minRedemptions: 1 },
    { name: "VIP", minVisits: 10, minRedemptions: 3 },
  ],
};

export const tierSettingsStore = {
  async findByAccountId(accountId) {
    return normalize(await TierSettingsModel.findOne({ accountId }));
  },
  async upsert(accountId, payload) {
    return normalize(await TierSettingsModel.findOneAndUpdate(
      { accountId },
      { $set: { tiers: payload.tiers } },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    ));
  },
};
