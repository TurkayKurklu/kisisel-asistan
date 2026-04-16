import { GetObjectCommand } from "@aws-sdk/client-s3";
import { s3Client, BUCKET_NAME } from "@/lib/s3";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params;

  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const response = await s3Client.send(command);
    const bodyContents = await response.Body?.transformToByteArray();

    if (!bodyContents) {
      return new NextResponse("Not Found", { status: 404 });
    }

    return new NextResponse(Buffer.from(bodyContents), {
      headers: {
        "Content-Type": response.ContentType || "image/png",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Media Proxy Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
