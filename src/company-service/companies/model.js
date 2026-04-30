import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
  {
    accountId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    domain: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    status: {
      type: String,
      required: true,
      default: "active",
      trim: true,
      enum: ["active", "trial", "suspended", "expired", "disabled"],
    },
    plan: {
      type: String,
      required: true,
      trim: true,
    },
    primaryColor: {
      type: String,
      required: true,
      trim: true,
    },
    locations: {
      type: Number,
      default: 0,
      min: 0,
    },
    members: {
      type: Number,
      default: 0,
      min: 0,
    },
    rewardLiabilityCents: {
      type: Number,
      default: 0,
      min: 0,
    },
    notificationRewardPoints: {
      type: Number,
      default: 0,
      min: 0,
    },
    ownerName: {
      type: String,
      default: "",
      trim: true,
    },
    ownerEmail: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },
    subscriptionAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
      index: true,
    },
    notes: {
      type: String,
      default: "",
      trim: true,
    },
    trialEndsAt: {
      type: Date,
      default: null,
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

companySchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    ret.referredBy = ret.referredBy ? ret.referredBy.toString() : null;
    delete ret._id;
    return ret;
  },
});

export const CompanyModel = mongoose.models.Company || mongoose.model("Company", companySchema);
const normalizeCompany = (document) => {
  if (!document) {
    return null;
  }

  if (typeof document.toJSON === "function") {
    return document.toJSON();
  }

  return {
    ...document,
    id: document._id.toString(),
    referredBy: document.referredBy ? document.referredBy.toString() : null,
    _id: undefined,
  };
};

export const companyStore = {
  async list(filters = {}) {
    const query = { deletedAt: null };

    if (filters.plan) {
      query.plan = filters.plan;
    }

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.referredBy) {
      query.referredBy = filters.referredBy;
    }

    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: "i" } },
        { slug: { $regex: filters.search, $options: "i" } },
        { ownerName: { $regex: filters.search, $options: "i" } },
        { ownerEmail: { $regex: filters.search, $options: "i" } },
      ];
    }

    const page = Math.max(Number(filters.page || 1), 1);
    const limit = Math.min(Math.max(Number(filters.limit || 50), 1), 100);
    const skip = (page - 1) * limit;
    const [companies, total] = await Promise.all([
      CompanyModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      CompanyModel.countDocuments(query),
    ]);

    return {
      data: companies.map(normalizeCompany),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
    };
  },
  async listAllActive() {
    const companies = await CompanyModel.find({ deletedAt: null }).sort({ createdAt: -1 });
    return companies.map(normalizeCompany);
  },
  async findById(id) {
    return normalizeCompany(await CompanyModel.findOne({ _id: id, deletedAt: null }));
  },
  async findByAccountId(accountId) {
    return normalizeCompany(await CompanyModel.findOne({ accountId, deletedAt: null }));
  },
  async findBySlug(slug) {
    return normalizeCompany(await CompanyModel.findOne({ slug, deletedAt: null }));
  },
  async findByDomain(domain) {
    return normalizeCompany(await CompanyModel.findOne({ domain, deletedAt: null }));
  },
  async create(payload) {
    const company = await CompanyModel.create({
      accountId: `acct_${payload.slug}`,
      status: "active",
      ...payload,
    });

    return company.toJSON();
  },
  async updateByAccountId(accountId, payload) {
    return normalizeCompany(await CompanyModel.findOneAndUpdate(
      { accountId },
      { $set: payload },
      { new: true },
    ));
  },
  async updateById(id, payload) {
    return normalizeCompany(await CompanyModel.findByIdAndUpdate(
      id,
      { $set: payload },
      { new: true },
    ));
  },
  async softDeleteById(id) {
    return normalizeCompany(await CompanyModel.findByIdAndUpdate(
      id,
      { $set: { deletedAt: new Date(), status: "suspended" } },
      { new: true },
    ));
  },
};
