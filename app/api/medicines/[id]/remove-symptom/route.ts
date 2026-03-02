import { NextRequest } from "next/server";

import { ok, serverError } from "@/lib/api";
import { connectToDatabase } from "@/lib/mongodb";
import { requireApiAuth } from "@/lib/route-helpers";
import { parseBody, medicineSymptomSchema } from "@/lib/validators";
import { MedicineSymptom } from "@/models";

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireApiAuth();
    if (!auth.ok) return auth.response;

    await connectToDatabase();
    const { id } = await context.params;
    const input = await parseBody(request, medicineSymptomSchema);

    await MedicineSymptom.deleteOne({ medicineId: id, symptomId: input.symptomId });

    return ok({ unlinked: true });
  } catch (error) {
    return serverError(error);
  }
}

