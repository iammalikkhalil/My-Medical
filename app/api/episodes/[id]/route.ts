import { format } from "date-fns";
import { NextRequest } from "next/server";

import { fail, ok, serverError } from "@/lib/api";
import { connectToDatabase } from "@/lib/mongodb";
import { requireApiAuth } from "@/lib/route-helpers";
import { parseBody, updateEpisodeSchema } from "@/lib/validators";
import { EpisodeDose, EpisodeSymptom, IllnessEpisode, Symptom } from "@/models";

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireApiAuth();
    if (!auth.ok) return auth.response;

    await connectToDatabase();
    const { id } = await context.params;

    const episode = await IllnessEpisode.findById(id).lean();
    if (!episode) {
      return fail("Episode not found", 404);
    }

    const [episodeSymptoms, symptoms, doses] = await Promise.all([
      EpisodeSymptom.find({ episodeId: id }).lean(),
      EpisodeSymptom.find({ episodeId: id }).distinct("symptomId"),
      EpisodeDose.find({ episodeId: id }).sort({ takenAt: -1 }).lean(),
    ]);

    const symptomDocs = await Symptom.find({ _id: { $in: symptoms } }).lean();

    const groupedDoses = doses.reduce<Record<string, typeof doses>>((acc, dose) => {
      const key = format(new Date(dose.takenAt), "yyyy-MM-dd");
      if (!acc[key]) acc[key] = [];
      acc[key].push(dose);
      return acc;
    }, {});

    return ok({
      ...episode,
      symptoms: symptomDocs,
      episodeSymptoms,
      doses,
      groupedDoses,
    });
  } catch (error) {
    return serverError(error);
  }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireApiAuth();
    if (!auth.ok) return auth.response;

    await connectToDatabase();
    const { id } = await context.params;
    const input = await parseBody(request, updateEpisodeSchema);

    const episode = await IllnessEpisode.findByIdAndUpdate(
      id,
      {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.notes !== undefined ? { notes: input.notes } : {}),
        ...(input.blogId !== undefined ? { blogId: input.blogId } : {}),
      },
      { new: true },
    );

    if (!episode) {
      return fail("Episode not found", 404);
    }

    return ok(episode);
  } catch (error) {
    return serverError(error);
  }
}

