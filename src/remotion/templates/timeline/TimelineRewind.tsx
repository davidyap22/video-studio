import {
  AbsoluteFill,
  Img,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  staticFile,
  Easing,
} from "remotion";
import { z } from "zod";

export const timelineRewindSchema = z.object({
  items: z.array(
    z.object({
      year: z.string(),
      label: z.string().optional(),
      imageSrc: z.string().optional(),
    })
  ),
  lineColor: z.string().optional(),
  textColor: z.string().optional(),
});

// Timeline node component
const TimelineNode: React.FC<{
  index: number;
  total: number;
  year: string;
  label?: string;
  imageSrc?: string;
  isFirst: boolean;
  lineColor: string;
  textColor: string;
}> = ({ index, total, year, label, imageSrc, isFirst, lineColor, textColor }) => {
  // Position along the timeline
  const xPos = 150 + index * 350;
  const yBase = 550;
  const yOffset = index * -60; // Diagonal upward
  const isAbove = index % 2 === 0;

  // All nodes visible from start
  const nodeOpacity = 1;
  const cardOpacity = 1;

  return (
    <div
      style={{
        position: "absolute",
        left: xPos,
        top: yBase + yOffset,
      }}
    >
      {/* Vertical connector line */}
      <div
        style={{
          position: "absolute",
          left: 12,
          width: 2,
          height: 70,
          top: isAbove ? -70 : 26,
          background: "rgba(255,255,255,0.5)",
          opacity: cardOpacity,
        }}
      />

      {/* Card */}
      <div
        style={{
          position: "absolute",
          left: -60,
          top: isAbove ? -200 : 85,
          opacity: cardOpacity,
        }}
      >
        <div
          style={{
            width: 160,
            height: 100,
            border: "1px solid rgba(255,255,255,0.4)",
            borderRadius: 6,
            overflow: "hidden",
            background: "rgba(25,25,35,0.9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: "skewX(-5deg)",
          }}
        >
          {imageSrc ? (
            <Img
              src={staticFile(imageSrc)}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          ) : (
            <div
              style={{
                color: "rgba(255,255,255,0.5)",
                fontSize: 13,
                textAlign: "center",
                padding: 10,
                fontFamily: "Georgia, Times New Roman, serif",
              }}
            >
              {label || year}
            </div>
          )}
        </div>
      </div>

      {/* Node circle */}
      <div
        style={{
          width: 24,
          height: 24,
          borderRadius: "50%",
          border: `3px solid ${isFirst ? lineColor : "rgba(255,255,255,0.7)"}`,
          background: isFirst ? lineColor : "transparent",
          opacity: nodeOpacity,
        }}
      />

      {/* Year label */}
      <div
        style={{
          position: "absolute",
          left: 35,
          top: isAbove ? 5 : -25,
          fontSize: 26,
          fontWeight: 700,
          fontStyle: "italic",
          color: textColor,
          fontFamily: "Georgia, Times New Roman, serif",
          opacity: nodeOpacity,
          whiteSpace: "nowrap",
        }}
      >
        {year}
      </div>
    </div>
  );
};

export const TimelineRewind: React.FC<z.infer<typeof timelineRewindSchema>> = ({
  items,
  lineColor = "#ffd700",
  textColor = "#ffd700",
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const totalWidth = items.length * 350 + 300;

  // Rewind animation - starts at the end, accelerates back to beginning
  // Use easing to create acceleration effect
  const rewindProgress = interpolate(
    frame,
    [0, 30, durationInFrames - 60],
    [0, 0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.in(Easing.quad), // Accelerates as it goes
    }
  );

  // Start position (showing the end/newest) and end position (showing beginning/oldest)
  const startX = totalWidth - 1600; // Start showing the right side (newest)
  const endX = 0; // End showing the left side (oldest)

  const panX = interpolate(rewindProgress, [0, 1], [startX, endX]);

  // Rewind indicator flash
  const rewindFlash = interpolate(
    frame,
    [30, 50, 70, 90],
    [0, 1, 0, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a0a", overflow: "hidden" }}>
      {/* Rewind indicator */}
      {frame > 20 && frame < 100 && (
        <div
          style={{
            position: "absolute",
            top: 50,
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: 24,
            color: textColor,
            fontFamily: "Georgia, Times New Roman, serif",
            opacity: rewindFlash,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span style={{ fontSize: 30 }}>⏪</span>
          REWIND
        </div>
      )}

      {/* Skewed container */}
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          perspective: "1200px",
          perspectiveOrigin: "50% 50%",
        }}
      >
        {/* Timeline container with 3D transform */}
        <div
          style={{
            position: "absolute",
            width: totalWidth,
            height: "100%",
            transform: `
              translateX(-${panX}px)
              rotateX(10deg)
              rotateY(-15deg)
              skewY(-3deg)
            `,
            transformOrigin: "center center",
            transformStyle: "preserve-3d",
          }}
        >
          {/* Diagonal timeline line */}
          <svg
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: totalWidth,
              height: "100%",
              overflow: "visible",
            }}
          >
            <line
              x1={162}
              y1={550}
              x2={150 + (items.length - 1) * 350 + 12}
              y2={550 - (items.length - 1) * 60}
              stroke="rgba(255,255,255,0.2)"
              strokeWidth={4}
            />
            <line
              x1={162}
              y1={550}
              x2={150 + (items.length - 1) * 350 + 12}
              y2={550 - (items.length - 1) * 60}
              stroke={lineColor}
              strokeWidth={4}
            />
          </svg>

          {/* Timeline nodes */}
          {items.map((item, index) => (
            <TimelineNode
              key={index}
              index={index}
              total={items.length}
              year={item.year}
              label={item.label}
              imageSrc={item.imageSrc}
              isFirst={index === 0}
              lineColor={lineColor}
              textColor={textColor}
            />
          ))}
        </div>
      </div>

      {/* Speed lines effect during rewind */}
      {frame > 40 && frame < durationInFrames - 80 && (
        <AbsoluteFill style={{ pointerEvents: "none" }}>
          {Array.from({ length: 8 }).map((_, i) => {
            const y = 100 + i * 120;
            const opacity = interpolate(
              (frame + i * 10) % 30,
              [0, 15, 30],
              [0, 0.3, 0],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            );
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: 0,
                  top: y,
                  width: "100%",
                  height: 2,
                  background: `linear-gradient(90deg, transparent 0%, ${lineColor} 50%, transparent 100%)`,
                  opacity: opacity * 0.5,
                }}
              />
            );
          })}
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
