import { model, models, Schema, type InferSchemaType, Types } from "mongoose";

const illnessEpisodeSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    startDate: { type: Date, required: true, index: -1 },
    recoveryDate: { type: Date, default: null },
    isOngoing: { type: Boolean, default: true, index: true },
    blogId: { type: Types.ObjectId, ref: "Blog", default: null },
    overallEffectiveness: {
      type: String,
      enum: ["recovered", "partial", "worsened", null],
      default: null,
    },
    durationDays: { type: Number, default: null },
    notes: { type: String, default: "" },
  },
  { timestamps: true },
);

illnessEpisodeSchema.index({ isOngoing: 1 }, { partialFilterExpression: { isOngoing: true }, unique: true });

export type IllnessEpisodeDocument = InferSchemaType<typeof illnessEpisodeSchema>;
export const IllnessEpisode = models.IllnessEpisode || model("IllnessEpisode", illnessEpisodeSchema);

