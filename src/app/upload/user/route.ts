import { type NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { nanoid } from "nanoid";

const s3 = new S3Client({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.STORAGE_AWS_ACCESS_KEY!,
    secretAccessKey: process.env.STORAGE_AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const fileName = nanoid();

  const command = new PutObjectCommand({
    Bucket: process.env.STORAGE_AWS_BUCKET!,
    Key: fileName,
    Body: buffer,
    ContentType: file.type,
  });

  try {
    await s3.send(command);
    return NextResponse.json({
      message: "File uploaded successfully",
      fileName: `${process.env.STORAGE_AWS_DIST_URL}/${fileName}`,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error uploading file" },
      { status: 500 },
    );
  }
}
