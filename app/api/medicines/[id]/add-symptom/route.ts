import { NextRequest } from "next/server";

import { fail, ok, serverError } from "@/lib/api";
import { connectToDatabase } from "@/lib/mongodb";
import { requireApiAuth } from "@/lib/route-helpers";
import { parseBody, medicineSymptomSchema } from "@/lib/validators";
import { Medicine, MedicineSymptom, Symptom } from "@/models";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireApiAuth();
    if (!auth.ok) return auth.response;

    await connectToDatabase();
    const { id } = await context.params;
    const input = await parseBody(request, medicineSymptomSchema);

    const [medicineExists, symptomExists] = await Promise.all([
      Medicine.exists({ _id: id, isActive: true }),
      Symptom.exists({ _id: input.symptomId, isActive: true }),
    ]);

    if (!medicineExists || !symptomExists) {
      return fail("Medicine or symptom not found", 404);
    }

    await MedicineSymptom.updateOne(
      { medicineId: id, symptomId: input.symptomId },
      { medicineId: id, symptomId: input.symptomId, isPrimary: false },
      { upsert: true },
    );

    return ok({ linked: true });
  } catch (error) {
    return serverError(error);
  }
}

