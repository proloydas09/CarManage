import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createWriteStream, mkdirSync, existsSync } from "fs";
import { join } from "path";
import { randomUUID } from "crypto";

const USE_LOCAL = !process.env.R2_ACCOUNT_ID;

const s3 = USE_LOCAL
  ? null
  : new S3Client({
      region: "auto",
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID ?? "",
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? "",
      },
    });

const BUCKET = process.env.R2_BUCKET_NAME ?? "antigravity";
const PUBLIC_URL = process.env.R2_PUBLIC_URL ?? "";

// Local storage fallback path
const LOCAL_UPLOADS = join(process.cwd(), "uploads");
if (USE_LOCAL && !existsSync(LOCAL_UPLOADS)) {
  mkdirSync(LOCAL_UPLOADS, { recursive: true });
}

export interface UploadResult {
  key: string;
  url: string;
}

export async function uploadFile(
  buffer: Buffer,
  originalName: string,
  mimeType: string,
  folder = "documents"
): Promise<UploadResult> {
  const ext = originalName.split(".").pop() ?? "bin";
  const key = `${folder}/${randomUUID()}.${ext}`;

  if (USE_LOCAL) {
    const localPath = join(LOCAL_UPLOADS, key.replace("/", "_"));
    await new Promise<void>((resolve, reject) => {
      const ws = createWriteStream(localPath);
      ws.write(buffer);
      ws.end();
      ws.on("finish", resolve);
      ws.on("error", reject);
    });
    return { key, url: `/uploads/${key.replace("/", "_")}` };
  }

  await s3!.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    })
  );

  return { key, url: `${PUBLIC_URL}/${key}` };
}

export async function getPresignedUrl(key: string, expiresIn = 3600): Promise<string> {
  if (USE_LOCAL) return `/uploads/${key.replace("/", "_")}`;

  return getSignedUrl(
    s3!,
    new GetObjectCommand({ Bucket: BUCKET, Key: key }),
    { expiresIn }
  );
}

export async function deleteFile(key: string): Promise<void> {
  if (USE_LOCAL) return;
  await s3!.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}
