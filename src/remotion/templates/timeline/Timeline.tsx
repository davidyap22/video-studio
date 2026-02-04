import {
  AbsoluteFill,
  Img,
  Video,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  spring,
  staticFile,
} from "remotion";
import { z } from "zod";

export const timelineSchema = z.object({
  items: z.array(
    z.object({
      year: z.string(),
      label: z.string().optional(),
      mediaSrc: z.string().optional(),
      mediaType: z.enum(["image", "video"]).optional(),
    })
  ),
  lineColor: z.string().optional(),
  textColor: z.string().optional(),
  yearSize: z.number().optional(),
  labelSize: z.number().optional(),
  backgroundVideoSrc: z.string().optional(),
  backgroundImageSrc: z.string().optional(),
});

// Timeline node component
const TimelineNode: React.FC<{
  index: number;
  total: number;
  year: string;
  label?: string;
  mediaSrc?: string;
  mediaType?: "image" | "video";
  isLast: boolean;
  lineColor: string;
  textColor: string;
  yearSize: number;
  labelSize: number;
}> = ({ index, total, year, label, mediaSrc, mediaType, isLast, lineColor, textColor, yearSize, labelSize }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Calculate position along the timeline
  const xPercent = 15 + (index / (total - 1)) * 70;
  const isAbove = index % 2 === 0;

  // Animation delay based on index
  const delay = 20 + index * 25;

  // Node animation
  const nodeProgress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  // Card animation
  const cardProgress = spring({
    frame: frame - delay - 10,
    fps,
    config: { damping: 15, stiffness: 80 },
  });

  const nodeScale = interpolate(nodeProgress, [0, 1], [0, 1]);
  const nodeOpacity = interpolate(nodeProgress, [0, 1], [0, 1]);
  const cardY = interpolate(cardProgress, [0, 1], [isAbove ? -30 : 30, 0]);
  const cardOpacity = interpolate(cardProgress, [0, 1], [0, 1]);

  // Year label animation
  const yearOpacity = interpolate(frame - delay - 5, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        left: `${xPercent}%`,
        top: "50%",
        transform: "translateX(-50%)",
      }}
    >
      {/* Connector line */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
          width: 2,
          height: isAbove ? 60 : 60,
          top: isAbove ? -60 : 30,
          background: "rgba(255,255,255,0.5)",
          opacity: cardOpacity,
        }}
      />

      {/* Card */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          transform: `translateX(-50%) translateY(${cardY}px)`,
          top: isAbove ? -280 : 80,
          opacity: cardOpacity,
        }}
      >
        <div
          style={{
            width: 240,
            height: 160,
            border: "2px solid rgba(255,255,255,0.6)",
            borderRadius: 8,
            overflow: "hidden",
            background: "rgba(20,20,30,0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {mediaSrc && mediaType === "video" ? (
            <Video
              src={staticFile(mediaSrc)}
              muted
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          ) : mediaSrc && mediaType === "image" ? (
            <Img
              src={staticFile(mediaSrc)}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          ) : (
            <div
              style={{
                color: "rgba(255,255,255,0.3)",
                fontSize: 14,
                textAlign: "center",
                padding: 10,
              }}
            >
              {label || year}
            </div>
          )}
        </div>
        {label && (
          <div
            style={{
              marginTop: 8,
              textAlign: "center",
              fontSize: labelSize,
              color: textColor,
              fontFamily: "Georgia, Times New Roman, serif",
              fontWeight: 700,
              lineHeight: 1.3,
              opacity: cardOpacity,
            }}
          >
            {label}
          </div>
        )}
      </div>

      {/* Node circle */}
      <div
        style={{
          width: 24,
          height: 24,
          borderRadius: "50%",
          border: `3px solid ${isLast ? lineColor : "rgba(255,255,255,0.8)"}`,
          background: isLast ? lineColor : "transparent",
          transform: `translateX(-50%) translateY(-50%) scale(${nodeScale})`,
          opacity: nodeOpacity,
          position: "absolute",
          left: "50%",
          top: 0,
        }}
      />

      {/* Year label */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
          top: isAbove ? 35 : -45,
          fontSize: yearSize,
          fontWeight: 700,
          color: textColor,
          fontFamily: "Georgia, Times New Roman, serif",
          lineHeight: 1.3,
          opacity: yearOpacity,
          whiteSpace: "nowrap",
        }}
      >
        {year}
      </div>
    </div>
  );
};

export const Timeline: React.FC<z.infer<typeof timelineSchema>> = ({
  items,
  lineColor = "#ffd700",
  textColor = "#ffd700",
  yearSize = 28,
  labelSize = 16,
  backgroundVideoSrc,
  backgroundImageSrc,
}) => {
  const frame = useCurrentFrame();

  // Line animation
  const lineProgress = interpolate(frame, [10, 80], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a0a" }}>
      {/* Background Video - 20% opacity, 50% blur */}
      {backgroundVideoSrc && (
        <AbsoluteFill style={{ opacity: 0.2, filter: "blur(4px)" }}>
          <Video
            src={staticFile(backgroundVideoSrc)}
            muted
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </AbsoluteFill>
      )}

      {/* Background Image - 50% opacity */}
      {!backgroundVideoSrc && backgroundImageSrc && (
        <AbsoluteFill style={{ opacity: 0.5 }}>
          <Img
            src={staticFile(backgroundImageSrc)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </AbsoluteFill>
      )}

      {/* Main content */}
      <AbsoluteFill>
        {/* Animated timeline line */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "10%",
            width: "80%",
            height: 4,
            background: "rgba(255,255,255,0.2)",
            transform: "translateY(-50%)",
          }}
        >
          <div
            style={{
              width: `${lineProgress}%`,
              height: "100%",
              background: lineColor,
            }}
          />
        </div>

        {/* Timeline nodes */}
        {items.map((item, index) => (
          <TimelineNode
            key={index}
            index={index}
            total={items.length}
            year={item.year}
            label={item.label}
            mediaSrc={item.mediaSrc}
            mediaType={item.mediaType}
            isLast={index === items.length - 1}
            lineColor={lineColor}
            textColor={textColor}
            yearSize={yearSize}
            labelSize={labelSize}
          />
        ))}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
