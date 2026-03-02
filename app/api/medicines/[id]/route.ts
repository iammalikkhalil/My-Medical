import { NextRequest } from "next/server";

import { fail, ok, serverError } from "@/lib/api";
import { refreshMedicineStatus } from "@/lib/medicine";
import { connectToDatabase } from "@/lib/mongodb";
import { requireApiAuth } from "@/lib/route-helpers";
import { parseBody, medicineSchema } from "@/lib/validators";
import { Category, Medicine, MedicineSymptom, Symptom } from "@/models";

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireApiAuth();
    if (!auth.ok) return auth.response;

    await connectToDatabase();
    const { id } = await context.params;

    const medicine = await Medicine.findById(id).lean();
    if (!medicine || !medicine.isActive) {
      return fail("Medicine not found", 404);
    }

    const [category, symptomLinks] = await Promise.all([
      Category.findById(medicine.categoryId).lean(),
      MedicineSymptom.find({ medicineId: id }).lean(),
    ]);

    const symptoms = await Symptom.find({ _id: { $in: symptomLinks.map((s) => s.symptomId) }, isActive: true })
      .sort({ name: 1 })
      .lean();

    return ok({ ...medicine, category, symptoms, isExpired: medicine.expiryDate < new Date() });
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
    const input = await parseBody(request, medicineSchema.partial());

    if (input.categoryId) {
      const categoryExists = await Category.exists({ _id: input.categoryId, isActive: true });
      if (!categoryExists) {
        return fail("Category not found", 404);
      }
    }

    const medicine = await Medicine.findByIdAndUpdate(
      id,
      {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.categoryId !== undefined ? { categoryId: input.categoryId } : {}),
        ...(input.purpose !== undefined ? { purpose: input.purpose } : {}),
        ...(input.usageNotes !== undefined ? { usageNotes: input.usageNotes } : {}),
        ...(input.dosage !== undefined ? { dosage: input.dosage } : {}),
        ...(input.doseIntervalHours !== undefined ? { doseIntervalHours: input.doseIntervalHours } : {}),
        ...(input.quantity !== undefined ? { quantity: input.quantity } : {}),
        ...(input.defaultQuantity !== undefined ? { defaultQuantity: input.defaultQuantity } : {}),
        ...(input.unit !== undefined ? { unit: input.unit } : {}),
        ...(input.expiryDate !== undefined
          ? { expiryDate: input.expiryDate, isExpired: input.expiryDate < new Date() }
          : {}),
        ...(input.isQuickAccess !== undefined ? { isQuickAccess: input.isQuickAccess } : {}),
      },
      { new: true },
    );

    if (!medicine) {
      return fail("Medicine not found", 404);
    }

    if (input.symptomIds) {
      await MedicineSymptom.deleteMany({ medicineId: id });
      await MedicineSymptom.insertMany(
        input.symptomIds.map((symptomId, index) => ({
          medicineId: id,
          symptomId,
          isPrimary: index === 0,
        })),
      );
    }

    await refreshMedicineStatus(medicine._id);

    return ok(medicine);
  } catch (error) {
    return serverError(error);
  }
}

export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireApiAuth();
    if (!auth.ok) return auth.response;

    await connectToDatabase();
    const { id } = await context.params;

    const medicine = await Medicine.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (!medicine) {
      return fail("Medicine not found", 404);
    }

    return ok({ deleted: true, id });
  } catch (error) {
    return serverError(error);
  }
}

