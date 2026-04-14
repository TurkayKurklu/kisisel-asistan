"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

export async function addEvent(
  title: string,
  date: Date,
  time?: string,
  category?: string
) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const event = await db.event.create({
      data: {
        title,
        date,
        time,
        category,
        userId: session.user.id,
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
    const session = await auth();
    if (!session?.user?.id) return [];

    return await db.event.findMany({
      where: { userId: session.user.id },
      orderBy: { date: "asc" },
    });
  } catch (error) {
    console.error("Get events error:", error);
    return [];
  }
}

export async function deleteEvent(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    await db.event.delete({
      where: { id, userId: session.user.id },
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
