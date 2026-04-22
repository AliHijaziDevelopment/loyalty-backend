import mongoose from "mongoose";

const campaignSchema = new mongoose.Schema(
  {
    accountId: {
      type: String,
      required: true,
      index: true,
    },
    campaignCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      default: "draft",
      trim: true,
    },
    audience: {
      type: String,
      required: true,
      trim: true,
    },
    conversionRate: {
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

campaignSchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});

export const CampaignModel = mongoose.models.Campaign || mongoose.model("Campaign", campaignSchema);

export const campaignStore = {
  async listByAccount(accountId) {
    return CampaignModel.find({ accountId }).sort({ createdAt: -1 }).lean();
  },
  async create(accountId, payload) {
    const campaign = await CampaignModel.create({
      accountId,
      campaignCode: `cmp_${crypto.randomUUID().slice(0, 8)}`,
      status: "draft",
      conversionRate: 0,
      ...payload,
    });

    return campaign.toJSON();
  },
};
