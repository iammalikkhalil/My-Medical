import { NextRequest } from "next/server";

import { ok, serverError } from "@/lib/api";
import { connectToDatabase } from "@/lib/mongodb";
import { getNumberQuery, requireApiAuth } from "@/lib/route-helpers";
import { UsageLog } from "@/models";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireApiAuth();
    if (!auth.ok) return auth.response;

    await connectToDatabase();

    const medicineId = request.nextUrl.searchParams.get("medicineId");
    const episodeId = request.nextUrl.searchParams.get("episodeId");
    const limit = getNumberQuery(request, "limit") ?? 100;

    const logs = await UsageLog.find({
      ...(medicineId ? { medicineId } : {}),
      ...(episodeId ? { episodeId } : {}),
    })
      .sort({ takenAt: -1 })
      .limit(Math.min(500, limit));

    return ok(logs);
  } catch (error) {
    return serverError(error);
  }
}

