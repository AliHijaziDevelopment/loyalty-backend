import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
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
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      default: null,
      min: 0,
    },
    image: {
      type: String,
      default: "",
      trim: true,
    },
    group: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    discountEnabled: {
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

serviceSchema.index({ companyId: 1, group: 1, isActive: 1 });
serviceSchema.index({ companyId: 1, name: 1 });

serviceSchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});

export const ServiceModel = mongoose.models.Service || mongoose.model("Service", serviceSchema);

const normalizeService = (document) => {
  if (!document) {
    return null;
  }

  if (typeof document.toJSON === "function") {
    const service = document.toJSON();
    return {
      ...service,
      discountEnabled: service.discountEnabled ?? true,
    };
  }

  return {
    ...document,
    id: document._id.toString(),
    _id: undefined,
    discountEnabled: document.discountEnabled ?? true,
  };
};

function buildServiceQuery(companyId, filters = {}) {
  const query = {
    companyId,
    deletedAt: null,
  };

  if (filters.activeOnly) {
    query.isActive = true;
  }

  if (filters.group) {
    query.group = {
      $regex: `^${String(filters.group).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
      $options: "i",
    };
  }

  if (filters.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: "i" } },
      { description: { $regex: filters.search, $options: "i" } },
      { group: { $regex: filters.search, $options: "i" } },
    ];
  }

  return query;
}

function buildSort(sort) {
  if (sort === "price_asc") {
    return { price: 1, createdAt: -1 };
  }

  if (sort === "price_desc") {
    return { price: -1, createdAt: -1 };
  }

  if (sort === "group") {
    return { group: 1, name: 1 };
  }

  return { createdAt: -1 };
}

export const serviceStore = {
  async list(companyId, filters = {}) {
    const page = Math.max(Number(filters.page || 1), 1);
    const limit = Math.min(Math.max(Number(filters.limit || 50), 1), 100);
    const skip = (page - 1) * limit;
    const query = buildServiceQuery(companyId, filters);
    const [services, total] = await Promise.all([
      ServiceModel.find(query).sort(buildSort(filters.sort)).skip(skip).limit(limit),
      ServiceModel.countDocuments(query),
    ]);

    return {
      data: services.map(normalizeService),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit) || 1,
      },
    };
  },
  async create(companyId, payload) {
    const service = await ServiceModel.create({
      companyId,
      ...payload,
      price: payload.price === "" || payload.price === undefined ? null : payload.price,
      isActive: payload.isActive === undefined ? true : payload.isActive,
      discountEnabled: payload.discountEnabled === undefined ? true : payload.discountEnabled,
    });

    return service.toJSON();
  },
  async updateById(companyId, id, payload) {
    const next = {
      ...payload,
      ...(payload.price === "" ? { price: null } : {}),
    };

    return normalizeService(await ServiceModel.findOneAndUpdate(
      { _id: id, companyId, deletedAt: null },
      { $set: next },
      { new: true },
    ));
  },
  async softDeleteById(companyId, id) {
    return normalizeService(await ServiceModel.findOneAndUpdate(
      { _id: id, companyId, deletedAt: null },
      { $set: { isActive: false, deletedAt: new Date() } },
      { new: true },
    ));
  },
};
