"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getTasks() {
  try {
    return await db.task.findMany({
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
  image?: string
) {
  try {
    const taskDate = typeof date === 'string' ? new Date(date) : date;
    const taskDueDate = dueDate ? (typeof dueDate === 'string' ? new Date(dueDate) : dueDate) : null;

    const result = await db.task.create({
      data: { 
        content, 
        date: taskDate, 
        time, 
        title, 
        topic,
        priority: priority as any,
        dueDate: taskDueDate,
        image
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
    await db.task.update({
      where: { id },
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
  image?: string
) {
  try {
    const taskDate = typeof date === 'string' ? new Date(date) : date;

    await db.task.update({
      where: { id },
      data: { 
        content, 
        date: taskDate, 
        time, 
        title, 
        topic,
        image
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
    await db.task.delete({
      where: { id },
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
