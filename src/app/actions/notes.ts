"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { uploadToR2 } from "./upload";

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

    await db.note.create({
      data: { title, content, image: finalImageUrl },
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
    await db.note.delete({
      where: { id },
    });
    revalidatePath("/notes");
    revalidatePath("/(dashboard)/notes");
  } catch (error) {
    console.error("Not silme hatası:", error);
    throw new Error("Not silinemedi.");
  }
}

export async function getNotes() {
  try {
    return await db.note.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Get notes error:", error);
    return [];
  }
}
