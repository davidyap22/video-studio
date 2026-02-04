import {
  AbsoluteFill,
  Img,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  spring,
  staticFile,
} from "remotion";
import { z } from "zod";

export const timelineDiagonalSchema = z.object({
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
  isLast: boolean;
  lineColor: string;
  textColor: string;
}> = ({ index, total, year, label, imageSrc, isLast, lineColor, textColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Position along the timeline
  const xPos = 150 + index * 380;
  const isAbove = index % 2 === 0;

  // Animation delay based on reverse order (right to left reveal)
  const delay = 30 + (total - 1 - index) * 20;

  // Node animation
  const nodeProgress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  const nodeScale = interpolate(nodeProgress, [0, 1], [0, 1]);
  const nodeOpacity = interpolate(nodeProgress, [0, 1], [0, 1]);

  // Card animation
  const cardProgress = spring({
    frame: frame - delay - 5,
    fps,
    config: { damping: 15, stiffness: 80 },
  });
  const cardY = interpolate(cardProgress, [0, 1], [isAbove ? -20 : 20, 0]);
  const cardOpacity = interpolate(cardProgress, [0, 1], [0, 1]);

  // Year label animation
  const yearOpacity = interpolate(frame - delay, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        left: xPos,
        top: 0,
      }}
    >
      {/* Vertical connector line */}
      <div
        style={{
          position: "absolute",
          left: 12,
          width: 2,
          height: 80,
          top: isAbove ? -80 : 26,
          background: "rgba(255,255,255,0.6)",
          opacity: cardOpacity,
        }}
      />

      {/* Horizontal connector to card */}
      <div
        style={{
          position: "absolute",
          left: 12,
          top: isAbove ? -80 : 106,
          width: 35,
          height: 2,
          background: "rgba(255,255,255,0.6)",
          opacity: cardOpacity,
        }}
      />

      {/* Card */}
      <div
        style={{
          position: "absolute",
          left: 45,
          top: isAbove ? -200 : 95,
          transform: `translateY(${cardY}px) skewY(0deg)`,
          opacity: cardOpacity,
        }}
      >
        <div
          style={{
            width: 180,
            height: 115,
            border: "2px solid rgba(255,255,255,0.7)",
            borderRadius: 6,
            overflow: "hidden",
            background: imageSrc ? "transparent" : "rgba(30,30,40,0.9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
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
                color: "rgba(255,255,255,0.4)",
                fontSize: 14,
                textAlign: "center",
                padding: 15,
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
          width: 26,
          height: 26,
          borderRadius: "50%",
          border: `3px solid ${isLast ? lineColor : "rgba(255,255,255,0.9)"}`,
          background: isLast ? lineColor : "transparent",
          transform: `scale(${nodeScale})`,
          opacity: nodeOpacity,
        }}
      />

      {/* Year label */}
      <div
        style={{
          position: "absolute",
          left: -15,
          top: isAbove ? 35 : -40,
          fontSize: 28,
          fontWeight: 700,
          color: textColor,
          fontFamily: "Georgia, Times New Roman, serif",
          opacity: yearOpacity,
          whiteSpace: "nowrap",
        }}
      >
        {year}
      </div>
    </div>
  );
};

export const TimelineDiagonal: React.FC<z.infer<typeof timelineDiagonalSchema>> = ({
  items,
  lineColor = "#ffd700",
  textColor = "#ffd700",
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Camera pan from right to left
  const panX = interpolate(
    frame,
    [0, durationInFrames - 60],
    [items.length * 380 - 1200, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  // Line draw animation
  const lineProgress = interpolate(frame, [20, 100], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const totalWidth = items.length * 380 + 300;

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a0a", overflow: "hidden" }}>
      {/* Skewed container with perspective */}
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          perspective: "1500px",
          perspectiveOrigin: "50% 50%",
        }}
      >
        {/* Skewed timeline container */}
        <div
          style={{
            position: "absolute",
            width: totalWidth,
            height: "100%",
            left: "50%",
            top: "50%",
            transform: `
              translateX(-${panX}px)
              translateX(-50%)
              translateY(-50%)
              rotateX(15deg)
              rotateY(-25deg)
              skewY(-5deg)
            `,
            transformStyle: "preserve-3d",
          }}
        >
          {/* Timeline line */}
          <div
            style={{
              position: "absolute",
              left: 150,
              top: "50%",
              width: (items.length - 1) * 380 + 50,
              height: 4,
              background: "rgba(255,255,255,0.2)",
              transform: "translateY(-50%)",
            }}
          >
            {/* Animated fill */}
            <div
              style={{
                width: `${lineProgress}%`,
                height: "100%",
                background: lineColor,
              }}
            />
          </div>

          {/* Timeline nodes */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              transform: "translateY(-13px)",
            }}
          >
            {items.map((item, index) => (
              <TimelineNode
                key={index}
                index={index}
                total={items.length}
                year={item.year}
                label={item.label}
                imageSrc={item.imageSrc}
                isLast={index === items.length - 1}
                lineColor={lineColor}
                textColor={textColor}
              />
            ))}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
