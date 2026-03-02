import { NextRequest } from "next/server";

import { fail } from "@/lib/api";
import { getSession } from "@/lib/auth";

export async function requireApiAuth() {
  const session = await getSession();
  if (!session) {
    return { ok: false as const, response: fail("Unauthorized", 401) };
  }

  return { ok: true as const, session };
}

export function getBooleanQuery(request: NextRequest, key: string) {
  const value = request.nextUrl.searchParams.get(key);
  if (!value) {
    return false;
  }

  return value === "true" || value === "1";
}

export function getNumberQuery(request: NextRequest, key: string) {
  const value = request.nextUrl.searchParams.get(key);
  if (!value) {
    return null;
  }

  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
}

