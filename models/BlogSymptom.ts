import { model, models, Schema, type InferSchemaType, Types } from "mongoose";

const blogSymptomSchema = new Schema(
  {
    blogId: { type: Types.ObjectId, ref: "Blog", required: true, index: true },
    symptomId: { type: Types.ObjectId, ref: "Symptom", required: true, index: true },
    isPrimary: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

blogSymptomSchema.index({ blogId: 1, symptomId: 1 }, { unique: true });

export type BlogSymptomDocument = InferSchemaType<typeof blogSymptomSchema>;
export const BlogSymptom = models.BlogSymptom || model("BlogSymptom", blogSymptomSchema);

