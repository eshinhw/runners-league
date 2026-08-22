import crypto from "node:crypto";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]);
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

let client: S3Client | null = null;

// Cloudflare R2 is S3-compatible, so the AWS SDK works against it directly —
// just point the endpoint at the account's R2 URL. `region` is required by
// the SDK but unused by R2 itself.
function getClient(): S3Client {
  if (client) return client;

  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "R2 storage isn't configured — set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY.",
    );
  }

  client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
  return client;
}

// Uploads one image to R2 under `<prefix>/<uuid>.<ext>` and returns its
// public URL, or null if there's no file (upload is optional in every
// caller) or it fails validation. Throws only for real config/upload
// failures, so callers can tell "no photo provided" apart from "upload broke".
export async function uploadImage(file: File | null, prefix: string): Promise<string | null> {
  if (!file || file.size === 0) return null;
  if (!ALLOWED_TYPES.has(file.type)) throw new Error("Please upload a JPEG, PNG, WebP, or HEIC image.");
  if (file.size > MAX_FILE_SIZE_BYTES) throw new Error("Images must be 5MB or smaller.");

  const bucket = process.env.R2_BUCKET_NAME;
  const publicUrl = process.env.R2_PUBLIC_URL;
  if (!bucket || !publicUrl) {
    throw new Error("R2 storage isn't configured — set R2_BUCKET_NAME and R2_PUBLIC_URL.");
  }

  const ext = file.type.split("/")[1] ?? "jpg";
  const key = `${prefix}/${crypto.randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  await getClient().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: file.type,
    }),
  );

  return `${publicUrl.replace(/\/$/, "")}/${key}`;
}

// Same as uploadImage, but for a batch — skips invalid files instead of
// throwing, since these callers (race photos) treat photos as optional
// evidence rather than a required field.
export async function uploadImages(files: File[], prefix: string): Promise<string[]> {
  const valid = files.filter((f) => f.size > 0 && ALLOWED_TYPES.has(f.type) && f.size <= MAX_FILE_SIZE_BYTES);
  const urls: string[] = [];
  for (const file of valid) {
    const url = await uploadImage(file, prefix);
    if (url) urls.push(url);
  }
  return urls;
}
