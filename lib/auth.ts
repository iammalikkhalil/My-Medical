import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

import { env } from "@/lib/env";

const COOKIE_NAME = "medkit_session";

type SessionPayload = {
  username: string;
};

const encoder = new TextEncoder();

function getSecret() {
  return encoder.encode(env.SESSION_SECRET);
}

export async function createSessionToken(username: string, rememberMe: boolean) {
  const now = Math.floor(Date.now() / 1000);
  const expiration = rememberMe ? "30d" : "12h";

  return new SignJWT({ username })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt(now)
    .setExpirationTime(expiration)
    .sign(getSecret());
}

export async function verifySessionToken(token: string | undefined | null): Promise<SessionPayload | null> {
  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      algorithms: ["HS256"],
    });

    if (typeof payload.username !== "string" || !payload.username.length) {
      return null;
    }

    return { username: payload.username };
  } catch {
    return null;
  }
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

export function getSessionCookieName() {
  return COOKIE_NAME;
}

