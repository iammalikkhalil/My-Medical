import { NextRequest } from "next/server";

import { fail, ok, serverError } from "@/lib/api";
import { connectToDatabase } from "@/lib/mongodb";
import { requireApiAuth } from "@/lib/route-helpers";
import { parseBody, restockSchema } from "@/lib/validators";
import { Medicine } from "@/models";

export async function POST(request: NextRequest) {
  try {
    const auth = await requireApiAuth();
    if (!auth.ok) return auth.response;

    await connectToDatabase();
    const input = await parseBody(request, restockSchema);

    if (!input.medicineId && !input.categoryId) {
      return fail("medicineId or categoryId is required", 400);
    }

    if (input.medicineId) {
      const medicine = await Medicine.findById(input.medicineId);
      if (!medicine || !medicine.isActive) {
        return fail("Medicine not found", 404);
      }

      medicine.quantity = input.quantity ?? medicine.defaultQuantity;
      await medicine.save();

      return ok({ restocked: 1, medicineId: input.medicineId, quantity: medicine.quantity });
    }

    const result = await Medicine.updateMany(
      { categoryId: input.categoryId, isActive: true },
      [{ $set: { quantity: { $ifNull: [input.quantity, "$defaultQuantity"] } } }],
    );

    return ok({ restocked: result.modifiedCount, categoryId: input.categoryId });
  } catch (error) {
    return serverError(error);
  }
}

