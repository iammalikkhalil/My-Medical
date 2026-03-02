import { NextRequest } from "next/server";

import { fail, ok, serverError } from "@/lib/api";
import { connectToDatabase } from "@/lib/mongodb";
import { requireApiAuth } from "@/lib/route-helpers";
import { parseBody, startEpisodeSchema } from "@/lib/validators";
import { EpisodeDose, EpisodeMedicine, EpisodeSymptom, IllnessEpisode, Symptom } from "@/models";

export async function GET() {
  try {
    const auth = await requireApiAuth();
    if (!auth.ok) return auth.response;

    await connectToDatabase();

    const episodes = await IllnessEpisode.find().sort({ startDate: -1 }).lean();

    const episodeIds = episodes.map((episode) => episode._id);
    const [episodeSymptoms, episodeMedicines, episodeDoses] = await Promise.all([
      EpisodeSymptom.find({ episodeId: { $in: episodeIds } }).lean(),
      EpisodeMedicine.find({ episodeId: { $in: episodeIds } }).lean(),
      EpisodeDose.find({ episodeId: { $in: episodeIds } }).sort({ takenAt: -1 }).lean(),
    ]);

    const symptomIds = episodeSymptoms.map((entry) => entry.symptomId);
    const symptoms = await Symptom.find({ _id: { $in: symptomIds } }).lean();
    const symptomMap = new Map(symptoms.map((symptom) => [String(symptom._id), symptom]));

    const payload = episodes.map((episode) => {
      const episodeId = String(episode._id);
      return {
        ...episode,
        symptoms: episodeSymptoms
          .filter((entry) => String(entry.episodeId) === episodeId)
          .map((entry) => symptomMap.get(String(entry.symptomId)))
          .filter(Boolean),
        medicines: episodeMedicines.filter((entry) => String(entry.episodeId) === episodeId),
        doses: episodeDoses.filter((entry) => String(entry.episodeId) === episodeId),
      };
    });

    return ok(payload);
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireApiAuth();
    if (!auth.ok) return auth.response;

    await connectToDatabase();
    const input = await parseBody(request, startEpisodeSchema);

    const existing = await IllnessEpisode.findOne({ isOngoing: true });
    if (existing) {
      return fail(
        `An episode is already active: ${existing.name}. Close it first or continue current episode.`,
        409,
      );
    }

    const episode = await IllnessEpisode.create({
      name: input.name,
      startDate: input.startDate ?? new Date(),
      isOngoing: true,
      blogId: input.blogId ?? null,
      notes: input.notes,
      recoveryDate: null,
      overallEffectiveness: null,
      durationDays: null,
    });

    await EpisodeSymptom.insertMany(
      input.symptomIds.map((symptomId) => ({ episodeId: episode._id, symptomId })),
    );

    return ok(episode, 201);
  } catch (error) {
    return serverError(error);
  }
}

