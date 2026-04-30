import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true, index: true },
    commissionPercentage: { type: Number, required: true, min: 0, max: 100 },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true, versionKey: false },
);

employeeSchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});

export const EmployeeModel = mongoose.models.Employee || mongoose.model("Employee", employeeSchema);

const normalizeEmployee = (document) => {
  if (!document) {
    return null;
  }

  if (typeof document.toJSON === "function") {
    return document.toJSON();
  }

  return { ...document, id: document._id.toString(), _id: undefined };
};

export const employeeStore = {
  async list(filters = {}) {
    const query = {};

    if (filters.isActive !== undefined && filters.isActive !== "") {
      query.isActive = filters.isActive === true || filters.isActive === "true";
    }

    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: "i" } },
        { email: { $regex: filters.search, $options: "i" } },
      ];
    }

    const page = Math.max(Number(filters.page || 1), 1);
    const limit = Math.min(Math.max(Number(filters.limit || 50), 1), 100);
    const skip = (page - 1) * limit;
    const [employees, total] = await Promise.all([
      EmployeeModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      EmployeeModel.countDocuments(query),
    ]);

    return {
      data: employees.map(normalizeEmployee),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
    };
  },
  async listAll() {
    return (await EmployeeModel.find().sort({ createdAt: -1 })).map(normalizeEmployee);
  },
  async findById(id) {
    return normalizeEmployee(await EmployeeModel.findById(id));
  },
  async findByEmail(email) {
    return normalizeEmployee(await EmployeeModel.findOne({ email: email.toLowerCase() }));
  },
  async create(payload) {
    return (await EmployeeModel.create(payload)).toJSON();
  },
  async updateById(id, payload) {
    return normalizeEmployee(await EmployeeModel.findByIdAndUpdate(id, { $set: payload }, { new: true }));
  },
};
