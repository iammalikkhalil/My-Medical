import { model, models, Schema, type InferSchemaType } from "mongoose";

const symptomSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    emoji: { type: String, default: "" },
    description: { type: String, default: "" },
    isCommon: { type: Boolean, default: false, index: true },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export type SymptomDocument = InferSchemaType<typeof symptomSchema>;
export const Symptom = models.Symptom || model("Symptom", symptomSchema);

