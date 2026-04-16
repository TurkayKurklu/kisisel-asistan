"use server";

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "@/lib/s3";
const BUCKET_NAME = process.env.R2_BUCKET_NAME || "kisisel-asistan";

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

    // We now serve these files through /api/media/[key] to avoid R2 direct link issues.
    return {
      success: true,
      key: uniqueFileName,
      url: uniqueFileName 
    };
  } catch (error) {
    console.error("R2 Yükleme Hatası:", error);
    return { success: false, error: "Dosya yüklenemedi." };
  }
}
