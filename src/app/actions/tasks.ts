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
  date: Date, 
  time?: string, 
  title?: string, 
  topic?: string,
  priority: string = "low",
  dueDate?: Date,
  image?: string
) {
  try {
    const result = await db.task.create({
      data: { 
        content, 
        date: new Date(date), 
        time, 
        title, 
        topic,
        priority: priority as any,
        dueDate: dueDate ? new Date(dueDate) : null,
        image
      } as any,
    });
    revalidatePath("/dashboard");
    revalidatePath("/tasks");
    revalidatePath("/(dashboard)/dashboard");
    revalidatePath("/(dashboard)/tasks");
  } catch (error) {
    console.error("GÖREV EKLEME HATASI:", error);
    throw new Error(`Görev eklenemedi.`);
  }
}

export async function toggleTask(id: string, isCompleted: boolean) {
  try {
    await db.task.update({
      where: { id },
      data: { isCompleted },
    });
    revalidatePath("/dashboard");
    revalidatePath("/tasks");
    revalidatePath("/(dashboard)/dashboard");
    revalidatePath("/(dashboard)/tasks");
  } catch (error) {
    console.error("Görev güncelleme hatası:", error);
    throw new Error("Görev güncellenemedi.");
  }
}

export async function updateTask(
  id: string,
  content: string, 
  date: Date, 
  time?: string, 
  title?: string, 
  topic?: string,
  image?: string
) {
  try {
    await db.task.update({
      where: { id },
      data: { 
        content, 
        date: new Date(date), 
        time, 
        title, 
        topic,
        image
      } as any,
    });
    revalidatePath("/dashboard");
    revalidatePath("/tasks");
    revalidatePath("/(dashboard)/dashboard");
    revalidatePath("/(dashboard)/tasks");
  } catch (error) {
    console.error("Görev güncelleme hatası:", error);
    throw new Error("Görev güncellenemedi.");
  }
}

export async function deleteTask(id: string) {
  try {
    await db.task.delete({
      where: { id },
    });
    revalidatePath("/dashboard");
    revalidatePath("/tasks");
    revalidatePath("/(dashboard)/dashboard");
    revalidatePath("/(dashboard)/tasks");
  } catch (error) {
    console.error("Görev silme hatası:", error);
    throw new Error("Görev silinemedi.");
  }
}
