import {
  AbsoluteFill,
  Img,
  Video,
  useCurrentFrame,
  useVideoConfig,
  staticFile,
  Sequence,
} from "remotion";
import { z } from "zod";

// Single media item schema
const mediaItemSchema = z.object({
  src: z.string(),
  type: z.enum(["image", "video"]),
  caption: z.string(),
  year: z.number(),
});

export const filmTimelineSchema = z.object({
  // Array of media items
  mediaItems: z.array(mediaItemSchema),
  // Timeline settings
  startYear: z.number().optional(),
  endYear: z.number().optional(),
  // Styling
  captionSize: z.number().optional(),
  textColor: z.string().optional(),
  blackAndWhite: z.boolean().optional(),
});

// Film sprocket holes component
const SprocketHoles: React.FC<{ side: "left" | "right" }> = ({ side }) => {
  const holes = Array.from({ length: 12 });

  return (
    <div
      style={{
        position: "absolute",
        [side]: 0,
        top: 0,
        bottom: 0,
        width: 60,
        backgroundColor: "#000",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-around",
        alignItems: "center",
        padding: "20px 0",
      }}
    >
      {holes.map((_, i) => (
        <div
          key={i}
          style={{
            width: 30,
            height: 40,
            backgroundColor: "#1a1a1a",
            borderRadius: 4,
            border: "1px solid #333",
          }}
        />
      ))}
    </div>
  );
};

// Timeline ruler component
const TimelineRuler: React.FC<{
  startYear: number;
  endYear: number;
  currentYear: number;
  textColor: string;
}> = ({ startYear, endYear, currentYear, textColor }) => {
  const totalYears = endYear - startYear;
  const yearInterval = 5;
  const ticksPerYear = 5;

  const indicatorPosition = ((currentYear - startYear) / totalYears) * 100;

  const labels = [];
  for (let year = startYear; year <= endYear; year += yearInterval) {
    const position = ((year - startYear) / totalYears) * 100;
    labels.push({ year, position, isLabel: true });

    for (let t = 1; t < ticksPerYear && year + t < endYear; t++) {
      const tickYear = year + t;
      const tickPosition = ((tickYear - startYear) / totalYears) * 100;
      labels.push({ year: tickYear, position: tickPosition, isLabel: false });
    }
  }

  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 60,
        right: 60,
        height: 80,
        backgroundColor: "rgba(0,0,0,0.9)",
        overflow: "hidden",
      }}
    >
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        {labels.map(({ year, position, isLabel }) => (
          <div
            key={year}
            style={{
              position: "absolute",
              left: `${position}%`,
              bottom: 0,
              transform: "translateX(-50%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: isLabel ? 2 : 1,
                height: isLabel ? 25 : 15,
                backgroundColor: isLabel ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.4)",
              }}
            />
            {isLabel && (
              <div
                style={{
                  marginTop: 8,
                  fontSize: 16,
                  fontFamily: "Georgia, Times New Roman, serif",
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.7)",
                  lineHeight: 1.3,
                }}
              >
                {year}
              </div>
            )}
          </div>
        ))}

        {/* Current year indicator */}
        <div
          style={{
            position: "absolute",
            left: `${indicatorPosition}%`,
            top: 0,
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: "12px solid transparent",
              borderRight: "12px solid transparent",
              borderTop: `16px solid ${textColor}`,
            }}
          />
          <div
            style={{
              width: 3,
              height: 60,
              backgroundColor: textColor,
              boxShadow: `0 0 10px ${textColor}`,
            }}
          />
        </div>
      </div>
    </div>
  );
};

// Single media frame component
const MediaFrame: React.FC<{
  src: string;
  type: "image" | "video";
  blackAndWhite: boolean;
}> = ({ src, type, blackAndWhite }) => {
  const frame = useCurrentFrame();

  // Effects
  const grainOpacity = 0.05 + Math.random() * 0.03;
  const flickerOpacity = 0.97 + Math.random() * 0.03;
  const shakeX = Math.sin(frame * 0.5) * 1;
  const shakeY = Math.cos(frame * 0.7) * 1;

  return (
    <>
      {/* Media content */}
      <div
        style={{
          width: "100%",
          height: "100%",
          transform: `translate(${shakeX}px, ${shakeY}px)`,
          filter: blackAndWhite
            ? "grayscale(100%) contrast(1.2) brightness(1.1)"
            : "contrast(1.1) saturate(0.9)",
          opacity: flickerOpacity,
        }}
      >
        {src ? (
          type === "video" ? (
            <Video
              src={staticFile(src)}
              muted
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          ) : (
            <Img
              src={staticFile(src)}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          )
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: "#1a1a1a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <p style={{ color: "#666", fontSize: 18 }}>No media</p>
          </div>
        )}
      </div>

      {/* CRT Scanlines */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `repeating-linear-gradient(
            0deg,
            rgba(0, 0, 0, 0.3) 0px,
            rgba(0, 0, 0, 0.3) 1px,
            transparent 1px,
            transparent 3px
          )`,
          pointerEvents: "none",
        }}
      />

      {/* Film grain */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          opacity: grainOpacity,
          pointerEvents: "none",
        }}
      />

      {/* VHS tracking line */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          height: 3,
          top: `${((frame * 2) % 100)}%`,
          background: "rgba(255,255,255,0.1)",
          filter: "blur(1px)",
          pointerEvents: "none",
        }}
      />

      {/* Vignette */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.6) 100%)",
          pointerEvents: "none",
        }}
      />
    </>
  );
};

export const FilmTimeline: React.FC<z.infer<typeof filmTimelineSchema>> = ({
  mediaItems,
  startYear = 1920,
  endYear = 1980,
  captionSize = 48,
  textColor = "#ffffff",
  blackAndWhite = true,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Calculate frames per item
  const itemCount = mediaItems.length || 1;
  const framesPerItem = Math.floor(durationInFrames / itemCount);

  // Determine current item index and year
  const currentItemIndex = Math.min(
    Math.floor(frame / framesPerItem),
    itemCount - 1
  );
  const currentItem = mediaItems[currentItemIndex];
  const currentYear = currentItem?.year || startYear;

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <AbsoluteFill>
        {/* Film sprocket holes */}
        <SprocketHoles side="left" />
        <SprocketHoles side="right" />

        {/* Media container */}
        <div
          style={{
            position: "absolute",
            left: 60,
            right: 60,
            top: 0,
            bottom: 80,
            overflow: "hidden",
            backgroundColor: "#111",
          }}
        >
          {/* Render each media item as a sequence */}
          {mediaItems.map((item, index) => (
            <Sequence
              key={index}
              from={index * framesPerItem}
              durationInFrames={framesPerItem}
            >
              <MediaFrame
                src={item.src}
                type={item.type}
                blackAndWhite={blackAndWhite}
              />
            </Sequence>
          ))}

          {/* Fallback if no items */}
          {mediaItems.length === 0 && (
            <div
              style={{
                width: "100%",
                height: "100%",
                backgroundColor: "#1a1a1a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: 20,
              }}
            >
              <div
                style={{
                  width: 100,
                  height: 100,
                  border: "3px solid #444",
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width={50} height={50} viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth={1.5}>
                  <rect x={3} y={3} width={18} height={18} rx={2} />
                  <circle cx={8.5} cy={8.5} r={1.5} />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
              </div>
              <p style={{ color: "#666", fontSize: 18, fontFamily: "Georgia, serif" }}>
                Upload historical media
              </p>
            </div>
          )}
        </div>

        {/* Timeline ruler */}
        <TimelineRuler
          startYear={startYear}
          endYear={endYear}
          currentYear={currentYear}
          textColor={textColor}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Export types for use in page.tsx
export type MediaItem = z.infer<typeof mediaItemSchema>;
