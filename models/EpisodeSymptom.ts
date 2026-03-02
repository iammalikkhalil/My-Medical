import { model, models, Schema, type InferSchemaType, Types } from "mongoose";

const episodeSymptomSchema = new Schema(
  {
    episodeId: { type: Types.ObjectId, ref: "IllnessEpisode", required: true, index: true },
    symptomId: { type: Types.ObjectId, ref: "Symptom", required: true, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

episodeSymptomSchema.index({ episodeId: 1, symptomId: 1 }, { unique: true });

export type EpisodeSymptomDocument = InferSchemaType<typeof episodeSymptomSchema>;
export const EpisodeSymptom = models.EpisodeSymptom || model("EpisodeSymptom", episodeSymptomSchema);

