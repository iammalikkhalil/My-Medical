import { NextRequest } from "next/server";

import { fail, ok, serverError } from "@/lib/api";
import { connectToDatabase } from "@/lib/mongodb";
import { requireApiAuth } from "@/lib/route-helpers";
import { parseBody, medicineSymptomSchema } from "@/lib/validators";
import { EpisodeSymptom, IllnessEpisode, Symptom } from "@/models";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireApiAuth();
    if (!auth.ok) return auth.response;

    await connectToDatabase();
    const { id } = await context.params;
    const input = await parseBody(request, medicineSymptomSchema);

    const [episodeExists, symptomExists] = await Promise.all([
      IllnessEpisode.exists({ _id: id }),
      Symptom.exists({ _id: input.symptomId, isActive: true }),
    ]);

    if (!episodeExists || !symptomExists) {
      return fail("Episode or symptom not found", 404);
    }

    await EpisodeSymptom.updateOne(
      { episodeId: id, symptomId: input.symptomId },
      { episodeId: id, symptomId: input.symptomId },
      { upsert: true },
    );

    return ok({ linked: true });
  } catch (error) {
    return serverError(error);
  }
}

