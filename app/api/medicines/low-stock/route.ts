import { ok, serverError } from "@/lib/api";
import { connectToDatabase } from "@/lib/mongodb";
import { requireApiAuth } from "@/lib/route-helpers";
import { Medicine } from "@/models";

export async function GET() {
  try {
    const auth = await requireApiAuth();
    if (!auth.ok) return auth.response;

    await connectToDatabase();
    const medicines = await Medicine.find({ isActive: true, quantity: { $lte: 3 } }).sort({ quantity: 1, name: 1 });
    return ok(medicines);
  } catch (error) {
    return serverError(error);
  }
}

