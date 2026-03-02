import { NextRequest } from "next/server";

import { fail, ok, serverError } from "@/lib/api";
import { connectToDatabase } from "@/lib/mongodb";
import { requireApiAuth } from "@/lib/route-helpers";
import { slugify } from "@/lib/slug";
import { parseBody, symptomSchema } from "@/lib/validators";
import { Symptom } from "@/models/Symptom";

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireApiAuth();
    if (!auth.ok) return auth.response;

    await connectToDatabase();
    const { id } = await context.params;
    const input = await parseBody(request, symptomSchema.partial());

    const symptom = await Symptom.findByIdAndUpdate(
      id,
      {
        ...(input.name ? { name: input.name } : {}),
        ...(input.slug ? { slug: slugify(input.slug) } : {}),
        ...(input.emoji !== undefined ? { emoji: input.emoji } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.isCommon !== undefined ? { isCommon: input.isCommon } : {}),
        ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
      },
      { new: true },
    );

    if (!symptom) {
      return fail("Symptom not found", 404);
    }

    return ok(symptom);
  } catch (error) {
    return serverError(error);
  }
}

export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireApiAuth();
    if (!auth.ok) return auth.response;

    await connectToDatabase();
    const { id } = await context.params;

    const symptom = await Symptom.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (!symptom) {
      return fail("Symptom not found", 404);
    }

    return ok({ deleted: true, id });
  } catch (error) {
    return serverError(error);
  }
}

