"use client";

import { useState, useCallback, useMemo } from "react";

type Operation =
  | "trim" | "merge" | "convert" | "resize" | "crop" | "speed"
  | "filter" | "extract-audio" | "add-audio" | "mute" | "volume"
  | "watermark" | "text" | "rotate" | "extract-frames" | "gif"
  | "compress" | "reverse" | "blur" | "stabilize";

interface VideoInfo {
  format: string;
  duration: number;
  size: string;
  bitrate: string;
  video: {
    codec: string;
    width: number;
    height: number;
    fps: number;
    pixelFormat: string;
  } | null;
  audio: {
    codec: string;
    sampleRate: string;
    channels: number;
    bitrate: string;
  } | null;
}

const operations: { id: Operation; name: string; icon: string; description: string }[] = [
  { id: "trim", name: "Trim/Cut", icon: "✂️", description: "Cut a portion of video" },
  { id: "merge", name: "Merge", icon: "🔗", description: "Concatenate multiple videos" },
  { id: "convert", name: "Convert", icon: "🔄", description: "Change video format" },
  { id: "resize", name: "Resize", icon: "📐", description: "Scale video dimensions" },
  { id: "crop", name: "Crop", icon: "🖼️", description: "Crop video frame" },
  { id: "speed", name: "Speed", icon: "⏩", description: "Change playback speed" },
  { id: "filter", name: "Filters", icon: "🎨", description: "Apply visual filters" },
  { id: "extract-audio", name: "Extract Audio", icon: "🎵", description: "Get audio from video" },
  { id: "add-audio", name: "Add Audio", icon: "🔊", description: "Add/replace audio track" },
  { id: "mute", name: "Mute", icon: "🔇", description: "Remove audio" },
  { id: "volume", name: "Volume", icon: "🔉", description: "Adjust audio volume" },
  { id: "watermark", name: "Watermark", icon: "💧", description: "Add image overlay" },
  { id: "text", name: "Text", icon: "📝", description: "Add text overlay" },
  { id: "rotate", name: "Rotate", icon: "🔃", description: "Rotate or flip video" },
  { id: "extract-frames", name: "Extract Frames", icon: "🖼️", description: "Get images from video" },
  { id: "gif", name: "Create GIF", icon: "🎞️", description: "Convert to animated GIF" },
  { id: "compress", name: "Compress", icon: "📦", description: "Reduce file size" },
  { id: "reverse", name: "Reverse", icon: "⏪", description: "Play backwards" },
  { id: "blur", name: "Blur", icon: "🌫️", description: "Apply blur effect" },
  { id: "stabilize", name: "Stabilize", icon: "📹", description: "Remove camera shake" },
];

const formatPresets = [
  { value: "mp4", label: "MP4 (H.264)" },
  { value: "webm", label: "WebM (VP9)" },
  { value: "mov", label: "MOV (QuickTime)" },
  { value: "avi", label: "AVI" },
  { value: "mkv", label: "MKV (Matroska)" },
];

const filterPresets = [
  { name: "grayscale", label: "Grayscale", params: {} },
  { name: "negate", label: "Negative", params: {} },
  { name: "hue", label: "Sepia", params: { s: 0, h: 30 } },
  { name: "eq", label: "High Contrast", params: { contrast: 1.5, brightness: 0.1 } },
  { name: "eq", label: "Bright", params: { brightness: 0.2 } },
  { name: "eq", label: "Dark", params: { brightness: -0.2 } },
  { name: "colorbalance", label: "Warm", params: { rs: 0.3, gs: 0.1, bs: -0.1 } },
  { name: "colorbalance", label: "Cool", params: { rs: -0.1, gs: 0.1, bs: 0.3 } },
  { name: "unsharp", label: "Sharpen", params: {} },
  { name: "vignette", label: "Vignette", params: {} },
];

export default function ToolsPage() {
  const [selectedOp, setSelectedOp] = useState<Operation>("trim");
  const [inputPath, setInputPath] = useState<string>("");
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; output?: { path: string; size?: string } } | null>(null);
  const [uploading, setUploading] = useState(false);

  // Options state for different operations
  const [trimOptions, setTrimOptions] = useState({ startTime: "00:00:00", duration: "5" });
  const [mergeInputs, setMergeInputs] = useState<string[]>([""]);
  const [convertFormat, setConvertFormat] = useState("mp4");
  const [resizeOptions, setResizeOptions] = useState({ width: "1280", height: "720" });
  const [cropOptions, setCropOptions] = useState({ width: "800", height: "600", x: "0", y: "0" });
  const [speedValue, setSpeedValue] = useState("1.5");
  const [selectedFilters, setSelectedFilters] = useState<typeof filterPresets>([]);
  const [audioFormat, setAudioFormat] = useState("mp3");
  const [audioPath, setAudioPath] = useState("");
  const [volumeLevel, setVolumeLevel] = useState("1.5");
  const [watermarkPath, setWatermarkPath] = useState("");
  const [watermarkPosition, setWatermarkPosition] = useState("topright");
  const [watermarkOpacity, setWatermarkOpacity] = useState("0.5");
  const [textOptions, setTextOptions] = useState({ text: "Sample Text", fontsize: "48", fontcolor: "white" });
  const [rotateAngle, setRotateAngle] = useState("90");
  const [flipDirection, setFlipDirection] = useState("");
  const [extractFps, setExtractFps] = useState("1");
  const [gifOptions, setGifOptions] = useState({ fps: "10", width: "480", duration: "5" });
  const [compressOptions, setCompressOptions] = useState({ crf: "28", preset: "medium" });
  const [blurStrength, setBlurStrength] = useState("5");
  const [showApiDocs, setShowApiDocs] = useState(false);

  // Generate curl command for current operation
  const curlCommand = useMemo(() => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
    const endpoint = `${baseUrl}/api/ffmpeg`;

    const curlExamples: Record<Operation, string> = {
      trim: `curl -X POST ${endpoint} \\
  -H "Content-Type: application/json" \\
  -d '{
    "operation": "trim",
    "inputPath": "uploads/video-xxx.mp4",
    "options": {
      "startTime": "00:00:05",
      "duration": "10"
    }
  }'`,
      merge: `curl -X POST ${endpoint} \\
  -H "Content-Type: application/json" \\
  -d '{
    "operation": "merge",
    "inputPath": "uploads/video1.mp4",
    "options": {
      "inputPaths": ["uploads/video1.mp4", "uploads/video2.mp4"],
      "targetWidth": 1920,
      "targetHeight": 1080
    }
  }'`,
      convert: `curl -X POST ${endpoint} \\
  -H "Content-Type: application/json" \\
  -d '{
    "operation": "convert",
    "inputPath": "uploads/video-xxx.mp4",
    "options": {
      "format": "webm"
    }
  }'`,
      resize: `curl -X POST ${endpoint} \\
  -H "Content-Type: application/json" \\
  -d '{
    "operation": "resize",
    "inputPath": "uploads/video-xxx.mp4",
    "options": {
      "width": 1280,
      "height": 720
    }
  }'`,
      crop: `curl -X POST ${endpoint} \\
  -H "Content-Type: application/json" \\
  -d '{
    "operation": "crop",
    "inputPath": "uploads/video-xxx.mp4",
    "options": {
      "cropWidth": 800,
      "cropHeight": 600,
      "x": 100,
      "y": 50
    }
  }'`,
      speed: `curl -X POST ${endpoint} \\
  -H "Content-Type: application/json" \\
  -d '{
    "operation": "speed",
    "inputPath": "uploads/video-xxx.mp4",
    "options": {
      "videoSpeed": 2,
      "audioSpeed": 2
    }
  }'`,
      filter: `curl -X POST ${endpoint} \\
  -H "Content-Type: application/json" \\
  -d '{
    "operation": "filter",
    "inputPath": "uploads/video-xxx.mp4",
    "options": {
      "filters": [
        {"name": "grayscale"},
        {"name": "eq", "params": {"contrast": 1.5}}
      ]
    }
  }'`,
      "extract-audio": `curl -X POST ${endpoint} \\
  -H "Content-Type: application/json" \\
  -d '{
    "operation": "extract-audio",
    "inputPath": "uploads/video-xxx.mp4",
    "options": {
      "audioFormat": "mp3",
      "bitrate": "192k"
    }
  }'`,
      "add-audio": `curl -X POST ${endpoint} \\
  -H "Content-Type: application/json" \\
  -d '{
    "operation": "add-audio",
    "inputPath": "uploads/video-xxx.mp4",
    "options": {
      "audioPath": "uploads/audio-xxx.mp3",
      "replaceOriginal": true
    }
  }'`,
      mute: `curl -X POST ${endpoint} \\
  -H "Content-Type: application/json" \\
  -d '{
    "operation": "mute",
    "inputPath": "uploads/video-xxx.mp4"
  }'`,
      volume: `curl -X POST ${endpoint} \\
  -H "Content-Type: application/json" \\
  -d '{
    "operation": "volume",
    "inputPath": "uploads/video-xxx.mp4",
    "options": {
      "level": 1.5
    }
  }'`,
      watermark: `curl -X POST ${endpoint} \\
  -H "Content-Type: application/json" \\
  -d '{
    "operation": "watermark",
    "inputPath": "uploads/video-xxx.mp4",
    "options": {
      "imagePath": "uploads/logo.png",
      "position": "topright",
      "opacity": 0.5,
      "scale": 0.2
    }
  }'`,
      text: `curl -X POST ${endpoint} \\
  -H "Content-Type: application/json" \\
  -d '{
    "operation": "text",
    "inputPath": "uploads/video-xxx.mp4",
    "options": {
      "text": "Hello World",
      "fontsize": 48,
      "fontcolor": "white",
      "x": "(w-text_w)/2",
      "y": "h-th-20"
    }
  }'`,
      rotate: `curl -X POST ${endpoint} \\
  -H "Content-Type: application/json" \\
  -d '{
    "operation": "rotate",
    "inputPath": "uploads/video-xxx.mp4",
    "options": {
      "angle": 90
    }
  }'

# Or flip:
curl -X POST ${endpoint} \\
  -H "Content-Type: application/json" \\
  -d '{
    "operation": "rotate",
    "inputPath": "uploads/video-xxx.mp4",
    "options": {
      "flip": "horizontal"
    }
  }'`,
      "extract-frames": `curl -X POST ${endpoint} \\
  -H "Content-Type: application/json" \\
  -d '{
    "operation": "extract-frames",
    "inputPath": "uploads/video-xxx.mp4",
    "options": {
      "fps": 1,
      "format": "jpg"
    }
  }'`,
      gif: `curl -X POST ${endpoint} \\
  -H "Content-Type: application/json" \\
  -d '{
    "operation": "gif",
    "inputPath": "uploads/video-xxx.mp4",
    "options": {
      "fps": 10,
      "width": 480,
      "duration": 5,
      "startTime": "00:00:00"
    }
  }'`,
      compress: `curl -X POST ${endpoint} \\
  -H "Content-Type: application/json" \\
  -d '{
    "operation": "compress",
    "inputPath": "uploads/video-xxx.mp4",
    "options": {
      "crf": 28,
      "preset": "medium"
    }
  }'`,
      reverse: `curl -X POST ${endpoint} \\
  -H "Content-Type: application/json" \\
  -d '{
    "operation": "reverse",
    "inputPath": "uploads/video-xxx.mp4",
    "options": {
      "reverseAudio": true
    }
  }'`,
      blur: `curl -X POST ${endpoint} \\
  -H "Content-Type: application/json" \\
  -d '{
    "operation": "blur",
    "inputPath": "uploads/video-xxx.mp4",
    "options": {
      "strength": 5
    }
  }'`,
      stabilize: `curl -X POST ${endpoint} \\
  -H "Content-Type: application/json" \\
  -d '{
    "operation": "stabilize",
    "inputPath": "uploads/video-xxx.mp4"
  }'`
    };

    return curlExamples[selectedOp];
  }, [selectedOp]);

  // Upload handler
  const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>, target: "main" | "merge" | "audio" | "watermark", mergeIndex?: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    // Use correct field name based on file type
    const isVideo = file.type.startsWith("video/");
    const isAudio = file.type.startsWith("audio/");
    const fieldName = isVideo ? "video" : isAudio ? "audio" : "image";
    formData.append(fieldName, file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (data.error) {
        setResult({ success: false, message: `Upload failed: ${data.error}` });
        return;
      }

      if (data.path) {
        if (target === "main") {
          setInputPath(data.path);
          // Get video info
          const infoRes = await fetch(`/api/ffmpeg?path=${encodeURIComponent(data.path)}`);
          const info = await infoRes.json();
          if (!info.error) {
            setVideoInfo(info);
          }
        } else if (target === "merge" && mergeIndex !== undefined) {
          const newInputs = [...mergeInputs];
          newInputs[mergeIndex] = data.path;
          setMergeInputs(newInputs);
        } else if (target === "audio") {
          setAudioPath(data.path);
        } else if (target === "watermark") {
          setWatermarkPath(data.path);
        }
      }
    } catch (error) {
      console.error("Upload error:", error);
      setResult({ success: false, message: `Upload error: ${error instanceof Error ? error.message : "Unknown error"}` });
    } finally {
      setUploading(false);
    }
  }, [mergeInputs]);

  // Process video
  const processVideo = async () => {
    if (!inputPath && selectedOp !== "merge") {
      setResult({ success: false, message: "Please upload a video first" });
      return;
    }

    setProcessing(true);
    setResult(null);

    try {
      let options: Record<string, unknown> = {};

      switch (selectedOp) {
        case "trim":
          options = { startTime: trimOptions.startTime, duration: trimOptions.duration };
          break;
        case "merge":
          options = { inputPaths: mergeInputs.filter(p => p) };
          break;
        case "convert":
          options = { format: convertFormat };
          break;
        case "resize":
          options = { width: parseInt(resizeOptions.width), height: parseInt(resizeOptions.height) };
          break;
        case "crop":
          options = {
            cropWidth: parseInt(cropOptions.width),
            cropHeight: parseInt(cropOptions.height),
            x: parseInt(cropOptions.x),
            y: parseInt(cropOptions.y),
          };
          break;
        case "speed":
          options = { videoSpeed: parseFloat(speedValue), audioSpeed: parseFloat(speedValue) };
          break;
        case "filter":
          options = { filters: selectedFilters };
          break;
        case "extract-audio":
          options = { audioFormat };
          break;
        case "add-audio":
          options = { audioPath, replaceOriginal: true };
          break;
        case "volume":
          options = { level: parseFloat(volumeLevel) };
          break;
        case "watermark":
          options = { imagePath: watermarkPath, position: watermarkPosition, opacity: parseFloat(watermarkOpacity) };
          break;
        case "text":
          options = { ...textOptions, fontsize: parseInt(textOptions.fontsize) };
          break;
        case "rotate":
          options = flipDirection ? { flip: flipDirection } : { angle: parseInt(rotateAngle) };
          break;
        case "extract-frames":
          options = { fps: parseFloat(extractFps) };
          break;
        case "gif":
          options = {
            fps: parseInt(gifOptions.fps),
            width: parseInt(gifOptions.width),
            duration: parseFloat(gifOptions.duration),
          };
          break;
        case "compress":
          options = { crf: parseInt(compressOptions.crf), preset: compressOptions.preset };
          break;
        case "blur":
          options = { strength: parseInt(blurStrength) };
          break;
      }

      const response = await fetch("/api/ffmpeg", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operation: selectedOp,
          inputPath: selectedOp === "merge" ? mergeInputs[0] : inputPath,
          options,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResult({
          success: true,
          message: data.message,
          output: data.output,
        });
      } else {
        setResult({ success: false, message: data.error || "Operation failed" });
      }
    } catch (error) {
      setResult({ success: false, message: error instanceof Error ? error.message : "Unknown error" });
    } finally {
      setProcessing(false);
    }
  };

  // Render options for selected operation
  const renderOptions = () => {
    switch (selectedOp) {
      case "trim":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Start Time (HH:MM:SS)</label>
              <input
                type="text"
                value={trimOptions.startTime}
                onChange={(e) => setTrimOptions({ ...trimOptions, startTime: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                placeholder="00:00:00"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Duration (seconds)</label>
              <input
                type="text"
                value={trimOptions.duration}
                onChange={(e) => setTrimOptions({ ...trimOptions, duration: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                placeholder="5"
              />
            </div>
          </div>
        );

      case "merge":
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-400">Add videos to merge (in order)</p>
            {mergeInputs.map((input, index) => (
              <div key={index} className="flex gap-2">
                <label className="flex-1">
                  <div className="border border-dashed border-gray-600 rounded p-2 text-center cursor-pointer hover:border-gray-500">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => handleUpload(e, "merge", index)}
                      className="hidden"
                    />
                    {input ? `Video ${index + 1} loaded` : `Upload Video ${index + 1}`}
                  </div>
                </label>
                {mergeInputs.length > 2 && (
                  <button
                    onClick={() => setMergeInputs(mergeInputs.filter((_, i) => i !== index))}
                    className="px-3 py-2 bg-red-600 rounded hover:bg-red-700"
                  >
                    X
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={() => setMergeInputs([...mergeInputs, ""])}
              className="w-full py-2 bg-gray-700 rounded hover:bg-gray-600"
            >
              + Add Another Video
            </button>
          </div>
        );

      case "convert":
        return (
          <div>
            <label className="block text-sm text-gray-400 mb-1">Output Format</label>
            <select
              value={convertFormat}
              onChange={(e) => setConvertFormat(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
            >
              {formatPresets.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>
        );

      case "resize":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Width</label>
                <input
                  type="number"
                  value={resizeOptions.width}
                  onChange={(e) => setResizeOptions({ ...resizeOptions, width: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Height</label>
                <input
                  type="number"
                  value={resizeOptions.height}
                  onChange={(e) => setResizeOptions({ ...resizeOptions, height: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                />
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {[
                { w: "1920", h: "1080", label: "1080p" },
                { w: "1280", h: "720", label: "720p" },
                { w: "854", h: "480", label: "480p" },
                { w: "1080", h: "1920", label: "9:16 (Stories)" },
                { w: "1080", h: "1080", label: "1:1 (Square)" },
              ].map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => setResizeOptions({ width: preset.w, height: preset.h })}
                  className="px-3 py-1 bg-gray-700 rounded text-sm hover:bg-gray-600"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        );

      case "crop":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Width</label>
                <input
                  type="number"
                  value={cropOptions.width}
                  onChange={(e) => setCropOptions({ ...cropOptions, width: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Height</label>
                <input
                  type="number"
                  value={cropOptions.height}
                  onChange={(e) => setCropOptions({ ...cropOptions, height: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">X Offset</label>
                <input
                  type="number"
                  value={cropOptions.x}
                  onChange={(e) => setCropOptions({ ...cropOptions, x: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Y Offset</label>
                <input
                  type="number"
                  value={cropOptions.y}
                  onChange={(e) => setCropOptions({ ...cropOptions, y: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                />
              </div>
            </div>
          </div>
        );

      case "speed":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Speed: {speedValue}x</label>
              <input
                type="range"
                min="0.25"
                max="4"
                step="0.25"
                value={speedValue}
                onChange={(e) => setSpeedValue(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {["0.25", "0.5", "0.75", "1", "1.5", "2", "3", "4"].map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeedValue(s)}
                  className={`px-3 py-1 rounded text-sm ${speedValue === s ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"}`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
        );

      case "filter":
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-400">Select filters to apply</p>
            <div className="grid grid-cols-2 gap-2">
              {filterPresets.map((filter) => {
                const isSelected = selectedFilters.some(f => f.label === filter.label);
                return (
                  <button
                    key={filter.label}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedFilters(selectedFilters.filter(f => f.label !== filter.label));
                      } else {
                        setSelectedFilters([...selectedFilters, filter]);
                      }
                    }}
                    className={`px-3 py-2 rounded text-sm ${isSelected ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"}`}
                  >
                    {filter.label}
                  </button>
                );
              })}
            </div>
          </div>
        );

      case "extract-audio":
        return (
          <div>
            <label className="block text-sm text-gray-400 mb-1">Audio Format</label>
            <select
              value={audioFormat}
              onChange={(e) => setAudioFormat(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
            >
              <option value="mp3">MP3</option>
              <option value="aac">AAC</option>
              <option value="wav">WAV</option>
              <option value="flac">FLAC</option>
            </select>
          </div>
        );

      case "add-audio":
        return (
          <div className="space-y-4">
            <label className="block">
              <div className="border border-dashed border-gray-600 rounded p-4 text-center cursor-pointer hover:border-gray-500">
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => handleUpload(e, "audio")}
                  className="hidden"
                />
                {audioPath ? "Audio file loaded" : "Upload Audio File"}
              </div>
            </label>
          </div>
        );

      case "volume":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Volume: {volumeLevel}x</label>
              <input
                type="range"
                min="0"
                max="3"
                step="0.1"
                value={volumeLevel}
                onChange={(e) => setVolumeLevel(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        );

      case "watermark":
        return (
          <div className="space-y-4">
            <label className="block">
              <div className="border border-dashed border-gray-600 rounded p-4 text-center cursor-pointer hover:border-gray-500">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleUpload(e, "watermark")}
                  className="hidden"
                />
                {watermarkPath ? "Watermark image loaded" : "Upload Watermark Image"}
              </div>
            </label>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Position</label>
              <select
                value={watermarkPosition}
                onChange={(e) => setWatermarkPosition(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
              >
                <option value="topleft">Top Left</option>
                <option value="topright">Top Right</option>
                <option value="bottomleft">Bottom Left</option>
                <option value="bottomright">Bottom Right</option>
                <option value="center">Center</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Opacity: {watermarkOpacity}</label>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={watermarkOpacity}
                onChange={(e) => setWatermarkOpacity(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        );

      case "text":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Text</label>
              <input
                type="text"
                value={textOptions.text}
                onChange={(e) => setTextOptions({ ...textOptions, text: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Font Size</label>
                <input
                  type="number"
                  value={textOptions.fontsize}
                  onChange={(e) => setTextOptions({ ...textOptions, fontsize: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Color</label>
                <select
                  value={textOptions.fontcolor}
                  onChange={(e) => setTextOptions({ ...textOptions, fontcolor: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                >
                  <option value="white">White</option>
                  <option value="black">Black</option>
                  <option value="red">Red</option>
                  <option value="yellow">Yellow</option>
                  <option value="blue">Blue</option>
                </select>
              </div>
            </div>
          </div>
        );

      case "rotate":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Rotation</label>
              <div className="flex gap-2 flex-wrap">
                {[
                  { value: "90", label: "90° CW" },
                  { value: "180", label: "180°" },
                  { value: "270", label: "90° CCW" },
                ].map((r) => (
                  <button
                    key={r.value}
                    onClick={() => { setRotateAngle(r.value); setFlipDirection(""); }}
                    className={`px-4 py-2 rounded ${rotateAngle === r.value && !flipDirection ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"}`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Flip</label>
              <div className="flex gap-2">
                <button
                  onClick={() => { setFlipDirection("horizontal"); setRotateAngle(""); }}
                  className={`px-4 py-2 rounded ${flipDirection === "horizontal" ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"}`}
                >
                  Horizontal
                </button>
                <button
                  onClick={() => { setFlipDirection("vertical"); setRotateAngle(""); }}
                  className={`px-4 py-2 rounded ${flipDirection === "vertical" ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"}`}
                >
                  Vertical
                </button>
              </div>
            </div>
          </div>
        );

      case "extract-frames":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Frames per second</label>
              <input
                type="number"
                value={extractFps}
                onChange={(e) => setExtractFps(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                min="0.1"
                max="30"
                step="0.1"
              />
            </div>
            <p className="text-xs text-gray-500">Use 1 for 1 frame per second, 0.1 for 1 frame every 10 seconds</p>
          </div>
        );

      case "gif":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">FPS</label>
                <input
                  type="number"
                  value={gifOptions.fps}
                  onChange={(e) => setGifOptions({ ...gifOptions, fps: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Width</label>
                <input
                  type="number"
                  value={gifOptions.width}
                  onChange={(e) => setGifOptions({ ...gifOptions, width: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Duration (s)</label>
                <input
                  type="number"
                  value={gifOptions.duration}
                  onChange={(e) => setGifOptions({ ...gifOptions, duration: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                />
              </div>
            </div>
          </div>
        );

      case "compress":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Quality (CRF): {compressOptions.crf}</label>
              <input
                type="range"
                min="18"
                max="40"
                value={compressOptions.crf}
                onChange={(e) => setCompressOptions({ ...compressOptions, crf: e.target.value })}
                className="w-full"
              />
              <p className="text-xs text-gray-500">Lower = better quality, larger file. 18-23 is good, 28+ is aggressive compression</p>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Preset</label>
              <select
                value={compressOptions.preset}
                onChange={(e) => setCompressOptions({ ...compressOptions, preset: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
              >
                <option value="ultrafast">Ultrafast (lowest quality)</option>
                <option value="fast">Fast</option>
                <option value="medium">Medium (balanced)</option>
                <option value="slow">Slow (better quality)</option>
                <option value="veryslow">Very Slow (best quality)</option>
              </select>
            </div>
          </div>
        );

      case "blur":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Blur Strength: {blurStrength}</label>
              <input
                type="range"
                min="1"
                max="20"
                value={blurStrength}
                onChange={(e) => setBlurStrength(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        );

      case "mute":
      case "reverse":
      case "stabilize":
        return (
          <p className="text-gray-400 text-sm">No additional options required. Click Process to continue.</p>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/" className="text-gray-400 hover:text-white">
              &larr; Back
            </a>
            <h1 className="text-2xl font-bold">Video Editing Tools</h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowApiDocs(true)}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-medium flex items-center gap-2"
            >
              API Docs
            </button>
            <span className="text-sm text-gray-400">Powered by FFmpeg</span>
          </div>
        </div>
      </header>

      {/* API Docs Modal */}
      {showApiDocs && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-800 flex items-center justify-between">
              <h2 className="text-xl font-bold">API Documentation - {operations.find(o => o.id === selectedOp)?.name}</h2>
              <button
                onClick={() => setShowApiDocs(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                &times;
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1">
              {/* Upload API */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2 text-blue-400">1. Upload File</h3>
                <p className="text-gray-400 text-sm mb-2">First, upload your video file:</p>
                <pre className="bg-gray-800 p-4 rounded-lg overflow-x-auto text-sm">
{`curl -X POST ${typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"}/api/upload \\
  -F "video=@/path/to/your/video.mp4"

# Response:
{
  "success": true,
  "filename": "video-1234567890.mp4",
  "path": "uploads/video-1234567890.mp4",
  "type": "video"
}`}
                </pre>
              </div>

              {/* Operation API */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2 text-green-400">2. Process Video - {operations.find(o => o.id === selectedOp)?.name}</h3>
                <p className="text-gray-400 text-sm mb-2">Then, use the path from upload response:</p>
                <pre className="bg-gray-800 p-4 rounded-lg overflow-x-auto text-sm whitespace-pre-wrap">
                  {curlCommand}
                </pre>
              </div>

              {/* Get Video Info */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2 text-yellow-400">Get Video Info (Optional)</h3>
                <pre className="bg-gray-800 p-4 rounded-lg overflow-x-auto text-sm">
{`curl "${typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"}/api/ffmpeg?path=uploads/video-xxx.mp4"

# Response:
{
  "format": "mov,mp4,m4a,3gp,3g2,mj2",
  "duration": 10.5,
  "size": "5.13 MB",
  "bitrate": "3909 kbps",
  "video": {
    "codec": "h264",
    "width": 1920,
    "height": 1080,
    "fps": 30
  },
  "audio": {
    "codec": "aac",
    "sampleRate": "44100",
    "channels": 2
  }
}`}
                </pre>
              </div>

              {/* Response Format */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2 text-purple-400">Response Format</h3>
                <pre className="bg-gray-800 p-4 rounded-lg overflow-x-auto text-sm">
{`# Success:
{
  "success": true,
  "operation": "${selectedOp}",
  "output": {
    "size": "3.47 MB",
    "path": "/processed/trimmed_1234567890.mp4"
  },
  "message": "${selectedOp} completed successfully"
}

# Error:
{
  "error": "Error message here",
  "details": "Stack trace (if available)"
}`}
                </pre>
              </div>

              {/* All Operations */}
              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-300">All Available Operations</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {operations.map(op => (
                    <button
                      key={op.id}
                      onClick={() => {
                        setSelectedOp(op.id);
                      }}
                      className={`px-3 py-2 rounded text-sm text-left ${selectedOp === op.id ? "bg-blue-600" : "bg-gray-800 hover:bg-gray-700"}`}
                    >
                      {op.icon} {op.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-800 flex justify-between">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(curlCommand);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium"
              >
                Copy curl Command
              </button>
              <button
                onClick={() => setShowApiDocs(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Tools Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
              <h2 className="text-lg font-semibold mb-4">Tools</h2>
              <div className="space-y-1 max-h-[600px] overflow-y-auto">
                {operations.map((op) => (
                  <button
                    key={op.id}
                    onClick={() => {
                      setSelectedOp(op.id);
                      setResult(null); // Clear previous result when switching tools
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition ${
                      selectedOp === op.id
                        ? "bg-blue-600"
                        : "hover:bg-gray-800"
                    }`}
                  >
                    <span className="text-lg">{op.icon}</span>
                    <div>
                      <div className="font-medium text-sm">{op.name}</div>
                      <div className="text-xs text-gray-400">{op.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Video Upload & Preview - Hide for Merge operation */}
            {selectedOp !== "merge" && (
              <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                <h2 className="text-lg font-semibold mb-4">Input Video</h2>

                <label className="block mb-4">
                  <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-gray-500 transition">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => handleUpload(e, "main")}
                      className="hidden"
                      disabled={uploading}
                    />
                    {uploading ? (
                      <div className="text-gray-400">Uploading...</div>
                    ) : inputPath ? (
                      <div>
                        <div className="text-green-400 mb-2">Video loaded</div>
                        <div className="text-gray-500 text-sm">{inputPath}</div>
                      </div>
                    ) : (
                      <>
                        <div className="text-gray-400 mb-1">Click to upload video</div>
                        <div className="text-gray-500 text-sm">MP4, WebM, MOV, AVI</div>
                      </>
                    )}
                  </div>
                </label>

                {/* Video Info */}
                {videoInfo && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-800 rounded-lg">
                    <div>
                      <div className="text-xs text-gray-400">Duration</div>
                      <div className="font-medium">{videoInfo.duration.toFixed(2)}s</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">Resolution</div>
                      <div className="font-medium">{videoInfo.video?.width}x{videoInfo.video?.height}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">Size</div>
                      <div className="font-medium">{videoInfo.size}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">Format</div>
                      <div className="font-medium">{videoInfo.format}</div>
                    </div>
                  </div>
                )}

                {/* Video Preview */}
                {inputPath && (
                  <div className="mt-4">
                    <video
                      src={`/${inputPath}`}
                      controls
                      playsInline
                      preload="metadata"
                      className="w-full max-h-[400px] bg-black rounded-lg"
                      onError={(e) => {
                        console.error("Video load error:", e);
                        setResult({ success: false, message: `Video preview failed to load. Path: /${inputPath}` });
                      }}
                      onLoadedData={() => console.log("Video loaded successfully")}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Operation Options */}
            <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{operations.find(o => o.id === selectedOp)?.icon}</span>
                <h2 className="text-lg font-semibold">{operations.find(o => o.id === selectedOp)?.name}</h2>
              </div>

              {renderOptions()}

              <button
                onClick={processVideo}
                disabled={processing || (selectedOp !== "merge" && !inputPath)}
                className={`mt-6 w-full py-3 rounded-lg font-semibold transition ${
                  processing || (selectedOp !== "merge" && !inputPath)
                    ? "bg-gray-700 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {processing ? "Processing..." : "Process Video"}
              </button>
            </div>

            {/* Result */}
            {result && (
              <div className={`bg-gray-900 rounded-xl p-4 border ${result.success ? "border-green-600" : "border-red-600"}`}>
                <h3 className={`font-semibold mb-2 ${result.success ? "text-green-400" : "text-red-400"}`}>
                  {result.success ? "Success!" : "Error"}
                </h3>
                <p className="text-gray-300">{result.message}</p>

                {result.success && result.output && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-400 mb-2">Output: {result.output.size}</p>
                    {result.output.path.endsWith(".gif") ? (
                      <img src={result.output.path} alt="Output GIF" className="max-w-full rounded-lg" />
                    ) : result.output.path.includes("frames_") ? (
                      <p className="text-sm text-gray-400">Frames extracted to: {result.output.path}</p>
                    ) : result.output.path.endsWith(".mp3") || result.output.path.endsWith(".wav") || result.output.path.endsWith(".aac") || result.output.path.endsWith(".flac") ? (
                      <audio src={result.output.path} controls className="w-full" />
                    ) : (
                      <video src={result.output.path} controls className="w-full max-h-[400px] bg-black rounded-lg" />
                    )}
                    <a
                      href={result.output.path}
                      download
                      className="inline-block mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium"
                    >
                      Download
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
