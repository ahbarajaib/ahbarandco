import fs from "fs/promises";
import path from "path";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

// Check if Cloudflare R2 is configured in the environment
const isR2Configured = !!(
  process.env.R2_ACCOUNT_ID &&
  process.env.R2_ACCESS_KEY_ID &&
  process.env.R2_SECRET_ACCESS_KEY &&
  process.env.R2_BUCKET_NAME
);

// Initialize the S3 client for Cloudflare R2 if credentials are provided
const s3Client = isR2Configured
  ? new S3Client({
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      region: "auto",
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    })
  : null;

/**
 * Uploads a file to Cloudflare R2 if configured, or falls back to the local VPS disk.
 * Returns the public URL/path of the uploaded file.
 */
export async function uploadImage(file: File, folder = ""): Promise<string> {
  const bytes = await file.arrayBuffer();
  let buffer = Buffer.from(bytes);

  const originalExt = path.extname(file.name) || ".jpg";
  const ext = originalExt.toLowerCase();

  let finalExt = ext;
  let contentType = file.type || "image/jpeg";

  const isOptimizable = [".jpg", ".jpeg", ".png", ".webp", ".avif", ".heic", ".heif", ".tiff"].includes(ext);

  if (isOptimizable) {
    try {
      const optimizedBuffer = await sharp(buffer)
        .resize({ width: 2000, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();
      buffer = Buffer.from(optimizedBuffer);
      finalExt = ".webp";
      contentType = "image/webp";
    } catch (err) {
      console.error("Image optimization failed, falling back to original", err);
    }
  }

  // Generate a unique filename: clean original name + timestamp + random suffix
  const nameWithoutExt = path.basename(file.name, originalExt)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .substring(0, 30);
  
  const uniqueName = `${nameWithoutExt}-${Date.now()}-${Math.round(Math.random() * 1e4)}${finalExt}`;
  const key = folder ? `uploads/${folder}/${uniqueName}` : `uploads/${uniqueName}`;

  if (s3Client && process.env.R2_BUCKET_NAME) {
    // Upload to Cloudflare R2
    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      })
    );

    // Construct the public URL from the custom domain/public URL configured
    const publicUrlBase = (process.env.R2_PUBLIC_URL || "").replace(/\/$/, "");
    return `${publicUrlBase}/${key}`;
  } else {
    // Local VPS fallback: Ensure uploads directory exists
    const targetDir = folder ? path.join(UPLOADS_DIR, folder) : UPLOADS_DIR;
    await fs.mkdir(targetDir, { recursive: true });

    const filePath = path.join(targetDir, uniqueName);
    await fs.writeFile(filePath, buffer);

    const publicPath = folder ? `/uploads/${folder}/${uniqueName}` : `/uploads/${uniqueName}`;
    return publicPath;
  }
}

/**
 * Deletes an image from either Cloudflare R2 or the local filesystem.
 */
export async function deleteImage(url: string): Promise<void> {
  const publicUrlBase = (process.env.R2_PUBLIC_URL || "").replace(/\/$/, "");

  // If the image is stored in R2 (matches public URL)
  if (isR2Configured && url.startsWith(publicUrlBase) && process.env.R2_BUCKET_NAME) {
    const key = url.replace(publicUrlBase, "").replace(/^\//, "");
    try {
      await s3Client!.send(
        new DeleteObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME,
          Key: key,
        })
      );
    } catch (err) {
      console.error(`Failed to delete object from Cloudflare R2: ${key}`, err);
    }
    return;
  }

  // If it's a local upload (starts with /uploads/)
  if (url.startsWith("/uploads/")) {
    const relativePath = url.replace(/^\//, ""); // remove leading slash
    const filePath = path.join(process.cwd(), "public", relativePath);

    try {
      await fs.unlink(filePath);
    } catch (err: unknown) {
      // If file doesn't exist, ignore error; otherwise log it
      if (err && typeof err === "object" && "code" in err && (err as { code: string }).code !== "ENOENT") {
        console.error(`Failed to delete file from disk: ${filePath}`, err);
      }
    }
  }
}
