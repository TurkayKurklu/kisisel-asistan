import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pkg from "pg";
const { Pool } = pkg;
import bcrypt from "bcryptjs";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🚀 Veri göçü başlatılıyor...");

  // 1. Türkay kullanıcısını oluştur veya bul
  const username = "turkay";
  const password = "turkay11";
  const hashedPassword = await bcrypt.hash(password, 10);

  let user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        name: "Türkay",
      },
    });
    console.log("✅ Türkay kullanıcısı oluşturuldu.");
  } else {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });
    console.log("ℹ️ Türkay kullanıcısı zaten mevcut, şifre güncellendi.");
  }

  const userId = user.id;

  // 2. Mevcut tüm verileri Türkay'a ata
  console.log("📦 Mevcut veriler Türkay'a atanıyor...");

  const taskRes = await prisma.task.updateMany({
    where: { userId: null },
    data: { userId },
  });
  console.log(`- ${taskRes.count} görev güncellendi.`);

  const noteRes = await prisma.note.updateMany({
    where: { userId: null },
    data: { userId },
  });
  console.log(`- ${noteRes.count} not güncellendi.`);

  const transRes = await prisma.transaction.updateMany({
    where: { userId: null },
    data: { userId },
  });
  console.log(`- ${transRes.count} finansal kayıt güncellendi.`);

  const eventRes = await prisma.event.updateMany({
    where: { userId: null },
    data: { userId },
  });
  console.log(`- ${eventRes.count} etkinlik güncellendi.`);

  const habitRes = await prisma.habit.updateMany({
    where: { userId: null },
    data: { userId },
  });
  console.log(`- ${habitRes.count} alışkanlık güncellendi.`);

  console.log("✨ Veri göçü başarıyla tamamlandı!");
}

main()
  .catch((e) => {
    console.error("❌ Hata oluştu:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    pool.end();
  });
