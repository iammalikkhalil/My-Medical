import { ok } from "@/lib/api";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  return ok({ authenticated: !!session, username: session?.username ?? null });
}

