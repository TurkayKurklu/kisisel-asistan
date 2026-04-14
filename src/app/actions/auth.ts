"use server";

import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function register(formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;

  if (!username || !password || !name) {
    throw new Error("Tüm alanları doldurun.");
  }

  const existingUser = await db.user.findUnique({
    where: { username },
  });

  if (existingUser) {
    throw new Error("Bu kullanıcı adı zaten alınmış.");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await db.user.create({
    data: {
      username,
      password: hashedPassword,
      name,
    },
  });

  return { success: true };
}
