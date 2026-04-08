import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    // Try a simple query
    const taskCount = await db.task.count();
    const firstTask = await db.task.findFirst();

    return NextResponse.json({
      status: "healthy",
      database: "connected",
      taskCount,
      sampleTask: firstTask ? { id: firstTask.id, title: firstTask.title } : null,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("DEBUG API ERROR:", error);
    return NextResponse.json({
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error",
      error: String(error)
    }, { status: 500 });
  }
}
