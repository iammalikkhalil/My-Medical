import { NextRequest } from "next/server";

import { fail, ok, serverError } from "@/lib/api";
import { connectToDatabase } from "@/lib/mongodb";
import { requireApiAuth } from "@/lib/route-helpers";
import { slugify } from "@/lib/slug";
import { parseBody, blogSchema } from "@/lib/validators";
import { Blog, BlogSymptom, Symptom } from "@/models";

export async function GET(_request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  try {
    const auth = await requireApiAuth();
    if (!auth.ok) return auth.response;

    await connectToDatabase();
    const { slug } = await context.params;

    const blog = await Blog.findOne({ slug }).lean();
    if (!blog) {
      return fail("Blog not found", 404);
    }

    const blogSymptoms = await BlogSymptom.find({ blogId: blog._id }).lean();
    const symptoms = await Symptom.find({ _id: { $in: blogSymptoms.map((entry) => entry.symptomId) } }).lean();

    return ok({ ...blog, symptoms, blogSymptoms });
  } catch (error) {
    return serverError(error);
  }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  try {
    const auth = await requireApiAuth();
    if (!auth.ok) return auth.response;

    await connectToDatabase();
    const { slug } = await context.params;
    const input = await parseBody(request, blogSchema.partial());

    const blog = await Blog.findOneAndUpdate(
      { slug },
      {
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.slug !== undefined ? { slug: slugify(input.slug) } : {}),
        ...(input.emoji !== undefined ? { emoji: input.emoji } : {}),
        ...(input.estimatedRecovery !== undefined ? { estimatedRecovery: input.estimatedRecovery } : {}),
        ...(input.isPublished !== undefined ? { isPublished: input.isPublished } : {}),
        ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
        ...(input.sections !== undefined ? { sections: input.sections } : {}),
        ...(input.relatedBlogIds !== undefined ? { relatedBlogIds: input.relatedBlogIds } : {}),
      },
      { new: true },
    );

    if (!blog) {
      return fail("Blog not found", 404);
    }

    if (input.symptomIds) {
      await BlogSymptom.deleteMany({ blogId: blog._id });
      await BlogSymptom.insertMany(
        input.symptomIds.map((symptomId, index) => ({
          blogId: blog._id,
          symptomId,
          isPrimary: index === 0,
        })),
      );
    }

    return ok(blog);
  } catch (error) {
    return serverError(error);
  }
}

export async function DELETE(_request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  try {
    const auth = await requireApiAuth();
    if (!auth.ok) return auth.response;

    await connectToDatabase();
    const { slug } = await context.params;

    const blog = await Blog.findOneAndUpdate({ slug }, { isPublished: false }, { new: true });
    if (!blog) {
      return fail("Blog not found", 404);
    }

    return ok({ unpublished: true, slug });
  } catch (error) {
    return serverError(error);
  }
}

