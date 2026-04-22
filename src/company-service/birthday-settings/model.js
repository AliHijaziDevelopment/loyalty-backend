import mongoose from "mongoose";

const birthdaySettingsSchema = new mongoose.Schema(
  {
    accountId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    enabled: {
      type: Boolean,
      default: false,
    },
    rewards: {
      type: [String],
      default: [],
    },
    message: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

birthdaySettingsSchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});

export const BirthdaySettingsModel = mongoose.models.BirthdaySettings || mongoose.model("BirthdaySettings", birthdaySettingsSchema);

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

export const defaultBirthdaySettings = {
  accountId: "",
  enabled: false,
  rewards: [],
  message: "",
};

export const birthdaySettingsStore = {
  async findByAccountId(accountId) {
    return normalize(await BirthdaySettingsModel.findOne({ accountId }));
  },
  async listEnabled() {
    const items = await BirthdaySettingsModel.find({ enabled: true, rewards: { $exists: true, $ne: [] } });
    return items.map(normalize);
  },
  async upsert(accountId, payload) {
    return normalize(await BirthdaySettingsModel.findOneAndUpdate(
      { accountId },
      { $set: payload },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    ));
  },
};
