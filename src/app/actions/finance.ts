"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

export async function addTransaction(
  amount: number,
  description: string,
  category: string,
  type: "INCOME" | "EXPENSE",
  title?: string,
  isSavings: boolean = false
) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    await (db.transaction.create as any)({
      data: { 
        amount: Number(amount), 
        description, 
        category, 
        type, 
        title,
        isSavings,
        date: new Date(),
        userId: session.user.id
      },
    });
    revalidatePath("/finance");
    revalidatePath("/dashboard");
    revalidatePath("/savings");
  } catch (error) {
    console.error("İşlem ekleme hatası:", error);
    throw new Error("İşlem eklenemedi.");
  }
}

export async function updateTransaction(
  id: string,
  amount: number,
  description: string,
  category: string,
  type: "INCOME" | "EXPENSE",
  title?: string,
  isSavings?: boolean
) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    await (db.transaction.update as any)({
      where: { id, userId: session.user.id },
      data: { 
        amount: Number(amount), 
        description, 
        category, 
        type, 
        title,
        isSavings
      },
    });
    revalidatePath("/finance");
    revalidatePath("/dashboard");
    revalidatePath("/savings");
  } catch (error) {
    console.error("İşlem güncelleme hatası:", error);
    throw new Error("İşlem güncellenemedi.");
  }
}

export async function deleteTransaction(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    await db.transaction.delete({
      where: { id, userId: session.user.id },
    });
    revalidatePath("/finance");
    revalidatePath("/dashboard");
    revalidatePath("/savings");
  } catch (error) {
    console.error("İşlem silme hatası:", error);
    throw new Error("İşlem silinemedi.");
  }
}

export async function getFinanceSummary(isSavings: boolean = false, includeTransactions: boolean = true) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { totalIncome: 0, totalExpense: 0, balance: 0, transactions: [] };

    // Get sums by type using database aggregation (much faster)
    const stats = await db.transaction.groupBy({
      by: ['type'],
      where: { userId: session.user.id, isSavings },
      _sum: {
        amount: true
      }
    });

    const income = stats.find(s => s.type === "INCOME")?._sum.amount || 0;
    const expense = stats.find(s => s.type === "EXPENSE")?._sum.amount || 0;

    // Fetch transactions only if requested
    let transactions: any[] = [];
    if (includeTransactions) {
      transactions = await db.transaction.findMany({
        where: { userId: session.user.id, isSavings },
        orderBy: { date: "desc" },
        take: 50
      });
      transactions = JSON.parse(JSON.stringify(transactions));
    }

    return {
      totalIncome: income,
      totalExpense: expense,
      balance: income - expense,
      transactions
    };
  } catch (error) {
    console.error("Finans özeti hatası:", error);
    return { totalIncome: 0, totalExpense: 0, balance: 0, transactions: [] };
  }
}

export async function getChartData(isSavings: boolean = false) {
  try {
    const session = await auth();
    if (!session?.user?.id) return [];

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    const transactions = await db.transaction.findMany({
      where: {
        userId: session.user.id,
        isSavings,
        date: { gte: startDate }
      },
      select: {
        amount: true,
        type: true,
        date: true
      },
      orderBy: { date: "asc" }
    });

    const dailyData: Record<string, { name: string, " gelir": number, " gider": number }> = {};
    
    // Initialize days in one pass
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString("tr-TR", { weekday: "short" });
      dailyData[dateStr] = { name: dateStr, " gelir": 0, " gider": 0 };
    }

    transactions.forEach(t => {
      const dateStr = new Date(t.date).toLocaleDateString("tr-TR", { weekday: "short" });
      if (dailyData[dateStr]) {
        const amt = Number(t.amount);
        if (t.type === "INCOME") dailyData[dateStr][" gelir"] += amt;
        else dailyData[dateStr][" gider"] += amt;
      }
    });

    return Object.values(dailyData);
  } catch (error) {
    console.error("Grafik verisi hatası:", error);
    return [];
  }
}
