import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Veritabanı bağlantısını ve Transaction tablosunu test et
    const data = await db.transaction.findMany({
      take: 1,
    });

    return NextResponse.json({
      status: "success",
      message: "Database connection is healthy 🚀",
      count: data.length,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("DATABASE_CONNECTION_ERROR:", error);

    return NextResponse.json(
      {
        status: "error",
        message: "Database connection failed ❌",
        error: error.message,
        cause: error.cause
      },
      { status: 500 }
    );
  }
}
