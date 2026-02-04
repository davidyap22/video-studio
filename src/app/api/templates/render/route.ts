import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs";

const execAsync = promisify(exec);

const VALID_TEMPLATES = [
  "TitleCard",
  "Intro",
  "Headline",
  "QuoteCard",
  "OutlineCard",
  "Timeline",
  "TimelineDiagonal",
  "TimelineZoom",
  "TimelineRewind",
  "ImageShowcase",
  "AlertTitle",
  "AlertTitleV2",
  "FootballMap",
  "FootballMap3D",
  "FilmTimeline",
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { template, props, duration = 6, fps = 30 } = body;

    // Validate template
    if (!template || !VALID_TEMPLATES.includes(template)) {
      return NextResponse.json(
        {
          error: "Invalid template",
          validTemplates: VALID_TEMPLATES,
        },
        { status: 400 }
      );
    }

    // Create output directory
    const outputDir = path.join(process.cwd(), "public", "renders");
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const outputFileName = `${template}_${timestamp}.mp4`;
    const outputPath = path.join(outputDir, outputFileName);

    // Write props to a temp file
    const propsPath = path.join(outputDir, `props_${timestamp}.json`);
    fs.writeFileSync(propsPath, JSON.stringify(props || {}));

    // Build render command
    const command = `npx remotion render src/remotion/index.ts ${template} ${outputPath} --props="${propsPath}"`;

    console.log("Render command:", command);

    // Execute render (with timeout)
    const { stdout, stderr } = await execAsync(command, {
      cwd: process.cwd(),
      timeout: 600000, // 10 minutes max
      maxBuffer: 50 * 1024 * 1024, // 50MB buffer
    });

    console.log("Render stdout:", stdout);
    if (stderr) console.log("Render stderr:", stderr);

    // Clean up props file
    if (fs.existsSync(propsPath)) {
      fs.unlinkSync(propsPath);
    }

    // Check if output exists
    if (!fs.existsSync(outputPath)) {
      return NextResponse.json(
        { error: "Render failed - output file not created", stderr },
        { status: 500 }
      );
    }

    // Get file size
    const stats = fs.statSync(outputPath);
    const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);

    // Return success response
    const baseUrl = request.headers.get("host") || "localhost:3002";
    const protocol = request.headers.get("x-forwarded-proto") || "http";

    return NextResponse.json({
      success: true,
      template,
      videoUrl: `/renders/${outputFileName}`,
      downloadUrl: `${protocol}://${baseUrl}/renders/${outputFileName}`,
      fileSize: `${fileSizeInMB} MB`,
      duration: `${duration} seconds`,
      fps,
    });
  } catch (error) {
    console.error("Render error:", error);

    // Clean up on error
    const outputDir = path.join(process.cwd(), "public", "renders");
    const files = fs.readdirSync(outputDir).filter((f) => f.startsWith("props_"));
    files.forEach((f) => {
      try {
        fs.unlinkSync(path.join(outputDir, f));
      } catch {}
    });

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Render failed",
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
