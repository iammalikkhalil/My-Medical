import { NextRequest } from "next/server";

import { fail, ok, serverError } from "@/lib/api";
import { connectToDatabase } from "@/lib/mongodb";
import { requireApiAuth } from "@/lib/route-helpers";
import { parseBody, medicineSymptomSchema } from "@/lib/validators";
import { Blog, BlogSymptom, Symptom } from "@/models";

export async function POST(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  try {
    const auth = await requireApiAuth();
    if (!auth.ok) return auth.response;

    await connectToDatabase();
    const { slug } = await context.params;
    const input = await parseBody(request, medicineSymptomSchema);

    const [blog, symptomExists] = await Promise.all([
      Blog.findOne({ slug }),
      Symptom.exists({ _id: input.symptomId, isActive: true }),
    ]);

    if (!blog || !symptomExists) {
      return fail("Blog or symptom not found", 404);
    }

    await BlogSymptom.updateOne(
      { blogId: blog._id, symptomId: input.symptomId },
      { blogId: blog._id, symptomId: input.symptomId },
      { upsert: true },
    );

    return ok({ linked: true });
  } catch (error) {
    return serverError(error);
  }
}

