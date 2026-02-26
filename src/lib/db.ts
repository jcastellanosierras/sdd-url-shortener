import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "node:path";

const dbUrl = process.env.DATABASE_URL?.startsWith("file:")
  ? process.env.DATABASE_URL
  : "file:./prisma/dev.db";
const dbPath = dbUrl.replace(/^file:/, "");
const resolvedPath = path.isAbsolute(dbPath)
  ? dbPath
  : path.join(process.cwd(), dbPath);

const adapter = new PrismaBetterSqlite3({ url: `file:${resolvedPath}` });

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
