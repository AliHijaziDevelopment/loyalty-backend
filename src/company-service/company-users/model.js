import mongoose from "mongoose";

const companyUserSchema = new mongoose.Schema(
  {
    keycloakId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    accountId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    role: {
      type: String,
      required: true,
      enum: ["admin", "staff"],
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      default: "active",
      enum: ["active", "disabled"],
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

companyUserSchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});

export const CompanyUserModel = mongoose.models.CompanyUser || mongoose.model("CompanyUser", companyUserSchema);
const normalizeCompanyUser = (document) => {
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

export const companyUserStore = {
  async create(payload) {
    const companyUser = await CompanyUserModel.create(payload);
    return companyUser.toJSON();
  },
  async list() {
    const companyUsers = await CompanyUserModel.find().sort({ createdAt: -1 });
    return companyUsers.map(normalizeCompanyUser);
  },
  async findAnyByKeycloakId(keycloakId) {
    return normalizeCompanyUser(await CompanyUserModel.findOne({ keycloakId }));
  },
  async findByKeycloakId(keycloakId) {
    return normalizeCompanyUser(await CompanyUserModel.findOne({ keycloakId, status: "active" }));
  },
  async findByAccountId(accountId) {
    const companyUsers = await CompanyUserModel.find({ accountId }).sort({ createdAt: -1 });
    return companyUsers.map(normalizeCompanyUser);
  },
};
