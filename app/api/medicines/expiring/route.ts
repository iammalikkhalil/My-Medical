import { addDays } from "date-fns";

import { ok, serverError } from "@/lib/api";
import { connectToDatabase } from "@/lib/mongodb";
import { requireApiAuth } from "@/lib/route-helpers";
import { Medicine } from "@/models";

export async function GET() {
  try {
    const auth = await requireApiAuth();
    if (!auth.ok) return auth.response;

    await connectToDatabase();

    const now = new Date();
    const medicines = await Medicine.find({
      isActive: true,
      expiryDate: { $gte: now, $lte: addDays(now, 30) },
    }).sort({ expiryDate: 1 });

    return ok(medicines);
  } catch (error) {
    return serverError(error);
  }
}

