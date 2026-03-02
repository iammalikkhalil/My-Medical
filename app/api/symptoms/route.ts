import { NextRequest } from "next/server";

import { ok, serverError } from "@/lib/api";
import { connectToDatabase } from "@/lib/mongodb";
import { getBooleanQuery, requireApiAuth } from "@/lib/route-helpers";
import { slugify } from "@/lib/slug";
import { parseBody, symptomSchema } from "@/lib/validators";
import { Symptom } from "@/models/Symptom";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireApiAuth();
    if (!auth.ok) return auth.response;

    await connectToDatabase();
    const isCommon = getBooleanQuery(request, "isCommon");

    const symptoms = await Symptom.find({
      isActive: true,
      ...(isCommon ? { isCommon: true } : {}),
    }).sort({ isCommon: -1, sortOrder: 1, name: 1 });

    return ok(symptoms);
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireApiAuth();
    if (!auth.ok) return auth.response;

    await connectToDatabase();
    const input = await parseBody(request, symptomSchema);

    const symptom = await Symptom.create({
      name: input.name,
      slug: input.slug ? slugify(input.slug) : slugify(input.name),
      emoji: input.emoji,
      description: input.description,
      isCommon: input.isCommon,
      sortOrder: input.sortOrder,
      isActive: true,
    });

    return ok(symptom, 201);
  } catch (error) {
    return serverError(error);
  }
}

