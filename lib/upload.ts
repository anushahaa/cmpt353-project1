import path from "path";
import { promises as fs } from "fs";

export const ALLOWED_MIME_TYPES = ["image/png", "image/jpeg", "image/webp"];
export const ALLOWED_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp"];
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

export function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export function isAllowedUpload(mimeType: string, fileName: string, size: number) {
  const ext = path.extname(fileName).toLowerCase();

  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    return "Only PNG, JPG/JPEG, and WebP files are allowed.";
  }

  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return "Invalid file extension.";
  }

  if (size > MAX_FILE_SIZE) {
    return "File exceeds 5 MB limit.";
  }

  return null;
}

export async function ensureUploadsDir() {
  await fs.mkdir(path.join(process.cwd(), "uploads"), { recursive: true });
}

export async function saveFile(file: File) {
  await ensureUploadsDir();

  const buffer = Buffer.from(await file.arrayBuffer());
  const safeName = `${Date.now()}-${sanitizeFileName(file.name)}`;
  const relativePath = `uploads/${safeName}`;
  const fullPath = path.join(process.cwd(), relativePath);

  await fs.writeFile(fullPath, buffer);

  return {
    relativePath,
    sizeBytes: buffer.length,
    mimeType: file.type
  };
}