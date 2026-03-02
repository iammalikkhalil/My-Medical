import { model, models, Schema, type InferSchemaType, Types } from "mongoose";

const usageLogSchema = new Schema(
  {
    medicineId: { type: Types.ObjectId, ref: "Medicine", default: null, index: true },
    medicineName: { type: String, required: true, trim: true },
    episodeId: { type: Types.ObjectId, ref: "IllnessEpisode", default: null, index: true },
    episodeMedicineId: { type: Types.ObjectId, ref: "EpisodeMedicine", default: null },
    isFromKit: { type: Boolean, required: true },
    amount: { type: Number, required: true, min: 0.1 },
    unit: { type: String, required: true },
    takenAt: { type: Date, required: true, index: -1 },
    notes: { type: String, default: "" },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export type UsageLogDocument = InferSchemaType<typeof usageLogSchema>;
export const UsageLog = models.UsageLog || model("UsageLog", usageLogSchema);

