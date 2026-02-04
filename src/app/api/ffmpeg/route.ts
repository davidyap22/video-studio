import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs";

const execAsync = promisify(exec);

// Output directory for processed videos
const OUTPUT_DIR = path.join(process.cwd(), "public", "processed");

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Get video info using ffprobe
async function getVideoInfo(filePath: string) {
  const cmd = `ffprobe -v quiet -print_format json -show_format -show_streams "${filePath}"`;
  const { stdout } = await execAsync(cmd);
  return JSON.parse(stdout);
}

// Generate unique output filename
function generateOutputPath(prefix: string, extension: string) {
  const timestamp = Date.now();
  return path.join(OUTPUT_DIR, `${prefix}_${timestamp}.${extension}`);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { operation, inputPath, options = {} } = body;

    // Validate input file exists
    const fullInputPath = path.join(process.cwd(), "public", inputPath);
    if (!fs.existsSync(fullInputPath)) {
      return NextResponse.json(
        { error: "Input file not found", path: inputPath },
        { status: 400 }
      );
    }

    let command = "";
    let outputPath = "";
    let outputExtension = options.format || "mp4";

    switch (operation) {
      // 1. Trim/Cut video
      case "trim": {
        const { startTime = "00:00:00", duration, endTime, accurate = true } = options;
        outputPath = generateOutputPath("trimmed", outputExtension);

        // Put -ss BEFORE -i for faster seeking (input seeking)
        // Use re-encoding for accurate cuts (no keyframe issues)
        if (accurate) {
          // Accurate mode: re-encode to get precise cuts
          if (duration) {
            command = `ffmpeg -y -ss ${startTime} -i "${fullInputPath}" -t ${duration} -c:v libx264 -preset fast -crf 18 -c:a aac -b:a 192k "${outputPath}"`;
          } else if (endTime) {
            command = `ffmpeg -y -ss ${startTime} -i "${fullInputPath}" -to ${endTime} -c:v libx264 -preset fast -crf 18 -c:a aac -b:a 192k "${outputPath}"`;
          } else {
            return NextResponse.json(
              { error: "Either duration or endTime is required for trim" },
              { status: 400 }
            );
          }
        } else {
          // Fast mode: stream copy (may have slight inaccuracy at start)
          if (duration) {
            command = `ffmpeg -y -ss ${startTime} -i "${fullInputPath}" -t ${duration} -c copy -avoid_negative_ts make_zero "${outputPath}"`;
          } else if (endTime) {
            command = `ffmpeg -y -ss ${startTime} -i "${fullInputPath}" -to ${endTime} -c copy -avoid_negative_ts make_zero "${outputPath}"`;
          } else {
            return NextResponse.json(
              { error: "Either duration or endTime is required for trim" },
              { status: 400 }
            );
          }
        }
        break;
      }

      // 2. Merge/Concatenate videos
      case "merge": {
        const { inputPaths, targetWidth = 1920, targetHeight = 1080 } = options;
        if (!inputPaths || inputPaths.length < 2) {
          return NextResponse.json(
            { error: "At least 2 input files are required for merge" },
            { status: 400 }
          );
        }
        outputPath = generateOutputPath("merged", outputExtension);

        // Check if videos have audio streams
        const videoInfos = await Promise.all(
          inputPaths.map(async (p: string) => {
            const fullPath = path.join(process.cwd(), "public", p);
            const info = await getVideoInfo(fullPath);
            const hasAudio = info.streams?.some((s: { codec_type: string }) => s.codec_type === "audio");
            const videoStream = info.streams?.find((s: { codec_type: string }) => s.codec_type === "video");
            return {
              path: fullPath,
              hasAudio,
              width: videoStream?.width || 1920,
              height: videoStream?.height || 1080
            };
          })
        );

        // If ANY video doesn't have audio, discard all audio to avoid sync issues
        const allHaveAudio = videoInfos.every(v => v.hasAudio);

        // Build input arguments
        const inputArgs = videoInfos
          .map((v) => `-i "${v.path}"`)
          .join(" ");

        // Scale all videos to same resolution, then concat
        // Use scale + pad to handle different aspect ratios (letterbox/pillarbox)
        const scaleFilters = videoInfos.map((_, i) =>
          `[${i}:v:0]scale=${targetWidth}:${targetHeight}:force_original_aspect_ratio=decrease,pad=${targetWidth}:${targetHeight}:(ow-iw)/2:(oh-ih)/2:black,setsar=1[v${i}]`
        ).join(";");

        if (allHaveAudio) {
          // All videos have audio - concat both video and audio
          const videoConcat = videoInfos.map((_, i) => `[v${i}]`).join("");
          const audioConcat = videoInfos.map((_, i) => `[${i}:a:0]`).join("");
          const filterComplex = `${scaleFilters};${videoConcat}concat=n=${inputPaths.length}:v=1:a=0[outv];${audioConcat}concat=n=${inputPaths.length}:v=0:a=1[outa]`;
          command = `ffmpeg -y ${inputArgs} -filter_complex "${filterComplex}" -map "[outv]" -map "[outa]" -c:v libx264 -preset fast -crf 18 -c:a aac -b:a 192k "${outputPath}"`;
        } else {
          // Some or all videos don't have audio - video only (to avoid sync issues)
          const videoConcat = videoInfos.map((_, i) => `[v${i}]`).join("");
          const filterComplex = `${scaleFilters};${videoConcat}concat=n=${inputPaths.length}:v=1:a=0[outv]`;
          command = `ffmpeg -y ${inputArgs} -filter_complex "${filterComplex}" -map "[outv]" -c:v libx264 -preset fast -crf 18 "${outputPath}"`;
        }
        break;
      }

      // 3. Format conversion
      case "convert": {
        const { format = "mp4", codec } = options;
        outputExtension = format;
        outputPath = generateOutputPath("converted", format);

        if (codec) {
          command = `ffmpeg -y -i "${fullInputPath}" -c:v ${codec} "${outputPath}"`;
        } else {
          command = `ffmpeg -y -i "${fullInputPath}" "${outputPath}"`;
        }
        break;
      }

      // 4. Resize/Scale video
      case "resize": {
        const { width, height, scale } = options;
        outputPath = generateOutputPath("resized", outputExtension);

        if (scale) {
          command = `ffmpeg -y -i "${fullInputPath}" -vf "scale=iw*${scale}:ih*${scale}" "${outputPath}"`;
        } else if (width && height) {
          command = `ffmpeg -y -i "${fullInputPath}" -vf "scale=${width}:${height}" "${outputPath}"`;
        } else if (width) {
          command = `ffmpeg -y -i "${fullInputPath}" -vf "scale=${width}:-1" "${outputPath}"`;
        } else if (height) {
          command = `ffmpeg -y -i "${fullInputPath}" -vf "scale=-1:${height}" "${outputPath}"`;
        } else {
          return NextResponse.json(
            { error: "Width, height, or scale is required for resize" },
            { status: 400 }
          );
        }
        break;
      }

      // 5. Crop video
      case "crop": {
        const { cropWidth, cropHeight, x = 0, y = 0 } = options;
        if (!cropWidth || !cropHeight) {
          return NextResponse.json(
            { error: "cropWidth and cropHeight are required" },
            { status: 400 }
          );
        }
        outputPath = generateOutputPath("cropped", outputExtension);
        command = `ffmpeg -y -i "${fullInputPath}" -vf "crop=${cropWidth}:${cropHeight}:${x}:${y}" "${outputPath}"`;
        break;
      }

      // 6. Speed change
      case "speed": {
        const { videoSpeed = 1, audioSpeed = 1 } = options;
        outputPath = generateOutputPath("speed", outputExtension);

        const videoFilter = `setpts=${1/videoSpeed}*PTS`;
        const audioFilter = `atempo=${audioSpeed}`;

        if (audioSpeed !== 1) {
          command = `ffmpeg -y -i "${fullInputPath}" -filter_complex "[0:v]${videoFilter}[v];[0:a]${audioFilter}[a]" -map "[v]" -map "[a]" "${outputPath}"`;
        } else {
          command = `ffmpeg -y -i "${fullInputPath}" -vf "${videoFilter}" -an "${outputPath}"`;
        }
        break;
      }

      // 7. Apply filters
      case "filter": {
        const { filters } = options;
        if (!filters || filters.length === 0) {
          return NextResponse.json(
            { error: "At least one filter is required" },
            { status: 400 }
          );
        }
        outputPath = generateOutputPath("filtered", outputExtension);

        // Build filter chain
        const filterChain = filters.map((f: { name: string; params?: Record<string, string | number> }) => {
          if (f.params) {
            const params = Object.entries(f.params)
              .map(([k, v]) => `${k}=${v}`)
              .join(":");
            return `${f.name}=${params}`;
          }
          return f.name;
        }).join(",");

        command = `ffmpeg -y -i "${fullInputPath}" -vf "${filterChain}" "${outputPath}"`;
        break;
      }

      // 8. Extract audio
      case "extract-audio": {
        const { audioFormat = "mp3", bitrate = "192k" } = options;
        outputPath = generateOutputPath("audio", audioFormat);
        command = `ffmpeg -y -i "${fullInputPath}" -vn -acodec ${audioFormat === "mp3" ? "libmp3lame" : "copy"} -ab ${bitrate} "${outputPath}"`;
        break;
      }

      // 9. Add/Replace audio
      case "add-audio": {
        const { audioPath, replaceOriginal = true } = options;
        if (!audioPath) {
          return NextResponse.json(
            { error: "audioPath is required" },
            { status: 400 }
          );
        }
        const fullAudioPath = path.join(process.cwd(), "public", audioPath);
        outputPath = generateOutputPath("with-audio", outputExtension);

        if (replaceOriginal) {
          command = `ffmpeg -y -i "${fullInputPath}" -i "${fullAudioPath}" -c:v copy -map 0:v:0 -map 1:a:0 "${outputPath}"`;
        } else {
          command = `ffmpeg -y -i "${fullInputPath}" -i "${fullAudioPath}" -filter_complex "[0:a][1:a]amerge=inputs=2[a]" -map 0:v -map "[a]" -c:v copy "${outputPath}"`;
        }
        break;
      }

      // 10. Remove audio (mute)
      case "mute": {
        outputPath = generateOutputPath("muted", outputExtension);
        command = `ffmpeg -y -i "${fullInputPath}" -an -c:v copy "${outputPath}"`;
        break;
      }

      // 11. Adjust volume
      case "volume": {
        const { level = 1 } = options;
        outputPath = generateOutputPath("volume", outputExtension);
        command = `ffmpeg -y -i "${fullInputPath}" -af "volume=${level}" -c:v copy "${outputPath}"`;
        break;
      }

      // 12. Add watermark/overlay
      case "watermark": {
        const { imagePath, position = "topright", opacity = 0.5, scale: wmScale = 0.2 } = options;
        if (!imagePath) {
          return NextResponse.json(
            { error: "imagePath is required for watermark" },
            { status: 400 }
          );
        }
        const fullImagePath = path.join(process.cwd(), "public", imagePath);
        outputPath = generateOutputPath("watermarked", outputExtension);

        // Position mapping
        const positions: Record<string, string> = {
          topleft: "10:10",
          topright: "main_w-overlay_w-10:10",
          bottomleft: "10:main_h-overlay_h-10",
          bottomright: "main_w-overlay_w-10:main_h-overlay_h-10",
          center: "(main_w-overlay_w)/2:(main_h-overlay_h)/2",
        };
        const pos = positions[position] || positions.topright;

        command = `ffmpeg -y -i "${fullInputPath}" -i "${fullImagePath}" -filter_complex "[1:v]scale=iw*${wmScale}:-1,format=rgba,colorchannelmixer=aa=${opacity}[wm];[0:v][wm]overlay=${pos}" "${outputPath}"`;
        break;
      }

      // 13. Add text overlay
      case "text": {
        const {
          text,
          fontsize = 48,
          fontcolor = "white",
          x = "(w-text_w)/2",
          y = "h-th-20",
          fontfile,
          box = false,
          boxcolor = "black@0.5"
        } = options;

        if (!text) {
          return NextResponse.json(
            { error: "text is required" },
            { status: 400 }
          );
        }
        outputPath = generateOutputPath("text", outputExtension);

        let drawtext = `drawtext=text='${text}':fontsize=${fontsize}:fontcolor=${fontcolor}:x=${x}:y=${y}`;
        if (fontfile) {
          drawtext += `:fontfile=${fontfile}`;
        }
        if (box) {
          drawtext += `:box=1:boxcolor=${boxcolor}:boxborderw=5`;
        }

        command = `ffmpeg -y -i "${fullInputPath}" -vf "${drawtext}" "${outputPath}"`;
        break;
      }

      // 14. Rotate/Flip video
      case "rotate": {
        const { angle = 90, flip } = options;
        outputPath = generateOutputPath("rotated", outputExtension);

        let vf = "";
        if (flip === "horizontal") {
          vf = "hflip";
        } else if (flip === "vertical") {
          vf = "vflip";
        } else if (angle === 90) {
          vf = "transpose=1";
        } else if (angle === 180) {
          vf = "transpose=1,transpose=1";
        } else if (angle === 270 || angle === -90) {
          vf = "transpose=2";
        } else {
          vf = `rotate=${angle}*PI/180`;
        }

        command = `ffmpeg -y -i "${fullInputPath}" -vf "${vf}" "${outputPath}"`;
        break;
      }

      // 15. Extract frames
      case "extract-frames": {
        const { fps = 1, format: imgFormat = "jpg", startTime: frameStart, duration: frameDuration } = options;
        const framesDir = path.join(OUTPUT_DIR, `frames_${Date.now()}`);
        fs.mkdirSync(framesDir, { recursive: true });

        let cmd = `ffmpeg -y -i "${fullInputPath}"`;
        if (frameStart) cmd += ` -ss ${frameStart}`;
        if (frameDuration) cmd += ` -t ${frameDuration}`;
        cmd += ` -vf "fps=${fps}" "${path.join(framesDir, `frame_%04d.${imgFormat}`)}"`;

        command = cmd;
        outputPath = framesDir;
        break;
      }

      // 16. Create GIF
      case "gif": {
        const {
          fps: gifFps = 10,
          width: gifWidth = 480,
          startTime: gifStart,
          duration: gifDuration = 5,
          loop = 0
        } = options;
        outputPath = generateOutputPath("animation", "gif");

        let cmd = `ffmpeg -y -i "${fullInputPath}"`;
        if (gifStart) cmd += ` -ss ${gifStart}`;
        if (gifDuration) cmd += ` -t ${gifDuration}`;
        cmd += ` -vf "fps=${gifFps},scale=${gifWidth}:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" -loop ${loop} "${outputPath}"`;

        command = cmd;
        break;
      }

      // 17. Compress video
      case "compress": {
        const { crf = 28, preset = "medium", maxBitrate } = options;
        outputPath = generateOutputPath("compressed", outputExtension);

        let cmd = `ffmpeg -y -i "${fullInputPath}" -c:v libx264 -crf ${crf} -preset ${preset}`;
        if (maxBitrate) {
          cmd += ` -maxrate ${maxBitrate} -bufsize ${parseInt(maxBitrate) * 2}k`;
        }
        cmd += ` -c:a aac -b:a 128k "${outputPath}"`;

        command = cmd;
        break;
      }

      // 18. Reverse video
      case "reverse": {
        const { reverseAudio = true } = options;
        outputPath = generateOutputPath("reversed", outputExtension);

        if (reverseAudio) {
          command = `ffmpeg -y -i "${fullInputPath}" -vf reverse -af areverse "${outputPath}"`;
        } else {
          command = `ffmpeg -y -i "${fullInputPath}" -vf reverse -an "${outputPath}"`;
        }
        break;
      }

      // 19. Blur video
      case "blur": {
        const { strength = 5 } = options;
        outputPath = generateOutputPath("blurred", outputExtension);
        command = `ffmpeg -y -i "${fullInputPath}" -vf "boxblur=${strength}:${strength}" "${outputPath}"`;
        break;
      }

      // 20. Stabilize video
      case "stabilize": {
        outputPath = generateOutputPath("stabilized", outputExtension);
        // Two-pass stabilization
        const transformFile = path.join(OUTPUT_DIR, `transforms_${Date.now()}.trf`);
        const analyzeCmd = `ffmpeg -y -i "${fullInputPath}" -vf vidstabdetect=stepsize=6:shakiness=8:accuracy=9:result="${transformFile}" -f null -`;
        await execAsync(analyzeCmd, { timeout: 300000 });
        command = `ffmpeg -y -i "${fullInputPath}" -vf vidstabtransform=input="${transformFile}":zoom=1:smoothing=30,unsharp=5:5:0.8:3:3:0.4 "${outputPath}"`;
        break;
      }

      default:
        return NextResponse.json(
          {
            error: "Invalid operation",
            validOperations: [
              "trim", "merge", "convert", "resize", "crop", "speed",
              "filter", "extract-audio", "add-audio", "mute", "volume",
              "watermark", "text", "rotate", "extract-frames", "gif",
              "compress", "reverse", "blur", "stabilize"
            ]
          },
          { status: 400 }
        );
    }

    console.log("FFmpeg command:", command);

    // Execute FFmpeg command
    const { stderr } = await execAsync(command, {
      timeout: 600000, // 10 minutes max
      maxBuffer: 50 * 1024 * 1024,
    });

    if (stderr) console.log("FFmpeg stderr:", stderr);

    // Get output file info
    let outputInfo = null;
    if (fs.existsSync(outputPath) && fs.statSync(outputPath).isFile()) {
      const stats = fs.statSync(outputPath);
      outputInfo = {
        size: `${(stats.size / (1024 * 1024)).toFixed(2)} MB`,
        path: outputPath.replace(path.join(process.cwd(), "public"), ""),
      };
    } else if (fs.existsSync(outputPath) && fs.statSync(outputPath).isDirectory()) {
      // For extract-frames operation
      const files = fs.readdirSync(outputPath);
      outputInfo = {
        framesCount: files.length,
        path: outputPath.replace(path.join(process.cwd(), "public"), ""),
        frames: files.slice(0, 10), // Return first 10 frame names
      };
    }

    return NextResponse.json({
      success: true,
      operation,
      output: outputInfo,
      message: `${operation} completed successfully`,
    });

  } catch (error) {
    console.error("FFmpeg error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "FFmpeg operation failed",
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

// GET: Get video information
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const inputPath = searchParams.get("path");

    if (!inputPath) {
      return NextResponse.json(
        { error: "path query parameter is required" },
        { status: 400 }
      );
    }

    const fullPath = path.join(process.cwd(), "public", inputPath);
    if (!fs.existsSync(fullPath)) {
      return NextResponse.json(
        { error: "File not found" },
        { status: 404 }
      );
    }

    const info = await getVideoInfo(fullPath);

    // Extract useful information
    const videoStream = info.streams?.find((s: { codec_type: string }) => s.codec_type === "video");
    const audioStream = info.streams?.find((s: { codec_type: string }) => s.codec_type === "audio");

    return NextResponse.json({
      format: info.format?.format_name,
      duration: parseFloat(info.format?.duration || 0),
      size: `${(parseInt(info.format?.size || 0) / (1024 * 1024)).toFixed(2)} MB`,
      bitrate: `${(parseInt(info.format?.bit_rate || 0) / 1000).toFixed(0)} kbps`,
      video: videoStream ? {
        codec: videoStream.codec_name,
        width: videoStream.width,
        height: videoStream.height,
        fps: eval(videoStream.r_frame_rate || "0"),
        pixelFormat: videoStream.pix_fmt,
      } : null,
      audio: audioStream ? {
        codec: audioStream.codec_name,
        sampleRate: audioStream.sample_rate,
        channels: audioStream.channels,
        bitrate: audioStream.bit_rate,
      } : null,
    });
  } catch (error) {
    console.error("FFprobe error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get video info" },
      { status: 500 }
    );
  }
}
