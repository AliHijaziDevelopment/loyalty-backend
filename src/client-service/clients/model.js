import crypto from "crypto";
import mongoose from "mongoose";

const clientSchema = new mongoose.Schema(
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
    name: {
      type: String,
      required: true,
      trim: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },
    dateOfBirth: {
      type: Date,
      default: null,
    },
    birthdayAvailable: {
      type: Boolean,
      default: false,
    },
    birthdayAvailableYear: {
      type: Number,
      default: null,
    },
    birthdayAllowOverride: {
      type: Boolean,
      default: false,
    },
    avatarUrl: {
      type: String,
      trim: true,
      default: "",
    },
    qrSecret: {
      type: String,
      required: true,
      unique: true,
      index: true,
      default: () => crypto.randomBytes(16).toString("hex"),
    },
    points: {
      type: Number,
      default: 0,
      min: 0,
    },
    visits: {
      type: Number,
      default: 0,
      min: 0,
    },
    redemptionsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    tier: {
      type: String,
      default: "Silver",
      trim: true,
      enum: ["Silver", "Gold", "VIP"],
    },
    status: {
      type: String,
      default: "active",
      enum: ["active", "archived"],
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

clientSchema.index({ accountId: 1, name: 1 });
clientSchema.index({ accountId: 1, phone: 1 }, { unique: true });
clientSchema.index({ accountId: 1, email: 1 });
clientSchema.index({ accountId: 1, username: 1 });
clientSchema.index({ accountId: 1, dateOfBirth: 1 });

clientSchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.qrSecret;
    return ret;
  },
});

export const ClientModel = mongoose.models.Client || mongoose.model("Client", clientSchema);

const normalizeClient = (document, options = {}) => {
  if (!document) {
    return null;
  }

  if (typeof document.toJSON === "function") {
    const json = document.toJSON();

    if (options.includeQrSecret) {
      json.qrSecret = document.qrSecret;
    }

    return json;
  }

  const normalized = {
    ...document,
    id: document._id.toString(),
    _id: undefined,
  };

  if (!options.includeQrSecret) {
    delete normalized.qrSecret;
  }

  return normalized;
};

export const clientStore = {
  async create(payload) {
    const client = await ClientModel.create(payload);
    return client.toJSON();
  },
  async list(search, options = {}) {
    const filter = {};

    if (!options.includeArchived) {
      filter.status = "active";
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    const clients = await ClientModel.find(filter).sort({ createdAt: -1 });
    return clients.map(normalizeClient);
  },
  async listByAccountId(accountId, search, options = {}) {
    const filter = { accountId };

    if (!options.includeArchived) {
      filter.status = "active";
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    const clients = await ClientModel.find(filter).sort({ createdAt: -1 });
    return clients.map(normalizeClient);
  },
  async findById(accountId, id) {
    return normalizeClient(await ClientModel.findOne({ _id: id, accountId }));
  },
  async findByIdIncludingArchived(accountId, id) {
    return normalizeClient(await ClientModel.findOne({ _id: id, accountId }));
  },
  async findAnyById(id) {
    return normalizeClient(await ClientModel.findById(id));
  },
  async findAnyByKeycloakId(keycloakId) {
    return normalizeClient(await ClientModel.findOne({ keycloakId }));
  },
  async findAnyByKeycloakIdWithSecret(keycloakId) {
    return normalizeClient(await ClientModel.findOne({ keycloakId }), { includeQrSecret: true });
  },
  async findByPhone(accountId, phone) {
    return normalizeClient(await ClientModel.findOne({ accountId, phone }));
  },
  async findByQrSecret(accountId, qrSecret) {
    return normalizeClient(await ClientModel.findOne({ accountId, qrSecret }));
  },
  async ensureQrSecret(accountId, id, qrSecret) {
    return normalizeClient(await ClientModel.findOneAndUpdate(
      { _id: id, accountId },
      { $set: { qrSecret } },
      { new: true },
    ), { includeQrSecret: true });
  },
  async updateById(accountId, id, payload) {
    return normalizeClient(await ClientModel.findOneAndUpdate(
      { _id: id, accountId },
      { $set: payload },
      { new: true },
    ));
  },
  async incrementMetrics(accountId, id, metrics) {
    return normalizeClient(await ClientModel.findOneAndUpdate(
      { _id: id, accountId },
      { $inc: metrics },
      { new: true },
    ));
  },
  async listBirthdayClients(accountId, month, day) {
    const clients = await ClientModel.find({
      accountId,
      status: "active",
      dateOfBirth: { $ne: null },
      $expr: {
        $and: [
          { $eq: [{ $month: "$dateOfBirth" }, month] },
          { $eq: [{ $dayOfMonth: "$dateOfBirth" }, day] },
        ],
      },
    }).sort({ createdAt: -1 });

    return clients.map(normalizeClient);
  },
  async setBirthdayAvailability(accountId, id, payload) {
    return normalizeClient(await ClientModel.findOneAndUpdate(
      { _id: id, accountId },
      {
        $set: {
          birthdayAvailable: Boolean(payload.birthdayAvailable),
          birthdayAvailableYear: payload.birthdayAvailableYear ?? null,
          birthdayAllowOverride: Boolean(payload.birthdayAllowOverride),
        },
      },
      { new: true },
    ));
  },
  async archiveById(accountId, id) {
    return normalizeClient(await ClientModel.findOneAndUpdate(
      { _id: id, accountId },
      { $set: { status: "archived" } },
      { new: true },
    ));
  },
  async restoreById(accountId, id) {
    return normalizeClient(await ClientModel.findOneAndUpdate(
      { _id: id, accountId },
      { $set: { status: "active" } },
      { new: true },
    ));
  },
  async aggregateStats(accountId) {
    const [stats] = await ClientModel.aggregate([
      { $match: { accountId, status: "active" } },
      {
        $group: {
          _id: null,
          totalClients: { $sum: 1 },
          totalVisits: { $sum: "$visits" },
          totalRedemptions: { $sum: "$redemptionsCount" },
          totalPointsIssued: { $sum: "$points" },
        },
      },
    ]);

    return {
      totalClients: stats?.totalClients || 0,
      totalVisits: stats?.totalVisits || 0,
      totalRedemptions: stats?.totalRedemptions || 0,
      totalPointsIssued: stats?.totalPointsIssued || 0,
    };
  },
  async aggregateGlobalStats() {
    const [stats] = await ClientModel.aggregate([
      {
        $group: {
          _id: null,
          totalClients: { $sum: 1 },
          totalVisits: { $sum: "$visits" },
          totalRedemptions: { $sum: "$redemptionsCount" },
          totalPointsIssued: { $sum: "$points" },
        },
      },
    ]);

    return {
      totalClients: stats?.totalClients || 0,
      totalVisits: stats?.totalVisits || 0,
      totalRedemptions: stats?.totalRedemptions || 0,
      totalPointsIssued: stats?.totalPointsIssued || 0,
    };
  },
};
