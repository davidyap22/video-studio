import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Check for video, image, or audio
    const videoFile = formData.get("video") as File | null;
    const imageFile = formData.get("image") as File | null;
    const audioFile = formData.get("audio") as File | null;
    const file = videoFile || imageFile || audioFile;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Validate file type
    const validVideoTypes = ["video/mp4", "video/webm", "video/quicktime", "video/avi", "video/x-msvideo"];
    const validImageTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    const validAudioTypes = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/aac", "audio/ogg", "audio/flac"];
    const isVideo = validVideoTypes.includes(file.type);
    const isImage = validImageTypes.includes(file.type);
    const isAudio = validAudioTypes.includes(file.type);

    if (!isVideo && !isImage && !isAudio) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload MP4, WebM, MOV, AVI, JPG, PNG, WebP, MP3, WAV, or AAC" },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    // Generate unique filename
    const timestamp = Date.now();
    const ext = file.name.split(".").pop();
    const prefix = isVideo ? "video" : isAudio ? "audio" : "image";
    const filename = `${prefix}-${timestamp}.${ext}`;
    const filepath = path.join(uploadsDir, filename);

    // Write file
    const bytes = await file.arrayBuffer();
    const uint8Array = new Uint8Array(bytes);
    await writeFile(filepath, uint8Array);

    return NextResponse.json({
      success: true,
      filename,
      path: `uploads/${filename}`,
      type: isVideo ? "video" : isAudio ? "audio" : "image",
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
