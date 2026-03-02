import { model, models, Schema, type InferSchemaType, Types } from "mongoose";

const episodeMedicineSchema = new Schema(
  {
    episodeId: { type: Types.ObjectId, ref: "IllnessEpisode", required: true, index: true },
    medicineId: { type: Types.ObjectId, ref: "Medicine", default: null, index: true },
    medicineName: { type: String, required: true, trim: true },
    isFromKit: { type: Boolean, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

episodeMedicineSchema.index({ episodeId: 1, medicineId: 1, medicineName: 1 }, { unique: true });

export type EpisodeMedicineDocument = InferSchemaType<typeof episodeMedicineSchema>;
export const EpisodeMedicine = models.EpisodeMedicine || model("EpisodeMedicine", episodeMedicineSchema);

