import { differenceInCalendarDays } from "date-fns";

import { ok, serverError } from "@/lib/api";
import { connectToDatabase } from "@/lib/mongodb";
import { requireApiAuth } from "@/lib/route-helpers";
import { EpisodeDose, EpisodeSymptom, IllnessEpisode, Symptom } from "@/models";

export async function GET() {
  try {
    const auth = await requireApiAuth();
    if (!auth.ok) return auth.response;

    await connectToDatabase();
    const episode = await IllnessEpisode.findOne({ isOngoing: true }).sort({ startDate: -1 }).lean();

    if (!episode) {
      return ok(null);
    }

    const [episodeSymptoms, doses] = await Promise.all([
      EpisodeSymptom.find({ episodeId: episode._id }).lean(),
      EpisodeDose.find({ episodeId: episode._id }).sort({ takenAt: -1 }).lean(),
    ]);

    const symptoms = await Symptom.find({ _id: { $in: episodeSymptoms.map((entry) => entry.symptomId) } }).lean();

    return ok({
      ...episode,
      dayNumber: differenceInCalendarDays(new Date(), new Date(episode.startDate)) + 1,
      symptoms,
      doses,
    });
  } catch (error) {
    return serverError(error);
  }
}


