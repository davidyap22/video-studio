# FFmpeg Video Editing API Documentation

Base URL: `http://localhost:3000/api/ffmpeg`

## Overview

This API provides comprehensive video editing capabilities powered by FFmpeg. All processed files are saved to `/public/processed/` directory.

---

## Endpoints

### GET `/api/ffmpeg` - Get Video Information

Returns detailed information about a video file.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `path` | string | Yes | Path to video file (relative to `/public/`) |

**Example Request:**
```bash
curl "http://localhost:3000/api/ffmpeg?path=uploads/video.mp4"
```

**Example Response:**
```json
{
  "format": "mov,mp4,m4a,3gp,3g2,mj2",
  "duration": 30.397033,
  "size": "10.24 MB",
  "bitrate": "2827 kbps",
  "video": {
    "codec": "h264",
    "width": 1280,
    "height": 720,
    "fps": 29.97,
    "pixelFormat": "yuv420p"
  },
  "audio": {
    "codec": "aac",
    "sampleRate": "48000",
    "channels": 2,
    "bitrate": "128000"
  }
}
```

---

### POST `/api/ffmpeg` - Process Video

Perform various video editing operations.

**Request Body:**
```json
{
  "operation": "string",
  "inputPath": "string",
  "options": {}
}
```

**Common Response:**
```json
{
  "success": true,
  "operation": "trim",
  "output": {
    "size": "0.78 MB",
    "path": "/processed/trimmed_1234567890.mp4"
  },
  "message": "trim completed successfully"
}
```

---

## Operations

### 1. Trim / Cut Video

Cut a portion of video by specifying start time and duration.

**Options:**
| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `startTime` | string | Yes | Start time in HH:MM:SS format |
| `duration` | string | No* | Duration in seconds |
| `endTime` | string | No* | End time in HH:MM:SS format |

*Either `duration` or `endTime` is required.

```bash
curl -X POST http://localhost:3000/api/ffmpeg \
  -H "Content-Type: application/json" \
  -d '{
    "operation": "trim",
    "inputPath": "uploads/video.mp4",
    "options": {
      "startTime": "00:00:05",
      "duration": "10"
    }
  }'
```

---

### 2. Merge / Concatenate Videos

Join multiple videos into one.

**Options:**
| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `inputPaths` | string[] | Yes | Array of video paths to merge (min 2) |

```bash
curl -X POST http://localhost:3000/api/ffmpeg \
  -H "Content-Type: application/json" \
  -d '{
    "operation": "merge",
    "inputPath": "uploads/video1.mp4",
    "options": {
      "inputPaths": ["uploads/video1.mp4", "uploads/video2.mp4", "uploads/video3.mp4"]
    }
  }'
```

---

### 3. Convert Format

Convert video to different formats.

**Options:**
| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `format` | string | No | "mp4" | Output format: mp4, webm, mov, avi, mkv |
| `codec` | string | No | auto | Video codec (e.g., libx264, libvpx) |

```bash
curl -X POST http://localhost:3000/api/ffmpeg \
  -H "Content-Type: application/json" \
  -d '{
    "operation": "convert",
    "inputPath": "uploads/video.mp4",
    "options": {
      "format": "webm"
    }
  }'
```

---

### 4. Resize / Scale

Change video dimensions.

**Options:**
| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `width` | number | No* | Target width in pixels |
| `height` | number | No* | Target height in pixels |
| `scale` | number | No* | Scale factor (e.g., 0.5 for half size) |

*At least one of width, height, or scale is required.

```bash
# Resize to specific dimensions
curl -X POST http://localhost:3000/api/ffmpeg \
  -H "Content-Type: application/json" \
  -d '{
    "operation": "resize",
    "inputPath": "uploads/video.mp4",
    "options": {
      "width": 1920,
      "height": 1080
    }
  }'

# Resize by scale factor
curl -X POST http://localhost:3000/api/ffmpeg \
  -H "Content-Type: application/json" \
  -d '{
    "operation": "resize",
    "inputPath": "uploads/video.mp4",
    "options": {
      "scale": 0.5
    }
  }'
```

---

### 5. Crop

Crop a portion of the video frame.

**Options:**
| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `cropWidth` | number | Yes | - | Width of crop area |
| `cropHeight` | number | Yes | - | Height of crop area |
| `x` | number | No | 0 | X offset from left |
| `y` | number | No | 0 | Y offset from top |

```bash
curl -X POST http://localhost:3000/api/ffmpeg \
  -H "Content-Type: application/json" \
  -d '{
    "operation": "crop",
    "inputPath": "uploads/video.mp4",
    "options": {
      "cropWidth": 800,
      "cropHeight": 600,
      "x": 100,
      "y": 50
    }
  }'
```

---

### 6. Speed Change

Change playback speed.

**Options:**
| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `videoSpeed` | number | No | 1 | Video speed multiplier (0.25-4) |
| `audioSpeed` | number | No | 1 | Audio speed multiplier (0.5-2) |

```bash
# 2x speed
curl -X POST http://localhost:3000/api/ffmpeg \
  -H "Content-Type: application/json" \
  -d '{
    "operation": "speed",
    "inputPath": "uploads/video.mp4",
    "options": {
      "videoSpeed": 2,
      "audioSpeed": 2
    }
  }'

# Slow motion (0.5x)
curl -X POST http://localhost:3000/api/ffmpeg \
  -H "Content-Type: application/json" \
  -d '{
    "operation": "speed",
    "inputPath": "uploads/video.mp4",
    "options": {
      "videoSpeed": 0.5,
      "audioSpeed": 0.5
    }
  }'
```

---

### 7. Apply Filters

Apply visual filters to video.

**Options:**
| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `filters` | array | Yes | Array of filter objects |

**Available Filters:**
- `grayscale` - Convert to black and white
- `negate` - Invert colors
- `hue` - Adjust hue/saturation (params: `s`, `h`)
- `eq` - Adjust brightness/contrast (params: `brightness`, `contrast`)
- `colorbalance` - Color balance (params: `rs`, `gs`, `bs`)
- `unsharp` - Sharpen
- `vignette` - Add vignette effect
- `boxblur` - Blur (params: `luma_radius`, `chroma_radius`)

```bash
# Apply grayscale and vignette
curl -X POST http://localhost:3000/api/ffmpeg \
  -H "Content-Type: application/json" \
  -d '{
    "operation": "filter",
    "inputPath": "uploads/video.mp4",
    "options": {
      "filters": [
        {"name": "grayscale"},
        {"name": "vignette"}
      ]
    }
  }'

# High contrast
curl -X POST http://localhost:3000/api/ffmpeg \
  -H "Content-Type: application/json" \
  -d '{
    "operation": "filter",
    "inputPath": "uploads/video.mp4",
    "options": {
      "filters": [
        {"name": "eq", "params": {"contrast": 1.5, "brightness": 0.1}}
      ]
    }
  }'
```

---

### 8. Extract Audio

Extract audio track from video.

**Options:**
| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `audioFormat` | string | No | "mp3" | Output format: mp3, aac, wav, flac |
| `bitrate` | string | No | "192k" | Audio bitrate |

```bash
curl -X POST http://localhost:3000/api/ffmpeg \
  -H "Content-Type: application/json" \
  -d '{
    "operation": "extract-audio",
    "inputPath": "uploads/video.mp4",
    "options": {
      "audioFormat": "mp3",
      "bitrate": "320k"
    }
  }'
```

---

### 9. Add / Replace Audio

Add or replace audio track in video.

**Options:**
| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `audioPath` | string | Yes | - | Path to audio file |
| `replaceOriginal` | boolean | No | true | Replace or mix with original audio |

```bash
curl -X POST http://localhost:3000/api/ffmpeg \
  -H "Content-Type: application/json" \
  -d '{
    "operation": "add-audio",
    "inputPath": "uploads/video.mp4",
    "options": {
      "audioPath": "uploads/music.mp3",
      "replaceOriginal": true
    }
  }'
```

---

### 10. Mute

Remove audio from video.

```bash
curl -X POST http://localhost:3000/api/ffmpeg \
  -H "Content-Type: application/json" \
  -d '{
    "operation": "mute",
    "inputPath": "uploads/video.mp4",
    "options": {}
  }'
```

---

### 11. Adjust Volume

Change audio volume level.

**Options:**
| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `level` | number | No | 1 | Volume multiplier (0-3) |

```bash
curl -X POST http://localhost:3000/api/ffmpeg \
  -H "Content-Type: application/json" \
  -d '{
    "operation": "volume",
    "inputPath": "uploads/video.mp4",
    "options": {
      "level": 1.5
    }
  }'
```

---

### 12. Add Watermark

Overlay an image on video.

**Options:**
| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `imagePath` | string | Yes | - | Path to watermark image |
| `position` | string | No | "topright" | Position: topleft, topright, bottomleft, bottomright, center |
| `opacity` | number | No | 0.5 | Opacity (0-1) |
| `scale` | number | No | 0.2 | Scale factor for watermark |

```bash
curl -X POST http://localhost:3000/api/ffmpeg \
  -H "Content-Type: application/json" \
  -d '{
    "operation": "watermark",
    "inputPath": "uploads/video.mp4",
    "options": {
      "imagePath": "uploads/logo.png",
      "position": "bottomright",
      "opacity": 0.7,
      "scale": 0.15
    }
  }'
```

---

### 13. Add Text Overlay

Add text to video.

**Options:**
| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `text` | string | Yes | - | Text to display |
| `fontsize` | number | No | 48 | Font size |
| `fontcolor` | string | No | "white" | Font color |
| `x` | string | No | "(w-text_w)/2" | X position (FFmpeg expression) |
| `y` | string | No | "h-th-20" | Y position (FFmpeg expression) |
| `box` | boolean | No | false | Add background box |
| `boxcolor` | string | No | "black@0.5" | Box color with opacity |

```bash
curl -X POST http://localhost:3000/api/ffmpeg \
  -H "Content-Type: application/json" \
  -d '{
    "operation": "text",
    "inputPath": "uploads/video.mp4",
    "options": {
      "text": "Hello World",
      "fontsize": 64,
      "fontcolor": "yellow",
      "box": true
    }
  }'
```

---

### 14. Rotate / Flip

Rotate or flip video.

**Options:**
| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `angle` | number | No* | Rotation angle: 90, 180, 270 |
| `flip` | string | No* | Flip direction: "horizontal" or "vertical" |

*Either `angle` or `flip` should be provided.

```bash
# Rotate 90 degrees clockwise
curl -X POST http://localhost:3000/api/ffmpeg \
  -H "Content-Type: application/json" \
  -d '{
    "operation": "rotate",
    "inputPath": "uploads/video.mp4",
    "options": {
      "angle": 90
    }
  }'

# Flip horizontally
curl -X POST http://localhost:3000/api/ffmpeg \
  -H "Content-Type: application/json" \
  -d '{
    "operation": "rotate",
    "inputPath": "uploads/video.mp4",
    "options": {
      "flip": "horizontal"
    }
  }'
```

---

### 15. Extract Frames

Extract video frames as images.

**Options:**
| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `fps` | number | No | 1 | Frames per second to extract |
| `format` | string | No | "jpg" | Image format: jpg, png |
| `startTime` | string | No | - | Start time |
| `duration` | string | No | - | Duration to extract |

```bash
curl -X POST http://localhost:3000/api/ffmpeg \
  -H "Content-Type: application/json" \
  -d '{
    "operation": "extract-frames",
    "inputPath": "uploads/video.mp4",
    "options": {
      "fps": 1,
      "format": "png",
      "startTime": "00:00:05",
      "duration": "10"
    }
  }'
```

**Response includes:**
```json
{
  "success": true,
  "operation": "extract-frames",
  "output": {
    "framesCount": 10,
    "path": "/processed/frames_1234567890",
    "frames": ["frame_0001.png", "frame_0002.png", ...]
  }
}
```

---

### 16. Create GIF

Convert video to animated GIF.

**Options:**
| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `fps` | number | No | 10 | GIF frame rate |
| `width` | number | No | 480 | GIF width |
| `startTime` | string | No | - | Start time |
| `duration` | number | No | 5 | Duration in seconds |
| `loop` | number | No | 0 | Loop count (0 = infinite) |

```bash
curl -X POST http://localhost:3000/api/ffmpeg \
  -H "Content-Type: application/json" \
  -d '{
    "operation": "gif",
    "inputPath": "uploads/video.mp4",
    "options": {
      "fps": 15,
      "width": 320,
      "startTime": "00:00:02",
      "duration": 5
    }
  }'
```

---

### 17. Compress Video

Reduce video file size.

**Options:**
| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `crf` | number | No | 28 | Quality (18-40, lower = better quality) |
| `preset` | string | No | "medium" | Encoding speed: ultrafast, fast, medium, slow, veryslow |
| `maxBitrate` | string | No | - | Maximum bitrate (e.g., "1000k") |

```bash
curl -X POST http://localhost:3000/api/ffmpeg \
  -H "Content-Type: application/json" \
  -d '{
    "operation": "compress",
    "inputPath": "uploads/video.mp4",
    "options": {
      "crf": 28,
      "preset": "fast"
    }
  }'
```

---

### 18. Reverse Video

Play video backwards.

**Options:**
| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `reverseAudio` | boolean | No | true | Also reverse audio |

```bash
curl -X POST http://localhost:3000/api/ffmpeg \
  -H "Content-Type: application/json" \
  -d '{
    "operation": "reverse",
    "inputPath": "uploads/video.mp4",
    "options": {
      "reverseAudio": true
    }
  }'
```

---

### 19. Blur Video

Apply blur effect.

**Options:**
| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `strength` | number | No | 5 | Blur strength (1-20) |

```bash
curl -X POST http://localhost:3000/api/ffmpeg \
  -H "Content-Type: application/json" \
  -d '{
    "operation": "blur",
    "inputPath": "uploads/video.mp4",
    "options": {
      "strength": 10
    }
  }'
```

---

### 20. Stabilize Video

Remove camera shake (two-pass processing).

```bash
curl -X POST http://localhost:3000/api/ffmpeg \
  -H "Content-Type: application/json" \
  -d '{
    "operation": "stabilize",
    "inputPath": "uploads/video.mp4",
    "options": {}
  }'
```

> **Note:** Stabilization uses two-pass processing and may take longer than other operations.

---

## Error Handling

**Error Response Format:**
```json
{
  "error": "Error message description",
  "details": "Stack trace (if available)",
  "validOperations": ["trim", "merge", ...] // Only when operation is invalid
}
```

**Common Errors:**
| Status | Error | Description |
|--------|-------|-------------|
| 400 | "Input file not found" | The specified input file doesn't exist |
| 400 | "Invalid operation" | Unknown operation type |
| 400 | "Required option missing" | Missing required option for operation |
| 500 | "FFmpeg operation failed" | FFmpeg command execution failed |

---

## Rate Limits & Timeouts

- **Timeout:** 10 minutes (600,000ms) per operation
- **Max Buffer:** 50MB for FFmpeg output
- **Concurrent Requests:** Not limited, but FFmpeg operations are CPU-intensive

---

## Output Files

All processed files are saved to `/public/processed/` with naming convention:
- `{operation}_{timestamp}.{extension}`
- Example: `trimmed_1234567890.mp4`

Files can be accessed via:
- URL: `/processed/filename.mp4`
- Download: Direct link to file

---

## Examples: Complete Workflow

### Example 1: Prepare video for social media (9:16 portrait)
```bash
# 1. Resize to 9:16
curl -X POST http://localhost:3000/api/ffmpeg \
  -H "Content-Type: application/json" \
  -d '{"operation":"resize","inputPath":"uploads/video.mp4","options":{"width":1080,"height":1920}}'

# 2. Add watermark
curl -X POST http://localhost:3000/api/ffmpeg \
  -H "Content-Type: application/json" \
  -d '{"operation":"watermark","inputPath":"processed/resized_xxx.mp4","options":{"imagePath":"uploads/logo.png","position":"bottomright"}}'

# 3. Compress
curl -X POST http://localhost:3000/api/ffmpeg \
  -H "Content-Type: application/json" \
  -d '{"operation":"compress","inputPath":"processed/watermarked_xxx.mp4","options":{"crf":26}}'
```

### Example 2: Create a highlight reel
```bash
# 1. Trim multiple clips
curl -X POST ... -d '{"operation":"trim","inputPath":"video1.mp4","options":{"startTime":"00:01:00","duration":"5"}}'
curl -X POST ... -d '{"operation":"trim","inputPath":"video2.mp4","options":{"startTime":"00:02:30","duration":"5"}}'

# 2. Merge clips
curl -X POST ... -d '{"operation":"merge","inputPath":"trimmed_1.mp4","options":{"inputPaths":["processed/trimmed_1.mp4","processed/trimmed_2.mp4"]}}'

# 3. Add background music
curl -X POST ... -d '{"operation":"add-audio","inputPath":"processed/merged_xxx.mp4","options":{"audioPath":"uploads/music.mp3"}}'
```
