"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

export async function addHabit(title: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const habit = await db.habit.create({
      data: { title, streak: 0, userId: session.user.id },
    });
    revalidatePath("/habits");
    revalidatePath("/dashboard");
    revalidatePath("/(dashboard)/habits");
    revalidatePath("/(dashboard)/dashboard");
    return habit;
  } catch (error) {
    console.error("Add habit error:", error);
    throw new Error("Alışkanlık eklenemedi.");
  }
}

export async function getHabits() {
  try {
    const session = await auth();
    if (!session?.user?.id) return [];

    return await db.habit.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Get habits error:", error);
    return [];
  }
}

export async function completeHabit(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const habit = await db.habit.findUnique({ 
      where: { id, userId: session.user.id } 
    });
    if (!habit) throw new Error("Alışkanlık bulunamadı.");

    const now = new Date();
    const lastCompleted = habit.lastCompletedDate;
    
    let newStreak = habit.streak + 1;
    
    // Simple reset if missed a day (optional, depending on UX)
    if (lastCompleted) {
      const diff = Math.floor((now.getTime() - lastCompleted.getTime()) / (1000 * 60 * 60 * 24));
      if (diff > 1) newStreak = 1; 
      if (diff === 0) return habit; // Already completed today
    }

    const updated = await db.habit.update({
      where: { id, userId: session.user.id },
      data: {
        streak: newStreak,
        lastCompletedDate: now,
      },
    });

    revalidatePath("/habits");
    revalidatePath("/dashboard");
    revalidatePath("/(dashboard)/habits");
    revalidatePath("/(dashboard)/dashboard");
    return updated;
  } catch (error) {
    console.error("Complete habit error:", error);
    throw new Error("Alışkanlık tamamlanamadı.");
  }
}

export async function deleteHabit(id: string) {
  try {
    await db.habit.delete({ where: { id } });
    revalidatePath("/habits");
    revalidatePath("/dashboard");
    revalidatePath("/(dashboard)/habits");
    revalidatePath("/(dashboard)/dashboard");
  } catch (error) {
    console.error("Delete habit error:", error);
    throw new Error("Alışkanlık silinemedi.");
  }
}
