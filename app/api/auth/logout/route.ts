import { NextResponse } from "next/server";

import { getSessionCookieName } from "@/lib/auth";
import { env } from "@/lib/env";

export async function POST() {
  const response = NextResponse.json({ success: true, data: { authenticated: false } });

  response.cookies.set({
    name: getSessionCookieName(),
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return response;
}

