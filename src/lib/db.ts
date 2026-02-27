import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import path from "node:path";

const useTurso =
  typeof process.env.TURSO_DATABASE_URL === "string" &&
  process.env.TURSO_DATABASE_URL.length > 0 &&
  typeof process.env.TURSO_AUTH_TOKEN === "string" &&
  process.env.TURSO_AUTH_TOKEN.length > 0;

let adapter: PrismaBetterSqlite3 | PrismaLibSql;

if (useTurso) {
  adapter = new PrismaLibSql({
    url: process.env.TURSO_DATABASE_URL as string,
    authToken: process.env.TURSO_AUTH_TOKEN as string,
  });
} else {
  const dbUrl = process.env.DATABASE_URL?.startsWith("file:")
    ? process.env.DATABASE_URL
    : "file:./prisma/dev.db";
  const dbPath = dbUrl.replace(/^file:/, "");
  const resolvedPath = path.isAbsolute(dbPath)
    ? dbPath
    : path.join(process.cwd(), dbPath);
  adapter = new PrismaBetterSqlite3({ url: `file:${resolvedPath}` });
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
