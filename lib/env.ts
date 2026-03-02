import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  MONGODB_DB_NAME: z.string().optional(),
  MONGODB_DEBUG: z.string().default("false"),
  MONGODB_DNS_SERVERS: z.string().optional(),
  MONGODB_SERVER_SELECTION_TIMEOUT_MS: z.coerce.number().int().positive().default(15000),
  MONGODB_CONNECT_TIMEOUT_MS: z.coerce.number().int().positive().default(15000),
  MONGODB_SOCKET_TIMEOUT_MS: z.coerce.number().int().positive().default(20000),
  APP_USERNAME: z.string().min(1).default("admin"),
  APP_PASSWORD: z.string().min(1).default("medkit2024"),
  SESSION_SECRET: z.string().min(32, "SESSION_SECRET must be at least 32 chars"),
});

const parsedEnv = envSchema.safeParse({
  NODE_ENV: process.env.NODE_ENV,
  MONGODB_URI: process.env.MONGODB_URI,
  MONGODB_DB_NAME: process.env.MONGODB_DB_NAME,
  MONGODB_DEBUG: process.env.MONGODB_DEBUG,
  MONGODB_DNS_SERVERS: process.env.MONGODB_DNS_SERVERS,
  MONGODB_SERVER_SELECTION_TIMEOUT_MS: process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS,
  MONGODB_CONNECT_TIMEOUT_MS: process.env.MONGODB_CONNECT_TIMEOUT_MS,
  MONGODB_SOCKET_TIMEOUT_MS: process.env.MONGODB_SOCKET_TIMEOUT_MS,
  APP_USERNAME: process.env.APP_USERNAME,
  APP_PASSWORD: process.env.APP_PASSWORD,
  SESSION_SECRET: process.env.SESSION_SECRET,
});

if (!parsedEnv.success) {
  const issues = parsedEnv.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ");
  throw new Error(`Invalid environment variables: ${issues}`);
}

export const env = parsedEnv.data;

