import { NextResponse } from "next/server";

import { fail, serverError } from "@/lib/api";
import { createSessionToken, getSessionCookieName } from "@/lib/auth";
import { env } from "@/lib/env";
import { parseBody, loginSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const input = await parseBody(request, loginSchema);

    if (input.username !== env.APP_USERNAME || input.password !== env.APP_PASSWORD) {
      return fail("Invalid credentials", 401);
    }

    const token = await createSessionToken(input.username, input.rememberMe);
    const response = NextResponse.json({ success: true, data: { authenticated: true } });

    response.cookies.set({
      name: getSessionCookieName(),
      value: token,
      httpOnly: true,
      sameSite: "lax",
      secure: env.NODE_ENV === "production",
      path: "/",
      ...(input.rememberMe ? { maxAge: 60 * 60 * 24 * 30 } : {}),
    });

    return response;
  } catch (error) {
    return serverError(error);
  }
}

