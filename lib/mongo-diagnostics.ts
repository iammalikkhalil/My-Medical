import dns from "node:dns";
import net from "node:net";

export type MongoDiagnosticCheck = {
  name: string;
  ok: boolean;
  detail: string;
};

export type MongoDiagnosticResult = {
  sanitizedUri: string;
  isSrvUri: boolean;
  hosts: string[];
  checks: MongoDiagnosticCheck[];
};

function parseHostPort(value: string) {
  const [host, portRaw] = value.split(":");
  const port = portRaw ? Number(portRaw) : 27017;
  return { host, port: Number.isFinite(port) ? port : 27017 };
}

export function sanitizeMongoUri(uri: string) {
  return uri.replace(/:\/\/([^:/?#]+):([^@/]+)@/, "://$1:***@");
}

export function extractMongoHosts(uri: string) {
  const stripped = uri.replace(/^mongodb(\+srv)?:\/\//, "");
  const withoutAuth = stripped.includes("@") ? stripped.split("@").slice(1).join("@") : stripped;
  const hostPart = withoutAuth.split("/")[0]?.split("?")[0] ?? "";
  return hostPart
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseTxtOptions(txtRecords: string[][]) {
  const params = new URLSearchParams();

  for (const recordParts of txtRecords) {
    const record = recordParts.join("");
    const chunks = record.split("&").map((item) => item.trim()).filter(Boolean);
    for (const chunk of chunks) {
      const [key, value = ""] = chunk.split("=");
      if (key) {
        params.set(key, value);
      }
    }
  }

  return params;
}

export async function buildDirectMongoUriFromSrv(uri: string) {
  if (!uri.startsWith("mongodb+srv://")) {
    return null;
  }

  const parsed = new URL(uri);
  const resolver = new dns.promises.Resolver();
  resolver.setServers(dns.getServers());

  const baseHost = parsed.hostname;
  const srvRecord = `_mongodb._tcp.${baseHost}`;

  const [srvRecords, txtRecords] = await Promise.all([
    resolver.resolveSrv(srvRecord),
    resolver.resolveTxt(baseHost).catch(() => [] as string[][]),
  ]);

  if (!srvRecords.length) {
    return null;
  }

  const mergedParams = new URLSearchParams(parsed.searchParams.toString());
  const txtParams = parseTxtOptions(txtRecords);

  txtParams.forEach((value, key) => {
    if (!mergedParams.has(key)) {
      mergedParams.set(key, value);
    }
  });

  if (!mergedParams.has("tls") && !mergedParams.has("ssl")) {
    mergedParams.set("tls", "true");
  }

  const auth =
    parsed.username || parsed.password
      ? `${encodeURIComponent(parsed.username)}:${encodeURIComponent(parsed.password)}@`
      : "";

  const hosts = srvRecords.map((entry) => `${entry.name}:${entry.port}`).join(",");
  const dbPath = parsed.pathname && parsed.pathname !== "/" ? parsed.pathname : "";
  const query = mergedParams.toString();

  return `mongodb://${auth}${hosts}${dbPath}${query ? `?${query}` : ""}`;
}

async function testTcp(host: string, port: number, timeoutMs: number) {
  return new Promise<{ ok: boolean; detail: string }>((resolve) => {
    const socket = new net.Socket();

    const done = (ok: boolean, detail: string) => {
      socket.destroy();
      resolve({ ok, detail });
    };

    socket.setTimeout(timeoutMs);

    socket.once("connect", () => done(true, `${host}:${port} reachable`));
    socket.once("timeout", () => done(false, `${host}:${port} timed out after ${timeoutMs}ms`));
    socket.once("error", (error) => {
      done(false, `${host}:${port} ${error.name} ${(error as NodeJS.ErrnoException).code ?? error.message}`);
    });

    socket.connect(port, host);
  });
}

export async function runMongoDiagnostics(uri: string, timeoutMs = 5000): Promise<MongoDiagnosticResult> {
  const checks: MongoDiagnosticCheck[] = [];
  const isSrvUri = uri.startsWith("mongodb+srv://");
  const hosts = extractMongoHosts(uri);
  const sanitizedUri = sanitizeMongoUri(uri);
  const resolver = new dns.promises.Resolver();
  resolver.setServers(dns.getServers());

  if (!hosts.length) {
    checks.push({ name: "uri-parse", ok: false, detail: "Could not parse host(s) from MONGODB_URI" });
    return { sanitizedUri, isSrvUri, hosts, checks };
  }

  checks.push({ name: "uri-parse", ok: true, detail: `Parsed hosts: ${hosts.join(", ")}` });
  checks.push({
    name: "dns-servers",
    ok: true,
    detail: `Using resolver servers: ${dns.getServers().join(", ") || "(system default)"}`,
  });

  if (isSrvUri) {
    const baseHost = hosts[0];
    const srvRecord = `_mongodb._tcp.${baseHost}`;
    let srvHosts: Array<{ name: string; port: number }> = [];

    try {
      const srv = await resolver.resolveSrv(srvRecord);
      srvHosts = srv;
      checks.push({
        name: "dns-srv",
        ok: true,
        detail: `${srvRecord} -> ${srv.map((entry) => `${entry.name}:${entry.port}`).join(", ")}`,
      });

      for (const entry of srv) {
        const tcp = await testTcp(entry.name, entry.port, timeoutMs);
        checks.push({
          name: `tcp-${entry.name}:${entry.port}`,
          ok: tcp.ok,
          detail: tcp.detail,
        });
      }
    } catch (error) {
      const err = error as NodeJS.ErrnoException;
      checks.push({
        name: "dns-srv",
        ok: false,
        detail: `${srvRecord} -> ${err.code ?? err.name}: ${err.message}`,
      });
    }

    try {
      const txt = await resolver.resolveTxt(baseHost);
      checks.push({
        name: "dns-txt",
        ok: true,
        detail: `${baseHost} TXT records found (${txt.length})`,
      });
    } catch (error) {
      const err = error as NodeJS.ErrnoException;
      checks.push({
        name: "dns-txt",
        ok: false,
        detail: `${baseHost} TXT lookup -> ${err.code ?? err.name}: ${err.message}`,
      });
    }

    if (srvHosts.length) {
      for (const shard of srvHosts) {
        try {
          const records = await resolver.resolve4(shard.name);
          checks.push({
            name: `dns-a-${shard.name}`,
            ok: records.length > 0,
            detail: `${shard.name} -> ${records.join(", ")}`,
          });
        } catch (error) {
          const err = error as NodeJS.ErrnoException;
          checks.push({
            name: `dns-a-${shard.name}`,
            ok: false,
            detail: `${shard.name} -> ${err.code ?? err.name}: ${err.message}`,
          });
        }
      }
    }
  } else {
    for (const hostEntry of hosts) {
      const { host, port } = parseHostPort(hostEntry);

      try {
        const records = await resolver.resolve4(host);
        checks.push({
          name: `dns-lookup-${host}`,
          ok: records.length > 0,
          detail: `${host} -> ${records.join(", ")}`,
        });
      } catch (error) {
        const err = error as NodeJS.ErrnoException;
        checks.push({
          name: `dns-lookup-${host}`,
          ok: false,
          detail: `${host} -> ${err.code ?? err.name}: ${err.message}`,
        });
      }

      const tcp = await testTcp(host, port, timeoutMs);
      checks.push({
        name: `tcp-${host}:${port}`,
        ok: tcp.ok,
        detail: tcp.detail,
      });
    }
  }

  return { sanitizedUri, isSrvUri, hosts, checks };
}

export function formatMongoDiagnostics(result: MongoDiagnosticResult) {
  const lines = [
    "[Mongo Diagnostics]",
    `- URI: ${result.sanitizedUri}`,
    `- Type: ${result.isSrvUri ? "mongodb+srv" : "mongodb"}`,
    `- Hosts: ${result.hosts.join(", ")}`,
    "- Checks:",
    ...result.checks.map((check) => `  - ${check.ok ? "OK" : "FAIL"} ${check.name}: ${check.detail}`),
  ];

  const srvRefused = result.checks.some(
    (check) => check.name === "dns-srv" && check.detail.includes("ECONNREFUSED"),
  );

  if (srvRefused) {
    lines.push("- Hint: DNS SRV lookup is being refused by your resolver/network.");
    lines.push("  Try changing DNS to 8.8.8.8 / 1.1.1.1 and run `ipconfig /flushdns` on Windows.");
    lines.push("  You can also test with a non-SRV `mongodb://` URI from Atlas as a temporary workaround.");
  }

  return lines.join("\n");
}
