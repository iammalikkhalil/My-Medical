import dns from "node:dns";

import { env } from "@/lib/env";

let applied = false;

export function applyMongoDnsOverrides() {
  if (applied) return;

  const configured = env.MONGODB_DNS_SERVERS?.split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (!configured?.length) {
    return;
  }

  dns.setServers(configured);
  applied = true;

  if (env.MONGODB_DEBUG === "1" || env.MONGODB_DEBUG.toLowerCase() === "true") {
    console.log("[Mongo] DNS override applied", { servers: dns.getServers() });
  }
}
