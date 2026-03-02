import { Types } from "mongoose";

import { Medicine } from "@/models/Medicine";
import { MedicineSymptom } from "@/models/MedicineSymptom";
import { isExpired } from "@/lib/time";

export async function refreshMedicineStatus(medicineId: Types.ObjectId | string) {
  const medicine = await Medicine.findById(medicineId);
  if (!medicine) {
    return null;
  }

  medicine.isExpired = isExpired(medicine.expiryDate);
  medicine.isQuickAccess = shouldBeQuickAccess(medicine.lastUsed, medicine.usageCount);
  await medicine.save();
  return medicine;
}

export function shouldBeQuickAccess(lastUsed: Date | null, usageCount: number) {
  const usedInLast7Days =
    !!lastUsed && Date.now() - new Date(lastUsed).getTime() <= 1000 * 60 * 60 * 24 * 7;
  const usedFrequently = usageCount >= 5;
  return usedInLast7Days || usedFrequently;
}

export async function linkMedicineSymptoms(medicineId: string, symptomIds: string[]) {
  if (!symptomIds.length) {
    return;
  }

  await MedicineSymptom.insertMany(
    symptomIds.map((symptomId, index) => ({
      medicineId,
      symptomId,
      isPrimary: index === 0,
    })),
    { ordered: false },
  ).catch(() => {
    // Ignore duplicate key insert attempts for idempotent operations.
  });
}

