import mongoose from "mongoose";

const serviceGroupSchema = new mongoose.Schema(
  {
    companyId: {
      type: String,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
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

serviceGroupSchema.index({ companyId: 1, name: 1, deletedAt: 1 }, { unique: true });
serviceGroupSchema.index({ companyId: 1, isActive: 1 });

serviceGroupSchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});

export const ServiceGroupModel = mongoose.models.ServiceGroup || mongoose.model("ServiceGroup", serviceGroupSchema);

const normalizeGroup = (document) => {
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

export const serviceGroupStore = {
  async list(companyId, filters = {}) {
    const query = { companyId, deletedAt: null };

    if (filters.activeOnly) {
      query.isActive = true;
    }

    if (filters.search) {
      query.name = { $regex: filters.search, $options: "i" };
    }

    const groups = await ServiceGroupModel.find(query).sort({ name: 1 });
    return { data: groups.map(normalizeGroup) };
  },
  async create(companyId, payload) {
    const group = await ServiceGroupModel.create({
      companyId,
      name: payload.name,
      isActive: payload.isActive ?? true,
    });

    return group.toJSON();
  },
  async updateById(companyId, id, payload) {
    return normalizeGroup(await ServiceGroupModel.findOneAndUpdate(
      { _id: id, companyId, deletedAt: null },
      { $set: payload },
      { new: true },
    ));
  },
  async softDeleteById(companyId, id) {
    return normalizeGroup(await ServiceGroupModel.findOneAndUpdate(
      { _id: id, companyId, deletedAt: null },
      { $set: { isActive: false, deletedAt: new Date() } },
      { new: true },
    ));
  },
};
