import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const fileSegments = resolvedParams.path;
    
    if (!fileSegments || fileSegments.length === 0) {
      return new NextResponse("Bad Request", { status: 400 });
    }

    const filePath = path.join(process.cwd(), "public", "uploads", ...fileSegments);

    // Prevent directory traversal attacks
    const relative = path.relative(path.join(process.cwd(), "public", "uploads"), filePath);
    if (relative.startsWith("..") || path.isAbsolute(relative)) {
      return new NextResponse("Access Denied", { status: 403 });
    }

    const fileBuffer = await fs.readFile(filePath);

    // Determine content type
    const ext = path.extname(filePath).toLowerCase();
    let contentType = "application/octet-stream";
    if (ext === ".jpg" || ext === ".jpeg") {
      contentType = "image/jpeg";
    } else if (ext === ".png") {
      contentType = "image/png";
    } else if (ext === ".webp") {
      contentType = "image/webp";
    } else if (ext === ".gif") {
      contentType = "image/gif";
    } else if (ext === ".svg") {
      contentType = "image/svg+xml";
    }

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err) {
    console.error("Error serving uploaded file:", err);
    return new NextResponse("File Not Found", { status: 404 });
  }
}
