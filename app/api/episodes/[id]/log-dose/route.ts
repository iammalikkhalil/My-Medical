import { NextRequest } from "next/server";

import { fail, ok, serverError } from "@/lib/api";
import { applyDoseAndLog } from "@/lib/dose";
import { connectToDatabase } from "@/lib/mongodb";
import { requireApiAuth } from "@/lib/route-helpers";
import { parseBody, logEpisodeDoseSchema } from "@/lib/validators";
import { IllnessEpisode, Medicine } from "@/models";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireApiAuth();
    if (!auth.ok) return auth.response;

    await connectToDatabase();

    const { id } = await context.params;
    const input = await parseBody(request, logEpisodeDoseSchema);

    const episode = await IllnessEpisode.findById(id);
    if (!episode) {
      return fail("Episode not found", 404);
    }

    let medicineName = input.medicineName;
    if (input.isFromKit) {
      if (!input.medicineId) {
        return fail("medicineId is required for kit medicine", 400);
      }

      const medicine = await Medicine.findById(input.medicineId);
      if (!medicine || !medicine.isActive) {
        return fail("Medicine not found", 404);
      }

      medicineName = medicine.name;
    }

    const result = await applyDoseAndLog({
      episodeId: id,
      medicineId: input.medicineId ?? null,
      medicineName,
      isFromKit: input.isFromKit,
      amount: input.amount,
      unit: input.unit,
      takenAt: input.takenAt,
      notes: input.notes,
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

