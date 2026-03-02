import "dotenv/config";

import mongoose from "mongoose";

import { env } from "@/lib/env";
import { applyMongoDnsOverrides } from "@/lib/mongo-dns";
import {
  buildDirectMongoUriFromSrv,
  formatMongoDiagnostics,
  runMongoDiagnostics,
  sanitizeMongoUri,
} from "@/lib/mongo-diagnostics";

async function main() {
  applyMongoDnsOverrides();
  console.log("[Mongo Debug] Starting diagnostics...");
  console.log(`[Mongo Debug] URI: ${sanitizeMongoUri(env.MONGODB_URI)}`);

  const diagnostics = await runMongoDiagnostics(env.MONGODB_URI, 5000);
  console.log(formatMongoDiagnostics(diagnostics));

  console.log("[Mongo Debug] Trying actual mongoose connection...");

  try {
    await mongoose.connect(env.MONGODB_URI, {
      ...(env.MONGODB_DB_NAME ? { dbName: env.MONGODB_DB_NAME } : {}),
      serverSelectionTimeoutMS: env.MONGODB_SERVER_SELECTION_TIMEOUT_MS,
      connectTimeoutMS: env.MONGODB_CONNECT_TIMEOUT_MS,
      socketTimeoutMS: env.MONGODB_SOCKET_TIMEOUT_MS,
    });

    console.log("[Mongo Debug] Mongoose connection successful.");
    await mongoose.disconnect();
    console.log("[Mongo Debug] Disconnected cleanly.");
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    console.error("[Mongo Debug] Mongoose connection failed", {
      name: err.name,
      message: err.message,
      code: err.code,
      errno: err.errno,
      syscall: err.syscall,
      hostname: (err as NodeJS.ErrnoException & { hostname?: string }).hostname,
    });

    if ((err.syscall === "querySrv" || err.message.includes("querySrv")) && env.MONGODB_URI.startsWith("mongodb+srv://")) {
      try {
        const fallbackUri = await buildDirectMongoUriFromSrv(env.MONGODB_URI);
        if (fallbackUri) {
          console.log(`[Mongo Debug] Trying direct-host fallback: ${sanitizeMongoUri(fallbackUri)}`);
          await mongoose.connect(fallbackUri, {
            ...(env.MONGODB_DB_NAME ? { dbName: env.MONGODB_DB_NAME } : {}),
            serverSelectionTimeoutMS: env.MONGODB_SERVER_SELECTION_TIMEOUT_MS,
            connectTimeoutMS: env.MONGODB_CONNECT_TIMEOUT_MS,
            socketTimeoutMS: env.MONGODB_SOCKET_TIMEOUT_MS,
          });
          console.log("[Mongo Debug] Direct-host fallback connection successful.");
          await mongoose.disconnect();
          return;
        }
      } catch (fallbackError) {
        const fallbackErr = fallbackError as NodeJS.ErrnoException;
        console.error("[Mongo Debug] Direct-host fallback failed", {
          name: fallbackErr.name,
          message: fallbackErr.message,
          code: fallbackErr.code,
          errno: fallbackErr.errno,
          syscall: fallbackErr.syscall,
        });
      }
    }

    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("[Mongo Debug] Fatal error", error);
  process.exitCode = 1;
});
