import { NextRequest } from "next/server";

import { ok, serverError } from "@/lib/api";
import { connectToDatabase } from "@/lib/mongodb";
import { requireApiAuth } from "@/lib/route-helpers";
import { Symptom } from "@/models/Symptom";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireApiAuth();
    if (!auth.ok) return auth.response;

    await connectToDatabase();
    const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";

    const symptoms = await Symptom.find({
      isActive: true,
      ...(q.length
        ? {
            $or: [
              { name: { $regex: q, $options: "i" } },
              { slug: { $regex: q, $options: "i" } },
            ],
          }
        : {}),
    })
      .sort({ isCommon: -1, sortOrder: 1, name: 1 })
      .limit(50);

    return ok(symptoms);
  } catch (error) {
    return serverError(error);
  }
}

