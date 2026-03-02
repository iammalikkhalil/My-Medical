import { model, models, Schema, type InferSchemaType, Types } from "mongoose";

const medicineSymptomSchema = new Schema(
  {
    medicineId: { type: Types.ObjectId, ref: "Medicine", required: true, index: true },
    symptomId: { type: Types.ObjectId, ref: "Symptom", required: true, index: true },
    isPrimary: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

medicineSymptomSchema.index({ medicineId: 1, symptomId: 1 }, { unique: true });

export type MedicineSymptomDocument = InferSchemaType<typeof medicineSymptomSchema>;
export const MedicineSymptom = models.MedicineSymptom || model("MedicineSymptom", medicineSymptomSchema);

