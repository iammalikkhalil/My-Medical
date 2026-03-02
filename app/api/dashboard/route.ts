import { subDays } from "date-fns";

import { ok, serverError } from "@/lib/api";
import { connectToDatabase } from "@/lib/mongodb";
import { requireApiAuth } from "@/lib/route-helpers";
import { EpisodeDose, IllnessEpisode, Medicine } from "@/models";

export async function GET() {
  try {
    const auth = await requireApiAuth();
    if (!auth.ok) return auth.response;

    await connectToDatabase();

    const [activeEpisode, lowStock, expiring, quickAccess, recentDoses, recentEpisodes] = await Promise.all([
      IllnessEpisode.findOne({ isOngoing: true }).sort({ startDate: -1 }).lean(),
      Medicine.find({ isActive: true, quantity: { $lte: 3 } }).sort({ quantity: 1 }).limit(20).lean(),
      Medicine.find({
        isActive: true,
        expiryDate: { $gte: new Date(), $lte: subDays(new Date(), -30) },
      })
        .sort({ expiryDate: 1 })
        .limit(20)
        .lean(),
      Medicine.find({ isActive: true, isQuickAccess: true }).sort({ lastUsed: -1, usageCount: -1 }).limit(20).lean(),
      EpisodeDose.find().sort({ takenAt: -1 }).limit(10).lean(),
      IllnessEpisode.find().sort({ startDate: -1 }).limit(3).lean(),
    ]);

    return ok({ activeEpisode, lowStock, expiring, quickAccess, recentDoses, recentEpisodes });
  } catch (error) {
    return serverError(error);
  }
}

