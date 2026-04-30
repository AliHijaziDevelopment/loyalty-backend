import mongoose from "mongoose";

const tierSchema = new mongoose.Schema(
  {
    companyId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    discountPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    minVisits: {
      type: Number,
      default: 0,
      min: 0,
      index: true,
    },
    cardColor: {
      type: String,
      default: "#7c3aed",
      trim: true,
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

tierSchema.index({ companyId: 1, name: 1, deletedAt: 1 }, { unique: true });
tierSchema.index({ companyId: 1, isActive: 1 });
tierSchema.index({ companyId: 1, minVisits: 1 });

tierSchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});

export const TierModel = mongoose.models.Tier || mongoose.model("Tier", tierSchema);

const normalizeTier = (document) => {
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

export const tierStore = {
  async list(companyId, filters = {}) {
    const query = { companyId, deletedAt: null };

    if (filters.activeOnly) {
      query.isActive = true;
    }

    if (filters.search) {
      query.name = { $regex: filters.search, $options: "i" };
    }

    const tiers = await TierModel.find(query).sort({ createdAt: -1 });
    return { data: tiers.map(normalizeTier) };
  },
  async findById(companyId, id) {
    return normalizeTier(await TierModel.findOne({ _id: id, companyId, deletedAt: null }));
  },
  async findManyByIds(companyId, ids) {
    if (!ids.length) {
      return [];
    }

    const tiers = await TierModel.find({ _id: { $in: ids }, companyId, deletedAt: null });
    return tiers.map(normalizeTier);
  },
  async create(companyId, payload) {
    const tier = await TierModel.create({
      companyId,
      name: payload.name,
      discountPercentage: payload.discountPercentage ?? 0,
      minVisits: payload.minVisits ?? 0,
      cardColor: payload.cardColor || "#7c3aed",
      isActive: payload.isActive ?? true,
    });

    return tier.toJSON();
  },
  async updateById(companyId, id, payload) {
    return normalizeTier(await TierModel.findOneAndUpdate(
      { _id: id, companyId, deletedAt: null },
      { $set: payload },
      { new: true },
    ));
  },
  async softDeleteById(companyId, id) {
    return normalizeTier(await TierModel.findOneAndUpdate(
      { _id: id, companyId, deletedAt: null },
      { $set: { isActive: false, deletedAt: new Date() } },
      { new: true },
    ));
  },
};
