import { NextRequest } from "next/server";

import { ok, serverError } from "@/lib/api";
import { connectToDatabase } from "@/lib/mongodb";
import { getBooleanQuery, requireApiAuth } from "@/lib/route-helpers";
import { slugify } from "@/lib/slug";
import { parseBody, blogSchema } from "@/lib/validators";
import { Blog, BlogSymptom } from "@/models";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireApiAuth();
    if (!auth.ok) return auth.response;

    await connectToDatabase();
    const all = getBooleanQuery(request, "all");

    const blogs = await Blog.find(all ? {} : { isPublished: true }).sort({ sortOrder: 1, updatedAt: -1 }).lean();
    return ok(blogs);
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireApiAuth();
    if (!auth.ok) return auth.response;

    await connectToDatabase();
    const input = await parseBody(request, blogSchema);

    const blog = await Blog.create({
      slug: input.slug ? slugify(input.slug) : slugify(input.title),
      title: input.title,
      emoji: input.emoji,
      estimatedRecovery: input.estimatedRecovery,
      isPublished: input.isPublished,
      sortOrder: input.sortOrder,
      sections: input.sections,
      relatedBlogIds: input.relatedBlogIds,
    });

    if (input.symptomIds.length) {
      await BlogSymptom.insertMany(
        input.symptomIds.map((symptomId, index) => ({
          blogId: blog._id,
          symptomId,
          isPrimary: index === 0,
        })),
      );
    }

    return ok(blog, 201);
  } catch (error) {
    return serverError(error);
  }
}

