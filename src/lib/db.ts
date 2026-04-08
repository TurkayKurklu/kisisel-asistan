import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// ✅ Serverless (Vercel) için optimize edilmiş bağlantı ayarları
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined ❌");
}

// Neon/Serverless için optimize edilmiş Pool ayarları
const pool = new Pool({ 
  connectionString,
  max: 10, // Max connection sayısı
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000, // Daha hızlı timeout
});

const adapter = new PrismaPg(pool);

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}