import mongoose from "mongoose";

const commissionSchema = new mongoose.Schema(
  {
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true, index: true },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true, index: true },
    monthlyAmount: { type: Number, required: true, min: 0 },
    percentage: { type: Number, required: true, min: 0, max: 100 },
    generatedAt: { type: Date, required: true, default: Date.now, index: true },
  },
  { timestamps: true, versionKey: false },
);

commissionSchema.index({ employeeId: 1, companyId: 1, generatedAt: -1 });

commissionSchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});

export const CommissionModel = mongoose.models.Commission || mongoose.model("Commission", commissionSchema);
