import mongoose from "mongoose";

import { env } from "@/lib/env";
import {
  buildDirectMongoUriFromSrv,
  formatMongoDiagnostics,
  runMongoDiagnostics,
  sanitizeMongoUri,
} from "@/lib/mongo-diagnostics";
import { applyMongoDnsOverrides } from "@/lib/mongo-dns";

type CachedMongoose = {
  connection: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {  var __mongooseCache: CachedMongoose | undefined;
}

const cache = global.__mongooseCache ?? { connection: null, promise: null };
global.__mongooseCache = cache;

const isMongoDebugEnabled = env.MONGODB_DEBUG === "1" || env.MONGODB_DEBUG.toLowerCase() === "true";
let mongoEventLoggingInitialized = false;

function initMongoEventLogging() {
  if (!isMongoDebugEnabled || mongoEventLoggingInitialized) {
    return;
  }

  mongoEventLoggingInitialized = true;

  mongoose.connection.on("connecting", () => {
    console.log("[Mongo] Event: connecting");
  });
  mongoose.connection.on("connected", () => {
    console.log("[Mongo] Event: connected");
  });
  mongoose.connection.on("disconnecting", () => {
    console.log("[Mongo] Event: disconnecting");
  });
  mongoose.connection.on("disconnected", () => {
    console.log("[Mongo] Event: disconnected");
  });
  mongoose.connection.on("error", (error) => {
    const err = error as NodeJS.ErrnoException;
    console.error("[Mongo] Event: error", {
      name: err.name,
      message: err.message,
      code: err.code,
      errno: err.errno,
      syscall: err.syscall,
      hostname: (err as NodeJS.ErrnoException & { hostname?: string }).hostname,
    });
  });
}

function isSrvResolutionFailure(error: unknown) {
  const err = error as NodeJS.ErrnoException;
  const message = err?.message ?? "";
  return err?.syscall === "querySrv" || message.includes("querySrv");
}

export async function connectToDatabase() {
  applyMongoDnsOverrides();

  if (cache.connection) {
    return cache.connection;
  }

  initMongoEventLogging();

  if (!cache.promise) {
    if (isMongoDebugEnabled) {
      console.log("[Mongo] connect() starting", {
        uri: sanitizeMongoUri(env.MONGODB_URI),
        dbNameOverride: env.MONGODB_DB_NAME ?? null,
        serverSelectionTimeoutMS: env.MONGODB_SERVER_SELECTION_TIMEOUT_MS,
        connectTimeoutMS: env.MONGODB_CONNECT_TIMEOUT_MS,
        socketTimeoutMS: env.MONGODB_SOCKET_TIMEOUT_MS,
      });
    }

    cache.promise = mongoose
      .connect(env.MONGODB_URI, {
        ...(env.MONGODB_DB_NAME ? { dbName: env.MONGODB_DB_NAME } : {}),
        autoIndex: true,
        serverSelectionTimeoutMS: env.MONGODB_SERVER_SELECTION_TIMEOUT_MS,
        connectTimeoutMS: env.MONGODB_CONNECT_TIMEOUT_MS,
        socketTimeoutMS: env.MONGODB_SOCKET_TIMEOUT_MS,
      })
      .catch(async (error) => {
        const err = error as NodeJS.ErrnoException;

        console.error("[Mongo] connect() failed", {
          name: err.name,
          message: err.message,
          code: err.code,
          errno: err.errno,
          syscall: err.syscall,
          hostname: (err as NodeJS.ErrnoException & { hostname?: string }).hostname,
        });

        if (isSrvResolutionFailure(error)) {
          try {
            const fallbackUri = await buildDirectMongoUriFromSrv(env.MONGODB_URI);
            if (fallbackUri) {
              console.warn("[Mongo] SRV connect failed, retrying with direct hosts URI", {
                uri: sanitizeMongoUri(fallbackUri),
              });

              const fallbackConnection = await mongoose.connect(fallbackUri, {
                ...(env.MONGODB_DB_NAME ? { dbName: env.MONGODB_DB_NAME } : {}),
                autoIndex: true,
                serverSelectionTimeoutMS: env.MONGODB_SERVER_SELECTION_TIMEOUT_MS,
                connectTimeoutMS: env.MONGODB_CONNECT_TIMEOUT_MS,
                socketTimeoutMS: env.MONGODB_SOCKET_TIMEOUT_MS,
              });

              console.log("[Mongo] direct-host fallback connected successfully");
              return fallbackConnection;
            }
          } catch (fallbackError) {
            const fallbackErr = fallbackError as NodeJS.ErrnoException;
            console.error("[Mongo] direct-host fallback failed", {
              name: fallbackErr.name,
              message: fallbackErr.message,
              code: fallbackErr.code,
              errno: fallbackErr.errno,
              syscall: fallbackErr.syscall,
            });
          }
        }

        cache.promise = null;

        if (isMongoDebugEnabled) {
          try {
            const diagnostics = await runMongoDiagnostics(env.MONGODB_URI, 5000);
            console.error(formatMongoDiagnostics(diagnostics));
          } catch (diagnosticError) {
            console.error("[Mongo Diagnostics] failed to run", diagnosticError);
          }
        }

        throw error;
      });
  }

  cache.connection = await cache.promise;
  return cache.connection;
}


