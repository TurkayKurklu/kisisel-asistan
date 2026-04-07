"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function addEvent(
  title: string,
  date: Date,
  time?: string,
  category?: string
) {
  try {
    const event = await db.event.create({
      data: {
        title,
        date,
        time,
        category,
      },
    });
    revalidatePath("/calendar");
    revalidatePath("/dashboard");
    revalidatePath("/(dashboard)/calendar");
    revalidatePath("/(dashboard)/dashboard");
    return event;
  } catch (error) {
    console.error("Event error:", error);
    throw new Error("Etkinlik eklenemedi.");
  }
}

export async function getEvents() {
  try {
    return await db.event.findMany({
      orderBy: { date: "asc" },
    });
  } catch (error) {
    console.error("Get events error:", error);
    return [];
  }
}

export async function deleteEvent(id: string) {
  try {
    await db.event.delete({
      where: { id },
    });
    revalidatePath("/calendar");
    revalidatePath("/dashboard");
    revalidatePath("/(dashboard)/calendar");
    revalidatePath("/(dashboard)/dashboard");
  } catch (error) {
    console.error("Delete event error:", error);
    throw new Error("Etkinlik silinemedi.");
  }
}
