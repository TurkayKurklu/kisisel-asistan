"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function addTransaction(
  amount: number,
  description: string,
  category: string,
  type: "INCOME" | "EXPENSE",
  title?: string
) {
  try {
    await db.transaction.create({
      data: { amount, description, category, type, title },
    });
    revalidatePath("/(dashboard)/finance");
    revalidatePath("/(dashboard)/dashboard");
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
  title?: string
) {
  try {
    await db.transaction.update({
      where: { id },
      data: { amount, description, category, type, title },
    });
    revalidatePath("/(dashboard)/finance");
    revalidatePath("/(dashboard)/dashboard");
  } catch (error) {
    console.error("İşlem güncelleme hatası:", error);
    throw new Error("İşlem güncellenemedi.");
  }
}

export async function deleteTransaction(id: string) {
  try {
    await db.transaction.delete({
      where: { id },
    });
    revalidatePath("/finance");
    revalidatePath("/dashboard");
    revalidatePath("/(dashboard)/finance");
    revalidatePath("/(dashboard)/dashboard");
  } catch (error) {
    console.error("İşlem silme hatası:", error);
    throw new Error("İşlem silinemedi.");
  }
}

export async function getFinanceSummary() {
  try {
    const transactions = await db.transaction.findMany({
      orderBy: { date: "desc" }
    });
    const income = transactions
      .filter((t) => t.type === "INCOME")
      .reduce((acc, t) => acc + t.amount, 0);
    const expense = transactions
      .filter((t) => t.type === "EXPENSE")
      .reduce((acc, t) => acc + t.amount, 0);
    
    return {
      totalIncome: income,
      totalExpense: expense,
      balance: income - expense,
      transactions: transactions
    };
  } catch (error) {
    console.error("Finans özeti hatası:", error);
    return { totalIncome: 0, totalExpense: 0, balance: 0, transactions: [] };
  }
}

export async function getChartData() {
  try {
    const transactions = await db.transaction.findMany({
      where: {
        date: {
          gte: new Date(new Date().setDate(new Date().getDate() - 7))
        }
      },
      orderBy: { date: "asc" }
    });

    const dailyData: Record<string, { name: string, " gelir": number, " gider": number }> = {};
    
    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString("tr-TR", { weekday: "short" });
      dailyData[dateStr] = { name: dateStr, " gelir": 0, " gider": 0 };
    }

    transactions.forEach(t => {
      const dateStr = new Date(t.date).toLocaleDateString("tr-TR", { weekday: "short" });
      if (dailyData[dateStr]) {
        if (t.type === "INCOME") dailyData[dateStr][" gelir"] += t.amount;
        else dailyData[dateStr][" gider"] += t.amount;
      }
    });

    return Object.values(dailyData);
  } catch (error) {
    console.error("Chart data error:", error);
    return [];
  }
}
