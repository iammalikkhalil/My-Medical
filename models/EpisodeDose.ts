import { model, models, Schema, type InferSchemaType, Types } from "mongoose";

const episodeDoseSchema = new Schema(
  {
    episodeMedicineId: { type: Types.ObjectId, ref: "EpisodeMedicine", required: true },
    episodeId: { type: Types.ObjectId, ref: "IllnessEpisode", required: true, index: true },
    medicineId: { type: Types.ObjectId, ref: "Medicine", default: null, index: true },
    medicineName: { type: String, required: true, trim: true },
    isFromKit: { type: Boolean, required: true },
    amount: { type: Number, required: true, min: 0.1 },
    unit: { type: String, required: true },
    takenAt: { type: Date, required: true, index: -1 },
    wasEffective: { type: Boolean, default: null },
    notes: { type: String, default: "" },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export type EpisodeDoseDocument = InferSchemaType<typeof episodeDoseSchema>;
export const EpisodeDose = models.EpisodeDose || model("EpisodeDose", episodeDoseSchema);

