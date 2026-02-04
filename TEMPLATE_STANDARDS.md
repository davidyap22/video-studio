# Template Standards - 模版标准规范

## 硬性要求 (Mandatory Requirements)

每个模版都必须包含以下功能：

### 1. Font 字体
- **标准字体**: `fontFamily: "Georgia, Times New Roman, serif"`
- **字重**: `fontWeight: 700`
- **行高**: `lineHeight: 1.3`
- 与 Headline 模版保持一致

### 2. 视频秒数调整 (Duration Control)
- 提供滑块控制视频时长
- 范围: 3秒 - 15秒
- 默认: 6秒
- UI: `<input type="range">` slider
- Props: `durationInSeconds: number`

### 3. 字体颜色调整 (Text Color)
- 提供颜色选择器
- UI: `<input type="color">`
- Props: `textColor: string`
- 默认: 根据模版风格设定

### 4. 字体大小调整 (Font Size)
- 主标题大小滑块
- 副标题大小滑块 (如有)
- 范围: 根据元素类型设定合理范围
- Props: `mainTitleSize: number`, `subtitleSize?: number`

### 5. 无淡入淡出 (No Fade In/Out)
- **禁止** 使用 fade in / fade out 效果
- 内容必须即时显示，不要渐变动画
- 元素动画（如弹跳、滑入）可以保留，但整体透明度不要渐变
- ❌ 错误示例:
  ```typescript
  const fadeIn = interpolate(frame, [0, 30], [0, 1]);
  const fadeOut = interpolate(frame, [durationInFrames - 30, durationInFrames], [1, 0]);
  <AbsoluteFill style={{ opacity: fadeIn * fadeOut }}>
  ```
- ✅ 正确示例:
  ```typescript
  <AbsoluteFill>
    {/* 内容即时显示 */}
  </AbsoluteFill>
  ```

### 6. 视频静音 (Muted Videos)
- **所有** Video 组件必须添加 `muted` 属性
- 上传的视频可能带有音频，必须静音播放
- ✅ 正确示例:
  ```typescript
  <Video
    src={staticFile(videoSrc)}
    muted
    style={{ width: "100%", height: "100%", objectFit: "cover" }}
  />
  ```

### 7. API 支持 (API Support)
- **所有** 模版必须支持 API 渲染
- 端点: `POST /api/templates/render`
- 必须在 Root.tsx 注册 Composition
- 必须在 /api/templates/route.ts 定义 schema
- curl 调用示例见文档底部

---

## 可选功能 (Optional Features)

### 1. 背景视频 (Video Background)
- **Default**: 纯颜色背景
- **上传视频后**:
  - Opacity: 20%
  - Blur/清晰度: 50% (`filter: blur(4px)`)
- Props: `videoSrc?: string`
- Schema: `videoSrc: z.string().optional()`

### 2. 背景图片 (Image Background)
- **Default**: 纯颜色背景
- **上传图片后**:
  - Opacity: 100%
  - 清晰度: 100% (无 blur)
  - 可叠加颜色滤镜
- Props: `imageSrc?: string`
- Schema: `imageSrc: z.string().optional()`

---

## 模版清单及合规状态 (已更新 2026-02-03)

| 模版 | API | Font | Duration | Text Color | Font Size | No Fade | Muted | Video BG | Image BG |
|------|-----|------|----------|------------|-----------|---------|-------|----------|----------|
| TitleCard | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Intro | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Headline | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| QuoteCard | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| OutlineCard | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Timeline | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| TimelineDiagonal | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | N/A | ❌ | ❌ |
| TimelineZoom | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | N/A | ❌ | ❌ |
| TimelineRewind | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | N/A | ❌ | ❌ |
| ImageShowcase | ✅ | ✅ | ✅ | N/A | N/A | ✅ | N/A | ❌ | ✅ |
| AlertTitle | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | N/A | ❌ | ❌ |
| AlertTitleV2 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | N/A | ❌ | ❌ |
| FootballMap | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | N/A | ❌ | ❌ |
| FootballMap3D | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | N/A | ❌ | ❌ |
| FilmTimeline | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 实施计划

### Phase 1: 更新所有模版的硬性要求
1. 统一字体到 Georgia
2. 添加 duration 控制
3. 确保 textColor 可调
4. 添加 fontSize 控制

### Phase 2: 添加可选功能
1. 为需要的模版添加视频背景支持
2. 为需要的模版添加图片背景支持

---

## 代码模版

### Schema 标准模版
```typescript
export const templateSchema = z.object({
  // 必填
  title: z.string(),

  // 硬性要求
  textColor: z.string().optional(),
  titleSize: z.number().optional(),
  subtitleSize: z.number().optional(),

  // 可选 - 背景
  backgroundColor: z.string().optional(),
  videoSrc: z.string().optional(),
  imageSrc: z.string().optional(),
});
```

### 字体样式标准
```typescript
const textStyle = {
  fontFamily: "Georgia, Times New Roman, serif",
  fontWeight: 700,
  lineHeight: 1.3,
  fontSize: titleSize, // from props
  color: textColor,    // from props
};
```

### 视频背景标准
```typescript
{videoSrc && (
  <AbsoluteFill style={{ opacity: 0.2, filter: "blur(4px)" }}>
    <Video
      src={staticFile(videoSrc)}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
      }}
    />
  </AbsoluteFill>
)}
```

### 图片背景标准
```typescript
{imageSrc && (
  <AbsoluteFill>
    <Img
      src={staticFile(imageSrc)}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
      }}
    />
  </AbsoluteFill>
)}
```

---

## API 接口文档

### Base URL
```
http://localhost:3002
```

### 端点列表

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/templates` | GET | 获取所有模版列表及参数 |
| `/api/templates/render` | POST | 渲染视频 |
| `/api/upload` | POST | 上传媒体文件 |

---

### GET /api/templates - 获取模版列表

```bash
curl http://localhost:3002/api/templates
```

---

### POST /api/templates/render - 渲染视频

**请求参数:**
- `template` (required): 模版名称
- `props` (required): 模版参数
- `duration` (optional): 视频时长（秒），默认 6
- `fps` (optional): 帧率，默认 30

---

## curl 示例 - 所有模版

### 1. TitleCard
```bash
curl -X POST http://localhost:3002/api/templates/render \
  -H "Content-Type: application/json" \
  -d '{
    "template": "TitleCard",
    "props": {
      "videoSrc": "uploads/background.mp4",
      "title": "Political Instability",
      "subtitle": "A Global Crisis",
      "textColor": "#c9a067",
      "subtitleColor": "#ffffff",
      "titleSize": 80,
      "subtitleSize": 28
    },
    "duration": 6
  }'
```

### 2. Intro
```bash
curl -X POST http://localhost:3002/api/templates/render \
  -H "Content-Type: application/json" \
  -d '{
    "template": "Intro",
    "props": {
      "videoSrc": "uploads/background.mp4",
      "title": "Venezuela",
      "subtitle": "Economic Crisis",
      "textColor": "#c9a067",
      "titleSize": 80,
      "subtitleSize": 28
    },
    "duration": 6
  }'
```

### 3. Headline
```bash
curl -X POST http://localhost:3002/api/templates/render \
  -H "Content-Type: application/json" \
  -d '{
    "template": "Headline",
    "props": {
      "headline1": "Breaking News:",
      "headline2": "Major announcement expected today",
      "highlightWords": ["Breaking News", "Major"],
      "highlightColor": "#ffd700",
      "backgroundColor": "#1a1a1a",
      "textColor": "#ffffff",
      "videoSrc": "",
      "fontSize": 72
    },
    "duration": 6
  }'
```

### 4. QuoteCard
```bash
curl -X POST http://localhost:3002/api/templates/render \
  -H "Content-Type: application/json" \
  -d '{
    "template": "QuoteCard",
    "props": {
      "portraitSrc": "uploads/portrait.jpg",
      "personName": "Alfred Adler",
      "quoteLine1": "Almost all human suffering",
      "quoteLine2": "comes from social interaction",
      "videoSrc": "",
      "textColor": "#c9a067",
      "quoteSize": 48,
      "nameSize": 32
    },
    "duration": 6
  }'
```

### 5. OutlineCard
```bash
curl -X POST http://localhost:3002/api/templates/render \
  -H "Content-Type: application/json" \
  -d '{
    "template": "OutlineCard",
    "props": {
      "badge": "Outline",
      "cardTitle": "Disadvantages",
      "cardSubtitle": "Overview",
      "cardImageSrc": "",
      "videoSrc": "",
      "point1": "Lack of feedback",
      "point2": "Cognitive decline",
      "point3": "Health risks",
      "textColor": "#c9a067",
      "titleSize": 48,
      "pointSize": 56
    },
    "duration": 6
  }'
```

### 6. Timeline
```bash
curl -X POST http://localhost:3002/api/templates/render \
  -H "Content-Type: application/json" \
  -d '{
    "template": "Timeline",
    "props": {
      "items": [
        {"year": "1990", "label": "Beginning"},
        {"year": "2000", "label": "Growth"},
        {"year": "2010", "label": "Expansion"},
        {"year": "2020", "label": "Innovation"},
        {"year": "2025", "label": "Future"}
      ],
      "lineColor": "#ffd700",
      "textColor": "#ffd700",
      "yearSize": 28,
      "labelSize": 16,
      "backgroundVideoSrc": "",
      "backgroundImageSrc": ""
    },
    "duration": 8
  }'
```

### 7. TimelineDiagonal
```bash
curl -X POST http://localhost:3002/api/templates/render \
  -H "Content-Type: application/json" \
  -d '{
    "template": "TimelineDiagonal",
    "props": {
      "items": [
        {"year": "1990", "label": "Formation"},
        {"year": "2000", "label": "Growth"},
        {"year": "2010", "label": "Network"},
        {"year": "2020", "label": "Modern"},
        {"year": "2025", "label": "Future"}
      ],
      "lineColor": "#ffd700",
      "textColor": "#ffd700"
    },
    "duration": 10
  }'
```

### 8. TimelineZoom
```bash
curl -X POST http://localhost:3002/api/templates/render \
  -H "Content-Type: application/json" \
  -d '{
    "template": "TimelineZoom",
    "props": {
      "items": [
        {"year": "1990", "label": "Formation"},
        {"year": "2000", "label": "Evolution"},
        {"year": "2010", "label": "Revolution"},
        {"year": "2020", "label": "Innovation"},
        {"year": "2025", "label": "Future"}
      ],
      "lineColor": "#ffd700",
      "textColor": "#ffd700",
      "direction": "leftToRight"
    },
    "duration": 15
  }'
```

### 9. TimelineRewind
```bash
curl -X POST http://localhost:3002/api/templates/render \
  -H "Content-Type: application/json" \
  -d '{
    "template": "TimelineRewind",
    "props": {
      "items": [
        {"year": "1990", "label": "Beginning"},
        {"year": "2000", "label": "Growth"},
        {"year": "2010", "label": "Expansion"},
        {"year": "2020", "label": "Innovation"},
        {"year": "2025", "label": "Future"}
      ],
      "lineColor": "#ffd700",
      "textColor": "#ffd700"
    },
    "duration": 10
  }'
```

### 10. ImageShowcase
```bash
curl -X POST http://localhost:3002/api/templates/render \
  -H "Content-Type: application/json" \
  -d '{
    "template": "ImageShowcase",
    "props": {
      "images": [
        "uploads/image1.jpg",
        "uploads/image2.jpg",
        "uploads/image3.jpg"
      ],
      "direction": "bottomToTop",
      "skewAngle": 8,
      "backgroundColor": "#0a0a0a"
    },
    "duration": 6
  }'
```

### 11. AlertTitle
```bash
curl -X POST http://localhost:3002/api/templates/render \
  -H "Content-Type: application/json" \
  -d '{
    "template": "AlertTitle",
    "props": {
      "mainTitle": "制裁",
      "subtitle": "Sanctions",
      "bannerText": "SANCTIONS 制裁",
      "backgroundColor": "#2a1515",
      "ringColor": "#8866aa",
      "bannerColor": "#6b3a3a",
      "textColor": "#d4af7a",
      "titleSize": 120,
      "subtitleSize": 48
    },
    "duration": 6
  }'
```

### 12. AlertTitleV2
```bash
curl -X POST http://localhost:3002/api/templates/render \
  -H "Content-Type: application/json" \
  -d '{
    "template": "AlertTitleV2",
    "props": {
      "mainTitle": "制裁",
      "subtitle": "Sanctions",
      "bannerTexts": ["SANCTIONS", "制裁", "RESTRICTED"],
      "backgroundColor": "#120808",
      "ringColor": "#7755aa",
      "textColor": "#c9a067",
      "titleSize": 140,
      "subtitleSize": 48
    },
    "duration": 6
  }'
```

### 13. FootballMap
```bash
curl -X POST http://localhost:3002/api/templates/render \
  -H "Content-Type: application/json" \
  -d '{
    "template": "FootballMap",
    "props": {
      "country": "england",
      "title": "England",
      "subtitle": "Premier League",
      "highlightColor": "#ffd700",
      "textColor": "#ffd700",
      "backgroundColor": "#0a0a15",
      "titleSize": 72,
      "subtitleSize": 36
    },
    "duration": 6
  }'
```

### 14. FootballMap3D
```bash
curl -X POST http://localhost:3002/api/templates/render \
  -H "Content-Type: application/json" \
  -d '{
    "template": "FootballMap3D",
    "props": {
      "country": "england",
      "title": "England",
      "subtitle": "Premier League",
      "highlightColor": "#ffd700",
      "textColor": "#ffd700",
      "backgroundColor": "#0a0a15",
      "titleSize": 72,
      "subtitleSize": 36
    },
    "duration": 6
  }'
```

### 15. FilmTimeline
```bash
curl -X POST http://localhost:3002/api/templates/render \
  -H "Content-Type: application/json" \
  -d '{
    "template": "FilmTimeline",
    "props": {
      "mediaItems": [
        {"src": "uploads/old1.jpg", "type": "image", "caption": "Event 1", "year": 1920},
        {"src": "uploads/old2.mp4", "type": "video", "caption": "Event 2", "year": 1940},
        {"src": "uploads/old3.jpg", "type": "image", "caption": "Event 3", "year": 1960}
      ],
      "startYear": 1920,
      "endYear": 1980,
      "captionSize": 48,
      "textColor": "#ffffff",
      "blackAndWhite": true
    },
    "duration": 10
  }'
```

---

## 上传媒体文件

### POST /api/upload - 上传文件

**上传视频:**
```bash
curl -X POST http://localhost:3002/api/upload \
  -F "video=@/path/to/your/video.mp4"
```

**上传图片:**
```bash
curl -X POST http://localhost:3002/api/upload \
  -F "image=@/path/to/your/image.jpg"
```

**响应示例:**
```json
{
  "success": true,
  "path": "uploads/1706990400000_video.mp4"
}
```

---

## 响应格式

### 渲染成功响应
```json
{
  "success": true,
  "template": "TitleCard",
  "videoUrl": "/renders/TitleCard_1706990400000.mp4",
  "downloadUrl": "http://localhost:3002/renders/TitleCard_1706990400000.mp4",
  "fileSize": "2.45 MB",
  "duration": "6 seconds",
  "fps": 30
}
```

### 错误响应
```json
{
  "error": "Invalid template",
  "validTemplates": ["TitleCard", "Intro", "Headline", ...]
}
```

---

## 下载渲染视频

渲染完成后，可以直接下载:
```bash
curl -O http://localhost:3002/renders/TitleCard_1706990400000.mp4
```

或在浏览器打开 `downloadUrl` 直接下载。

---

## FFmpeg 视频剪辑工具 (Video Editing Tools)

除了模版渲染，还提供 20 个 FFmpeg 视频编辑工具。

### 访问方式
- **UI 界面**: http://localhost:3000/tools
- **API 端点**: `/api/ffmpeg`
- **详细文档**: 参见 [FFMPEG_API.md](./FFMPEG_API.md)

### 可用操作 (20 个工具)

| 操作 | 说明 | curl 示例 |
|------|------|-----------|
| `trim` | 剪切视频 | `{"operation":"trim","inputPath":"uploads/video.mp4","options":{"startTime":"00:00:05","duration":"10"}}` |
| `merge` | 合并视频 | `{"operation":"merge","inputPath":"uploads/v1.mp4","options":{"inputPaths":["uploads/v1.mp4","uploads/v2.mp4"]}}` |
| `convert` | 格式转换 | `{"operation":"convert","inputPath":"uploads/video.mp4","options":{"format":"webm"}}` |
| `resize` | 调整尺寸 | `{"operation":"resize","inputPath":"uploads/video.mp4","options":{"width":1920,"height":1080}}` |
| `crop` | 裁剪画面 | `{"operation":"crop","inputPath":"uploads/video.mp4","options":{"cropWidth":800,"cropHeight":600,"x":100,"y":50}}` |
| `speed` | 变速 | `{"operation":"speed","inputPath":"uploads/video.mp4","options":{"videoSpeed":2}}` |
| `filter` | 滤镜 | `{"operation":"filter","inputPath":"uploads/video.mp4","options":{"filters":[{"name":"grayscale"}]}}` |
| `extract-audio` | 提取音频 | `{"operation":"extract-audio","inputPath":"uploads/video.mp4","options":{"audioFormat":"mp3"}}` |
| `add-audio` | 添加音频 | `{"operation":"add-audio","inputPath":"uploads/video.mp4","options":{"audioPath":"uploads/music.mp3"}}` |
| `mute` | 静音 | `{"operation":"mute","inputPath":"uploads/video.mp4","options":{}}` |
| `volume` | 音量调节 | `{"operation":"volume","inputPath":"uploads/video.mp4","options":{"level":1.5}}` |
| `watermark` | 水印 | `{"operation":"watermark","inputPath":"uploads/video.mp4","options":{"imagePath":"uploads/logo.png","position":"bottomright"}}` |
| `text` | 文字叠加 | `{"operation":"text","inputPath":"uploads/video.mp4","options":{"text":"Hello","fontsize":64}}` |
| `rotate` | 旋转/翻转 | `{"operation":"rotate","inputPath":"uploads/video.mp4","options":{"angle":90}}` |
| `extract-frames` | 提取帧 | `{"operation":"extract-frames","inputPath":"uploads/video.mp4","options":{"fps":1}}` |
| `gif` | 创建GIF | `{"operation":"gif","inputPath":"uploads/video.mp4","options":{"fps":10,"width":320,"duration":5}}` |
| `compress` | 压缩 | `{"operation":"compress","inputPath":"uploads/video.mp4","options":{"crf":28,"preset":"fast"}}` |
| `reverse` | 倒放 | `{"operation":"reverse","inputPath":"uploads/video.mp4","options":{}}` |
| `blur` | 模糊 | `{"operation":"blur","inputPath":"uploads/video.mp4","options":{"strength":10}}` |
| `stabilize` | 稳定 | `{"operation":"stabilize","inputPath":"uploads/video.mp4","options":{}}` |

### 快速示例

**获取视频信息:**
```bash
curl "http://localhost:3000/api/ffmpeg?path=uploads/video.mp4"
```

**剪切视频 (5秒开始，取10秒):**
```bash
curl -X POST http://localhost:3000/api/ffmpeg \
  -H "Content-Type: application/json" \
  -d '{"operation":"trim","inputPath":"uploads/video.mp4","options":{"startTime":"00:00:05","duration":"10"}}'
```

**创建 GIF:**
```bash
curl -X POST http://localhost:3000/api/ffmpeg \
  -H "Content-Type: application/json" \
  -d '{"operation":"gif","inputPath":"uploads/video.mp4","options":{"fps":10,"width":320,"duration":5}}'
```

**压缩视频:**
```bash
curl -X POST http://localhost:3000/api/ffmpeg \
  -H "Content-Type: application/json" \
  -d '{"operation":"compress","inputPath":"uploads/video.mp4","options":{"crf":28,"preset":"medium"}}'
```

### 输出文件

处理后的文件保存在 `/public/processed/` 目录，可通过 URL 访问:
- `/processed/trimmed_1234567890.mp4`
- `/processed/animation_1234567890.gif`

详细参数说明请参见 [FFMPEG_API.md](./FFMPEG_API.md)。
