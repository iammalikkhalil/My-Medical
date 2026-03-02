import { z } from "zod";

export const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "Invalid ObjectId");

export const categorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
  emoji: z.string().optional().default(""),
  description: z.string().optional().default(""),
  sortOrder: z.number().int().optional().default(0),
});

export const symptomSchema = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
  emoji: z.string().optional().default(""),
  description: z.string().optional().default(""),
  isCommon: z.boolean().optional().default(false),
  sortOrder: z.number().int().optional().default(0),
});

export const medicineSchema = z.object({
  name: z.string().min(1),
  categoryId: objectIdSchema,
  purpose: z.string().optional().default(""),
  usageNotes: z.string().optional().default(""),
  dosage: z.string().optional().default(""),
  doseIntervalHours: z.number().min(1).max(48).optional().default(6),
  quantity: z.number().min(0),
  defaultQuantity: z.number().min(0),
  unit: z.string().min(1),
  expiryDate: z.coerce.date(),
  isQuickAccess: z.boolean().optional().default(false),
  symptomIds: z.array(objectIdSchema).optional().default([]),
});

export const medicineSymptomSchema = z.object({
  symptomId: objectIdSchema,
});

export const takeDoseSchema = z.object({
  medicineId: objectIdSchema,
  amount: z.number().positive().default(1),
  episodeId: objectIdSchema.optional(),
  overrideIntervalWarning: z.boolean().optional().default(false),
  takenAt: z.coerce.date().optional(),
});

export const restockSchema = z.object({
  medicineId: objectIdSchema.optional(),
  categoryId: objectIdSchema.optional(),
  quantity: z.number().min(0).optional(),
});

export const startEpisodeSchema = z.object({
  name: z.string().min(1),
  symptomIds: z.array(objectIdSchema).min(1),
  blogId: objectIdSchema.optional(),
  notes: z.string().optional().default(""),
  startDate: z.coerce.date().optional(),
});

export const updateEpisodeSchema = z.object({
  name: z.string().min(1).optional(),
  notes: z.string().optional(),
  blogId: objectIdSchema.nullable().optional(),
});

export const recoverEpisodeSchema = z.object({
  overallEffectiveness: z.enum(["recovered", "partial", "worsened"]),
  notes: z.string().optional(),
});

export const logEpisodeDoseSchema = z.object({
  medicineId: objectIdSchema.optional().nullable(),
  medicineName: z.string().min(1),
  isFromKit: z.boolean(),
  amount: z.number().positive(),
  unit: z.string().min(1),
  takenAt: z.coerce.date().optional(),
  notes: z.string().optional().default(""),
  overrideIntervalWarning: z.boolean().optional().default(false),
});

export const blogSectionSchema = z.object({
  id: z.string().min(1),
  heading: z.string().min(1),
  content: z.string().min(1),
  isWarning: z.boolean().optional().default(false),
  sortOrder: z.number().int().optional().default(0),
});

export const blogSchema = z.object({
  slug: z.string().optional(),
  title: z.string().min(1),
  emoji: z.string().optional().default(""),
  estimatedRecovery: z.string().optional().default(""),
  isPublished: z.boolean().optional().default(false),
  sortOrder: z.number().int().optional().default(0),
  sections: z.array(blogSectionSchema).optional().default([]),
  relatedBlogIds: z.array(objectIdSchema).optional().default([]),
  symptomIds: z.array(objectIdSchema).optional().default([]),
});

export const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
  rememberMe: z.boolean().optional().default(false),
});

export async function parseBody<T>(request: Request, schema: z.ZodSchema<T>) {
  const body = await request.json();
  return schema.parse(body);
}

