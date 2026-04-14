"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { uploadToR2 } from "./upload";
import { auth } from "@/lib/auth";

export async function createNote(title: string, content: string, image?: string) {
  try {
    let finalImageUrl = image;

    // Eğer görsel base64 olarak geldiyse R2'ye yükle
    if (image && image.startsWith("data:")) {
      const uploadResult = await uploadToR2(image, `note-img-${Date.now()}.png`);
      if (uploadResult.success) {
        finalImageUrl = uploadResult.url; // R2'deki dosya adı/key
      }
    }

    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    await db.note.create({
      data: { title, content, image: finalImageUrl, userId: session.user.id },
    });
    revalidatePath("/notes");
    revalidatePath("/(dashboard)/notes");
  } catch (error) {
    console.error("Not oluşturma hatası:", error);
    throw new Error("Not oluşturulamadı.");
  }
}

export async function deleteNote(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    await db.note.delete({
      where: { id, userId: session.user.id },
    });
    revalidatePath("/notes");
    revalidatePath("/(dashboard)/notes");
  } catch (error) {
    console.error("Not silme hatası:", error);
    throw new Error("Not silinemedi.");
  }
}

export async function updateNote(id: string, title: string, content: string, image?: string) {
  try {
    let finalImageUrl = image;

    if (image && image.startsWith("data:")) {
      const uploadResult = await uploadToR2(image, `note-img-${Date.now()}.png`);
      if (uploadResult.success) {
        finalImageUrl = uploadResult.url;
      }
    }

    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    await db.note.update({
      where: { id, userId: session.user.id },
      data: { title, content, image: finalImageUrl },
    });
    revalidatePath("/notes");
    revalidatePath("/(dashboard)/notes");
  } catch (error) {
    console.error("Not güncelleme hatası:", error);
    throw new Error("Not güncellenemedi.");
  }
}

export async function getNotes() {
  try {
    const session = await auth();
    if (!session?.user?.id) return [];

    return await db.note.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Get notes error:", error);
    return [];
  }
}
