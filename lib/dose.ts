import { type HydratedDocument, Types } from "mongoose";

import { hoursSince } from "@/lib/time";
import { EpisodeDose, EpisodeMedicine, IllnessEpisode, Medicine, UsageLog } from "@/models";
import type { MedicineDocument } from "@/models/Medicine";

type DoseInput = {
  episodeId: string;
  medicineId?: string | null;
  medicineName: string;
  isFromKit: boolean;
  amount: number;
  unit: string;
  takenAt?: Date;
  notes?: string;
  overrideIntervalWarning?: boolean;
};

export async function applyDoseAndLog(input: DoseInput) {
  const takenAt = input.takenAt ?? new Date();
  let warning: string | null = null;

  let medicineDoc: HydratedDocument<MedicineDocument> | null = null;

  if (input.isFromKit && input.medicineId) {
    medicineDoc = await Medicine.findById(input.medicineId);
    if (!medicineDoc) {
      throw new Error("Medicine not found for kit dose");
    }

    if (medicineDoc.lastDoseTaken) {
      const hours = hoursSince(medicineDoc.lastDoseTaken);
      if (hours < medicineDoc.doseIntervalHours) {
        warning = `You took ${medicineDoc.name} ${Math.floor(hours)} hour(s) ago. Safe interval is ${medicineDoc.doseIntervalHours} hours.`;

        if (!input.overrideIntervalWarning) {
          return { warning, blockedByWarning: true };
        }
      }
    }

    medicineDoc.quantity = Math.max(0, medicineDoc.quantity - input.amount);
    medicineDoc.lastDoseTaken = takenAt;
    medicineDoc.lastUsed = takenAt;
    medicineDoc.usageCount += 1;
    medicineDoc.isQuickAccess =
      medicineDoc.usageCount >= 5 || Date.now() - takenAt.getTime() <= 1000 * 60 * 60 * 24 * 7;
    await medicineDoc.save();
  }

  const episode = await IllnessEpisode.findById(input.episodeId);
  if (!episode) {
    throw new Error("Episode not found");
  }

  let episodeMedicine = await EpisodeMedicine.findOne({
    episodeId: input.episodeId,
    medicineId: input.medicineId ? new Types.ObjectId(input.medicineId) : null,
    medicineName: input.medicineName,
  });

  if (!episodeMedicine) {
    episodeMedicine = await EpisodeMedicine.create({
      episodeId: input.episodeId,
      medicineId: input.medicineId ? new Types.ObjectId(input.medicineId) : null,
      medicineName: input.medicineName,
      isFromKit: input.isFromKit,
    });
  }

  const dose = await EpisodeDose.create({
    episodeMedicineId: episodeMedicine._id,
    episodeId: input.episodeId,
    medicineId: input.medicineId ? new Types.ObjectId(input.medicineId) : null,
    medicineName: input.medicineName,
    isFromKit: input.isFromKit,
    amount: input.amount,
    unit: input.unit,
    takenAt,
    notes: input.notes ?? "",
  });

  await UsageLog.create({
    medicineId: input.medicineId ? new Types.ObjectId(input.medicineId) : null,
    medicineName: input.medicineName,
    episodeId: input.episodeId,
    episodeMedicineId: episodeMedicine._id,
    isFromKit: input.isFromKit,
    amount: input.amount,
    unit: input.unit,
    takenAt,
    notes: input.notes ?? "",
  });

  return { warning, blockedByWarning: false, dose, medicine: medicineDoc };
}

