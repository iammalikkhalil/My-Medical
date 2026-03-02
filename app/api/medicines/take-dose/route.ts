import { NextRequest } from "next/server";

import { fail, ok, serverError } from "@/lib/api";
import { applyDoseAndLog } from "@/lib/dose";
import { connectToDatabase } from "@/lib/mongodb";
import { requireApiAuth } from "@/lib/route-helpers";
import { parseBody, takeDoseSchema } from "@/lib/validators";
import { IllnessEpisode, Medicine } from "@/models";

export async function POST(request: NextRequest) {
  try {
    const auth = await requireApiAuth();
    if (!auth.ok) return auth.response;

    await connectToDatabase();
    const input = await parseBody(request, takeDoseSchema);

    const medicine = await Medicine.findById(input.medicineId);
    if (!medicine || !medicine.isActive) {
      return fail("Medicine not found", 404);
    }

    const episode = input.episodeId
      ? await IllnessEpisode.findById(input.episodeId)
      : await IllnessEpisode.findOne({ isOngoing: true }).sort({ startDate: -1 });

    if (!episode) {
      return fail("No active episode found. Use /api/episodes/[id]/log-dose for episode-specific dosing.", 400);
    }

    const result = await applyDoseAndLog({
      episodeId: String(episode._id),
      medicineId: String(medicine._id),
      medicineName: medicine.name,
      isFromKit: true,
      amount: input.amount,
      unit: medicine.unit,
      takenAt: input.takenAt,
      overrideIntervalWarning: input.overrideIntervalWarning,
    });

    if (result.blockedByWarning) {
      return ok({ warning: result.warning, requiresConfirmation: true });
    }

    return ok({ warning: result.warning, requiresConfirmation: false, dose: result.dose });
  } catch (error) {
    return serverError(error);
  }
}

