import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { uploadImage } from "@/lib/storage";

export async function POST(request: NextRequest) {
  try {
    // Authenticate the user
    const session = await auth();
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = formData.get("folder") as string || "";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const maxSize = 15 * 1024 * 1024; // 15MB limit
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File size exceeds the 15MB limit." }, { status: 400 });
    }

    const url = await uploadImage(file, folder);
    return NextResponse.json({ url });
  } catch (err) {
    console.error("API Upload Error:", err);
    return NextResponse.json({ error: "Failed to upload image." }, { status: 500 });
  }
}
