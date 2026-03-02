import { ok, serverError } from "@/lib/api";
import { getInsightsPayload } from "@/lib/insights";
import { connectToDatabase } from "@/lib/mongodb";
import { requireApiAuth } from "@/lib/route-helpers";

export async function GET() {
  try {
    const auth = await requireApiAuth();
    if (!auth.ok) return auth.response;

    await connectToDatabase();
    const insights = await getInsightsPayload();

    return ok(insights);
  } catch (error) {
    return serverError(error);
  }
}

