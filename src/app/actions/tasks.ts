"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

export async function getTasks() {
  try {
    const session = await auth();
    if (!session?.user?.id) return [];

    return await db.task.findMany({
      where: { userId: session.user.id },
      orderBy: { date: "asc" },
    });
  } catch (error) {
    console.error("Görev getirme hatası:", error);
    return [];
  }
}

export async function addTask(
  content: string, 
  date: Date | string, 
  time?: string, 
  title?: string, 
  topic?: string,
  priority: string = "low",
  dueDate?: Date | string,
  image?: string,
  isRecurring?: boolean,
  recurrenceType?: string,
  recurringDays?: string
) {
  try {
    const taskDate = typeof date === 'string' ? new Date(date) : date;
    const taskDueDate = dueDate ? (typeof dueDate === 'string' ? new Date(dueDate) : dueDate) : null;

    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const result = await db.task.create({
      data: { 
        content, 
        date: taskDate, 
        time, 
        title, 
        topic,
        priority: priority as any,
        dueDate: taskDueDate,
        image,
        isRecurring: !!isRecurring,
        recurrenceType,
        recurringDays,
        userId: session.user.id
      } as any,
    });
    
    revalidatePath("/(dashboard)/calendar");
    revalidatePath("/calendar");
    revalidatePath("/dashboard");
    revalidatePath("/tasks");
    
    return { success: true, id: result.id };
  } catch (error) {
    console.error("GÖREV EKLEME HATASI DETAY:", error);
    throw new Error(`Görev eklenemedi: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function toggleTask(id: string, isCompleted: boolean) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    await db.task.update({
      where: { id, userId: session.user.id },
      data: { isCompleted },
    });
    revalidatePath("/(dashboard)/calendar");
    revalidatePath("/calendar");
    revalidatePath("/dashboard");
    revalidatePath("/tasks");
  } catch (error) {
    console.error("Görev güncelleme hatası:", error);
    throw new Error("Görev güncellenemedi.");
  }
}

export async function updateTask(
  id: string,
  content: string, 
  date: Date | string, 
  time?: string, 
  title?: string, 
  topic?: string,
  image?: string,
  isRecurring?: boolean,
  recurrenceType?: string,
  recurringDays?: string
) {
  try {
    const taskDate = typeof date === 'string' ? new Date(date) : date;

    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    await db.task.update({
      where: { id, userId: session.user.id },
      data: { 
        content, 
        date: taskDate, 
        time, 
        title, 
        topic,
        image,
        isRecurring: !!isRecurring,
        recurrenceType,
        recurringDays
      } as any,
    });
    
    revalidatePath("/(dashboard)/calendar");
    revalidatePath("/calendar");
    revalidatePath("/dashboard");
    revalidatePath("/tasks");
    
    return { success: true };
  } catch (error) {
    console.error("Görev güncelleme hatası DETAY:", error);
    throw new Error("Görev güncellenemedi.");
  }
}

export async function deleteTask(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    await db.task.delete({
      where: { id, userId: session.user.id },
    });
    revalidatePath("/(dashboard)/calendar");
    revalidatePath("/calendar");
    revalidatePath("/dashboard");
    revalidatePath("/tasks");
    
    return { success: true };
  } catch (error) {
    console.error("Görev silme hatası:", error);
    throw new Error("Görev silinemedi.");
  }
}
