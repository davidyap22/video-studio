import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs";

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { compositionId, inputProps } = body;

    if (!compositionId) {
      return NextResponse.json(
        { error: "compositionId is required" },
        { status: 400 }
      );
    }

    // Create output directory if it doesn't exist
    const outputDir = path.join(process.cwd(), "public", "renders");
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const outputFileName = `${compositionId}_${timestamp}.mp4`;
    const outputPath = path.join(outputDir, outputFileName);

    // Write props to a temp file for the CLI to use
    const propsPath = path.join(outputDir, `props_${timestamp}.json`);
    fs.writeFileSync(propsPath, JSON.stringify(inputProps));

    // Build the render command
    const command = `npx remotion render src/remotion/index.ts ${compositionId} ${outputPath} --props="${propsPath}"`;

    console.log("Executing render command:", command);

    // Execute the render
    const { stdout, stderr } = await execAsync(command, {
      cwd: process.cwd(),
      timeout: 300000, // 5 minutes timeout
    });

    console.log("Render stdout:", stdout);
    if (stderr) console.log("Render stderr:", stderr);

    // Clean up props file
    if (fs.existsSync(propsPath)) {
      fs.unlinkSync(propsPath);
    }

    // Check if output file exists
    if (!fs.existsSync(outputPath)) {
      return NextResponse.json(
        { error: "Render failed - output file not created" },
        { status: 500 }
      );
    }

    // Return the path to the rendered video
    return NextResponse.json({
      success: true,
      videoUrl: `/renders/${outputFileName}`,
      message: "Video rendered successfully",
    });
  } catch (error) {
    console.error("Render error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Render failed",
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
