"use server";

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client, BUCKET_NAME } from "@/lib/s3";
import { v4 as uuidv4 } from "uuid"; // UUID eklemek iyi olur

export async function uploadToR2(base64Data: string, fileName: string) {
  try {
    // base64 prefix'ini temizle (data:image/png;base64, vs.)
    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let buffer: Buffer;
    let contentType: string;

    if (matches && matches.length === 3) {
      contentType = matches[1];
      buffer = Buffer.from(matches[2], 'base64');
    } else {
      // Düz base64 ise
      buffer = Buffer.from(base64Data, 'base64');
      contentType = "image/png"; // Varsayılan
    }

    // Benzersiz bir dosya adı oluştur
    const uniqueFileName = `${Date.now()}-${fileName}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: uniqueFileName,
      Body: buffer,
      ContentType: contentType,
    });

    await s3Client.send(command);

    // R2 endpoint'inden direk URL dönmek zordur (public subdomain lazım)
    // Şimdilik sadece Key'i veya geçici bir URL yapısını döneceğiz.
    // Kullanıcı r2.dev subdomain'ini tanımladığında bu URL tam çalışacaktır.
    
    // Cloudflare R2 Public URL yapısı genelde şöyledir:
    // https://pub-xxxx.r2.dev/uniqueFileName
    
    return {
      success: true,
      key: uniqueFileName,
      url: uniqueFileName // Şimdilik sadece dosya adını dönüyoruz, UI tarafında BaseURL ile birleşecek
    };
  } catch (error) {
    console.error("R2 Yükleme Hatası:", error);
    return { success: false, error: "Dosya yüklenemedi." };
  }
}
