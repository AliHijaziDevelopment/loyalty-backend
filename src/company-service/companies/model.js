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
      enum: ["active", "disabled"],
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
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

companySchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
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
    _id: undefined,
  };
};

export const companyStore = {
  async list() {
    const companies = await CompanyModel.find().sort({ createdAt: -1 });
    return companies.map(normalizeCompany);
  },
  async findById(id) {
    return normalizeCompany(await CompanyModel.findById(id));
  },
  async findByAccountId(accountId) {
    return normalizeCompany(await CompanyModel.findOne({ accountId }));
  },
  async findBySlug(slug) {
    return normalizeCompany(await CompanyModel.findOne({ slug }));
  },
  async findByDomain(domain) {
    return normalizeCompany(await CompanyModel.findOne({ domain }));
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
};
