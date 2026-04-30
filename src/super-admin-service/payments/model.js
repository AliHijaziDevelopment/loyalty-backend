import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    date: { type: Date, required: true, default: Date.now, index: true },
    status: { type: String, required: true, enum: ["paid", "pending", "failed"], index: true },
  },
  { timestamps: true, versionKey: false },
);

paymentSchema.index({ companyId: 1, date: -1 });
paymentSchema.index({ status: 1, date: -1 });

paymentSchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});

export const PaymentModel = mongoose.models.Payment || mongoose.model("Payment", paymentSchema);

export const paymentStore = {
  async totalPaid(match = {}) {
    const [result] = await PaymentModel.aggregate([
      { $match: { status: "paid", ...match } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    return result?.total || 0;
  },
  async monthlyPaid() {
    return PaymentModel.aggregate([
      { $match: { status: "paid" } },
      {
        $group: {
          _id: { year: { $year: "$date" }, month: { $month: "$date" } },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
      { $limit: 12 },
    ]);
  },
  async paidByCompany() {
    return PaymentModel.aggregate([
      { $match: { status: "paid" } },
      { $group: { _id: "$companyId", total: { $sum: "$amount" } } },
    ]);
  },
};
