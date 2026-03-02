import { startOfYear } from "date-fns";

import { EpisodeDose, IllnessEpisode, Medicine } from "@/models";

export async function getInsightsPayload() {
  const yearStart = startOfYear(new Date());

  const illnessFrequency = await IllnessEpisode.aggregate([
    { $match: { startDate: { $gte: yearStart } } },
    { $group: { _id: "$name", count: { $sum: 1 }, lastDate: { $max: "$startDate" } } },
    { $sort: { count: -1 } },
  ]);

  const effectiveMedicines = await EpisodeDose.aggregate([
    { $match: { wasEffective: true, medicineName: { $ne: null } } },
    { $group: { _id: "$medicineName", effectiveCount: { $sum: 1 }, total: { $sum: 1 } } },
    {
      $project: {
        medicineName: "$_id",
        effectiveCount: 1,
        total: 1,
        rate: { $cond: [{ $eq: ["$total", 0] }, 0, { $divide: ["$effectiveCount", "$total"] }] },
      },
    },
    { $sort: { rate: -1, total: -1 } },
    { $limit: 10 },
  ]);

  const recoveryStats = await IllnessEpisode.aggregate([
    { $match: { durationDays: { $ne: null } } },
    {
      $group: {
        _id: null,
        averageRecoveryDays: { $avg: "$durationDays" },
        fastestRecoveryDays: { $min: "$durationDays" },
        longestRecoveryDays: { $max: "$durationDays" },
      },
    },
  ]);

  const mostUsedMedicines = await Medicine.find({ isActive: true })
    .sort({ usageCount: -1 })
    .limit(10)
    .select({ name: 1, usageCount: 1, quantity: 1, unit: 1 });

  const [expiredCount, outOfStockCount, expiringCount] = await Promise.all([
    Medicine.countDocuments({ isActive: true, expiryDate: { $lt: new Date() } }),
    Medicine.countDocuments({ isActive: true, quantity: { $lte: 0 } }),
    Medicine.countDocuments({
      isActive: true,
      expiryDate: { $gte: new Date(), $lte: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60) },
    }),
  ]);

  return {
    illnessFrequency,
    effectiveMedicines,
    averageRecovery: recoveryStats[0] ?? {
      averageRecoveryDays: null,
      fastestRecoveryDays: null,
      longestRecoveryDays: null,
    },
    mostUsedMedicines,
    kitHealth: {
      expiredCount,
      outOfStockCount,
      expiringCount,
    },
  };
}

