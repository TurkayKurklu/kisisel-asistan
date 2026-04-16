"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { getFinanceSummary } from "./finance";
import { startOfDay, endOfDay } from "date-fns";

export async function getDashboardData() {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const userId = session.user.id;
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);

    // Parallel focused queries
    const [todayTasks, todayEvents, nextTask, finance, savings] = await Promise.all([
      // 1. Only today's tasks
      db.task.findMany({
        where: { userId, date: { gte: todayStart, lte: todayEnd } },
        orderBy: { date: "asc" }
      }),
      // 2. Only today's events
      db.event.findMany({
        where: { userId, date: { gte: todayStart, lte: todayEnd } },
        orderBy: { date: "asc" }
      }),
      // 3. Just the single closest upcoming task
      db.task.findFirst({
        where: { userId, isCompleted: false, date: { gte: now } },
        orderBy: { date: "asc" }
      }),
      // 4. Balances only, no transactions
      getFinanceSummary(false, false),
      getFinanceSummary(true, false)
    ]);

    return {
      tasks: todayTasks,
      events: todayEvents,
      finance,
      savingsBalance: savings.balance,
      nextTask: nextTask || null
    };
  } catch (error) {
    console.error("Dashboard optimization error:", error);
    return { tasks: [], events: [], finance: { balance: 0 }, savingsBalance: 0, nextTask: null };
  }
}
