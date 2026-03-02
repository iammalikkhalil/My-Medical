import { NextRequest } from "next/server";

import { fail, ok, serverError } from "@/lib/api";
import { connectToDatabase } from "@/lib/mongodb";
import { requireApiAuth } from "@/lib/route-helpers";
import { parseBody, medicineSymptomSchema } from "@/lib/validators";
import { Blog, BlogSymptom } from "@/models";

export async function DELETE(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  try {
    const auth = await requireApiAuth();
    if (!auth.ok) return auth.response;

    await connectToDatabase();
    const { slug } = await context.params;
    const input = await parseBody(request, medicineSymptomSchema);

    const blog = await Blog.findOne({ slug });
    if (!blog) {
      return fail("Blog not found", 404);
    }

    await BlogSymptom.deleteOne({ blogId: blog._id, symptomId: input.symptomId });

    return ok({ unlinked: true });
  } catch (error) {
    return serverError(error);
  }
}

