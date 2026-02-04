# Video Studio

An open-source video editing studio built with **Next.js**, **Remotion**, and **FFmpeg**. Create stunning videos using pre-built templates or process videos with powerful FFmpeg tools.

![Video Studio](https://img.shields.io/badge/Video-Studio-blue)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![FFmpeg](https://img.shields.io/badge/FFmpeg-8.0-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

## Features

### Video Templates (Remotion)
- 20+ professionally designed video templates
- Real-time preview with Remotion Player
- Customizable parameters (text, colors, timing, etc.)
- Export in various formats

### FFmpeg Video Tools
- **Trim/Cut** - Cut portions of video with frame-accurate precision
- **Merge** - Concatenate multiple videos (handles different resolutions)
- **Convert** - Change video formats (MP4, WebM, MOV, AVI, MKV)
- **Resize** - Scale video dimensions with presets
- **Crop** - Crop video frame
- **Speed** - Change playback speed (0.25x - 4x)
- **Filters** - Apply visual filters (grayscale, sepia, contrast, etc.)
- **Extract Audio** - Get audio from video (MP3, AAC, WAV, FLAC)
- **Add Audio** - Add/replace audio track
- **Mute** - Remove audio
- **Volume** - Adjust audio volume
- **Watermark** - Add image overlay
- **Text** - Add text overlay
- **Rotate** - Rotate or flip video
- **Extract Frames** - Get images from video
- **Create GIF** - Convert video to animated GIF
- **Compress** - Reduce file size with quality control
- **Reverse** - Play video backwards
- **Blur** - Apply blur effect
- **Stabilize** - Remove camera shake

## Screenshots

| Dashboard | Video Tools |
|-----------|-------------|
| Template selection & preview | FFmpeg editing tools |

## Getting Started

### Prerequisites

- Node.js 18+
- FFmpeg 5+ (for video tools)

#### Install FFmpeg

**macOS:**
```bash
brew install ffmpeg
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install ffmpeg
```

**Windows:**
Download from [ffmpeg.org](https://ffmpeg.org/download.html) and add to PATH.

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/video-studio.git
cd video-studio
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Video Templates

1. Visit the dashboard at `/`
2. Browse available templates
3. Click on a template to customize
4. Adjust parameters (text, colors, duration, etc.)
5. Preview in real-time
6. Render and download

### FFmpeg Tools

1. Visit `/tools`
2. Select a tool from the sidebar
3. Upload your video
4. Configure options
5. Click "Process Video"
6. Download the result

## API Documentation

### Upload File

```bash
curl -X POST http://localhost:3000/api/upload \
  -F "video=@/path/to/your/video.mp4"
```

Response:
```json
{
  "success": true,
  "filename": "video-1234567890.mp4",
  "path": "uploads/video-1234567890.mp4",
  "type": "video"
}
```

### Process Video

```bash
curl -X POST http://localhost:3000/api/ffmpeg \
  -H "Content-Type: application/json" \
  -d '{
    "operation": "trim",
    "inputPath": "uploads/video-xxx.mp4",
    "options": {
      "startTime": "00:00:05",
      "duration": "10"
    }
  }'
```

Response:
```json
{
  "success": true,
  "operation": "trim",
  "output": {
    "size": "3.47 MB",
    "path": "/processed/trimmed_1234567890.mp4"
  },
  "message": "trim completed successfully"
}
```

### Get Video Info

```bash
curl "http://localhost:3000/api/ffmpeg?path=uploads/video-xxx.mp4"
```

Response:
```json
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
}
```

### All Operations

| Operation | Description | Key Options |
|-----------|-------------|-------------|
| `trim` | Cut video | `startTime`, `duration`, `endTime` |
| `merge` | Concatenate videos | `inputPaths[]`, `targetWidth`, `targetHeight` |
| `convert` | Change format | `format` (mp4, webm, mov, avi, mkv) |
| `resize` | Scale dimensions | `width`, `height`, `scale` |
| `crop` | Crop frame | `cropWidth`, `cropHeight`, `x`, `y` |
| `speed` | Change speed | `videoSpeed`, `audioSpeed` |
| `filter` | Apply filters | `filters[]` |
| `extract-audio` | Get audio | `audioFormat`, `bitrate` |
| `add-audio` | Add audio | `audioPath`, `replaceOriginal` |
| `mute` | Remove audio | - |
| `volume` | Adjust volume | `level` |
| `watermark` | Add overlay | `imagePath`, `position`, `opacity` |
| `text` | Add text | `text`, `fontsize`, `fontcolor` |
| `rotate` | Rotate/flip | `angle` or `flip` |
| `extract-frames` | Get frames | `fps`, `format` |
| `gif` | Create GIF | `fps`, `width`, `duration` |
| `compress` | Reduce size | `crf`, `preset` |
| `reverse` | Play backwards | `reverseAudio` |
| `blur` | Blur effect | `strength` |
| `stabilize` | Stabilize | - |

## Project Structure

```
video-studio/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── ffmpeg/      # FFmpeg API endpoint
│   │   │   ├── upload/      # File upload endpoint
│   │   │   └── render/      # Remotion render endpoint
│   │   ├── tools/           # FFmpeg tools UI
│   │   └── page.tsx         # Dashboard
│   ├── components/          # React components
│   └── remotion/            # Remotion templates
├── public/
│   ├── uploads/             # Uploaded files (gitignored)
│   └── processed/           # Processed files (gitignored)
└── package.json
```

## Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
npm run remotion   # Open Remotion Studio
npm run render     # Render video locally
```

## Deployment

### Local / Self-Hosted

This project requires FFmpeg to be installed on the server. It works best on:
- VPS (DigitalOcean, Linode, AWS EC2)
- Docker containers
- Self-hosted servers

### Vercel (Limited)

**Note:** FFmpeg tools will NOT work on Vercel due to:
- No FFmpeg installation
- Serverless function timeouts
- File system limitations

Only the Remotion templates and preview features will work on Vercel.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Remotion](https://remotion.dev) - Programmatic video creation
- [FFmpeg](https://ffmpeg.org) - Video processing
- [Next.js](https://nextjs.org) - React framework
- [TailwindCSS](https://tailwindcss.com) - Styling

## Support

If you find this project helpful, please give it a star!

For issues and feature requests, please [open an issue](https://github.com/your-username/video-studio/issues).
