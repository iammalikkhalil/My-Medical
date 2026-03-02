import { NextRequest } from "next/server";

import { fail, ok, serverError } from "@/lib/api";
import { calculateDurationDays } from "@/lib/time";
import { connectToDatabase } from "@/lib/mongodb";
import { requireApiAuth } from "@/lib/route-helpers";
import { parseBody, recoverEpisodeSchema } from "@/lib/validators";
import { IllnessEpisode } from "@/models";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireApiAuth();
    if (!auth.ok) return auth.response;

    await connectToDatabase();
    const { id } = await context.params;
    const input = await parseBody(request, recoverEpisodeSchema);

    const episode = await IllnessEpisode.findById(id);
    if (!episode) {
      return fail("Episode not found", 404);
    }

    const recoveryDate = new Date();

    episode.recoveryDate = recoveryDate;
    episode.isOngoing = false;
    episode.overallEffectiveness = input.overallEffectiveness;
    episode.durationDays = calculateDurationDays(episode.startDate, recoveryDate);
    if (input.notes) {
      episode.notes = input.notes;
    }

    await episode.save();

    return ok(episode);
  } catch (error) {
    return serverError(error);
  }
}

