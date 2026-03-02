import { model, models, Schema, type InferSchemaType, Types } from "mongoose";

const blogSectionSchema = new Schema(
  {
    id: { type: String, required: true, trim: true },
    heading: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    isWarning: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
  },
  { _id: false },
);

const blogSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    title: { type: String, required: true, trim: true },
    emoji: { type: String, default: "" },
    estimatedRecovery: { type: String, default: "" },
    isPublished: { type: Boolean, default: false, index: true },
    sortOrder: { type: Number, default: 0 },
    sections: { type: [blogSectionSchema], default: [] },
    relatedBlogIds: [{ type: Types.ObjectId, ref: "Blog" }],
  },
  { timestamps: true },
);

export type BlogDocument = InferSchemaType<typeof blogSchema>;
export const Blog = models.Blog || model("Blog", blogSchema);

