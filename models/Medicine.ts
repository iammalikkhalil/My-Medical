import { model, models, Schema, type InferSchemaType, Types } from "mongoose";

const medicineSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    categoryId: { type: Types.ObjectId, ref: "Category", required: true, index: true },
    purpose: { type: String, default: "" },
    usageNotes: { type: String, default: "" },
    dosage: { type: String, default: "" },
    doseIntervalHours: { type: Number, default: 6 },
    quantity: { type: Number, required: true, min: 0, index: true },
    defaultQuantity: { type: Number, required: true, min: 0 },
    unit: { type: String, required: true, trim: true },
    expiryDate: { type: Date, required: true, index: true },
    isExpired: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true, index: true },
    usageCount: { type: Number, default: 0 },
    lastUsed: { type: Date, default: null },
    lastDoseTaken: { type: Date, default: null },
    isQuickAccess: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export type MedicineDocument = InferSchemaType<typeof medicineSchema>;
export const Medicine = models.Medicine || model("Medicine", medicineSchema);

