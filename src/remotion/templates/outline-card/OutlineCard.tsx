import {
  AbsoluteFill,
  Img,
  Video,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  spring,
  staticFile,
  Easing,
} from "remotion";
import { z } from "zod";

export const outlineCardSchema = z.object({
  badge: z.string(),
  cardTitle: z.string(),
  cardSubtitle: z.string().optional(),
  cardImageSrc: z.string().optional(),
  videoSrc: z.string().optional(),
  point1: z.string(),
  point2: z.string().optional(),
  point3: z.string().optional(),
  point4: z.string().optional(),
  point5: z.string().optional(),
  textColor: z.string().optional(),
  titleSize: z.number().optional(),
  pointSize: z.number().optional(),
});

// Circled number component
const CircledNumber: React.FC<{
  num: number;
  delay: number;
  color: string;
}> = ({ num, delay, color }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 12, stiffness: 80 },
  });

  const scale = interpolate(progress, [0, 1], [0, 1]);
  const opacity = interpolate(progress, [0, 1], [0, 1]);

  return (
    <div
      style={{
        width: 60,
        height: 60,
        borderRadius: "50%",
        border: `2px solid ${color}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 28,
        color: color,
        fontFamily: "Georgia, Times New Roman, serif",
        transform: `scale(${scale})`,
        opacity,
        flexShrink: 0,
      }}
    >
      {num}
    </div>
  );
};

// Bullet point row
const BulletPoint: React.FC<{
  num: number;
  text: string;
  delay: number;
  color: string;
  fontSize: number;
}> = ({ num, text, delay, color, fontSize }) => {
  const frame = useCurrentFrame();

  const textOpacity = interpolate(frame - delay - 10, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const textX = interpolate(frame - delay - 10, [0, 20], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 35,
        marginBottom: 60,
      }}
    >
      <CircledNumber num={num} delay={delay} color={color} />
      <div
        style={{
          fontSize,
          color: color,
          fontFamily: "Georgia, Times New Roman, serif",
          letterSpacing: "0.02em",
          opacity: textOpacity,
          transform: `translateX(${textX}px)`,
          fontWeight: 700,
          lineHeight: 1.3,
        }}
      >
        {text}
      </div>
    </div>
  );
};

export const OutlineCard: React.FC<z.infer<typeof outlineCardSchema>> = ({
  badge,
  cardTitle,
  cardSubtitle,
  cardImageSrc,
  videoSrc,
  point1,
  point2,
  point3,
  point4,
  point5,
  textColor = "#c9a067",
  titleSize = 48,
  pointSize = 56,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Badge animation
  const badgeProgress = spring({
    frame: frame - 5,
    fps,
    config: { damping: 15, stiffness: 100 },
  });
  const badgeY = interpolate(badgeProgress, [0, 1], [-50, 0]);
  const badgeOpacity = interpolate(badgeProgress, [0, 1], [0, 1]);

  // Card animation
  const cardProgress = spring({
    frame: frame - 15,
    fps,
    config: { damping: 12, stiffness: 60 },
  });
  const cardScale = interpolate(cardProgress, [0, 1], [0.8, 1]);
  const cardOpacity = interpolate(cardProgress, [0, 1], [0, 1]);

  // Border animation
  const borderProgress = interpolate(frame, [10, 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Collect points
  const points = [point1, point2, point3, point4, point5].filter(Boolean);

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a12" }}>
      {/* Video Background - 20% opacity, 50% blur */}
      {videoSrc && (
        <AbsoluteFill style={{ opacity: 0.2, filter: "blur(4px)" }}>
          <Video
            src={staticFile(videoSrc)}
            muted
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </AbsoluteFill>
      )}

      {/* Cosmic background gradient */}
      <AbsoluteFill
        style={{
          background: `
            radial-gradient(ellipse at 70% 60%, rgba(20, 40, 80, 0.5) 0%, transparent 50%),
            radial-gradient(ellipse at 30% 80%, rgba(40, 20, 60, 0.3) 0%, transparent 40%)
          `,
        }}
      />

      {/* Main content */}
      <AbsoluteFill>
        {/* Border Frame */}
        <div
          style={{
            position: "absolute",
            top: 60,
            left: 60,
            right: 60,
            bottom: 60,
            border: "1px solid rgba(255,255,255,0.3)",
            opacity: borderProgress,
          }}
        />

        {/* Top Badge */}
        <div
          style={{
            position: "absolute",
            top: 40,
            left: "50%",
            transform: `translateX(-50%) translateY(${badgeY}px)`,
            opacity: badgeOpacity,
          }}
        >
          <div
            style={{
              background: "rgba(60, 60, 100, 0.8)",
              padding: "12px 40px",
              borderRadius: 4,
              fontSize: 18,
              letterSpacing: "0.3em",
              color: "rgba(255,255,255,0.8)",
              fontFamily: "Georgia, serif",
              textTransform: "uppercase",
            }}
          >
            {badge}
          </div>
        </div>

        {/* Content Container - Centered */}
        <div
          style={{
            position: "absolute",
            top: 100,
            left: 0,
            right: 0,
            bottom: 60,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 80,
          }}
        >
          {/* Left Card */}
          <div
            style={{
              width: 340,
              height: 450,
              transform: `scale(${cardScale})`,
              opacity: cardOpacity,
              flexShrink: 0,
            }}
          >
            {/* Card background */}
            <div
              style={{
                width: "100%",
                height: "100%",
                border: "2px solid rgba(150, 130, 100, 0.6)",
                borderRadius: 8,
                overflow: "hidden",
                position: "relative",
                background: "#0a0a0a",
              }}
            >
              {/* Card image */}
              {cardImageSrc && (
                <Img
                  src={staticFile(cardImageSrc)}
                  style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    opacity: 0.6,
                  }}
                />
              )}

              {/* Default gradient if no image - cosmic fire/nebula effect */}
              {!cardImageSrc && (
                <div
                  style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    background: `
                      radial-gradient(ellipse at 50% 80%, rgba(200, 80, 50, 0.7) 0%, transparent 50%),
                      radial-gradient(ellipse at 30% 60%, rgba(180, 60, 40, 0.5) 0%, transparent 40%),
                      radial-gradient(ellipse at 70% 70%, rgba(220, 100, 60, 0.4) 0%, transparent 45%),
                      radial-gradient(ellipse at 50% 40%, rgba(100, 50, 120, 0.4) 0%, transparent 50%),
                      radial-gradient(ellipse at 50% 20%, rgba(60, 40, 80, 0.3) 0%, transparent 40%),
                      linear-gradient(180deg, #1a1020 0%, #0a0510 50%, #150808 100%)
                    `,
                  }}
                />
              )}

              {/* Card subtitle (top) */}
              {cardSubtitle && (
                <div
                  style={{
                    position: "absolute",
                    top: 20,
                    left: 0,
                    right: 0,
                    textAlign: "center",
                    fontSize: 14,
                    letterSpacing: "0.2em",
                    color: "rgba(255,255,255,0.7)",
                    fontFamily: "Georgia, serif",
                    textTransform: "uppercase",
                  }}
                >
                  {cardSubtitle}
                </div>
              )}

              {/* Card title (centered in middle) */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "60px 20px",
                }}
              >
                <div
                  style={{
                    fontSize: titleSize,
                    color: textColor,
                    fontFamily: "Georgia, Times New Roman, serif",
                    fontWeight: 700,
                    textAlign: "center",
                    textShadow: "2px 2px 15px rgba(0,0,0,0.9)",
                    lineHeight: 1.3,
                  }}
                >
                  {cardTitle}
                </div>
              </div>
            </div>
          </div>

          {/* Right Bullet Points */}
          <div>
            {points.map((point, index) => (
              <BulletPoint
                key={index}
                num={index + 1}
                text={point!}
                delay={30 + index * 20}
                color={textColor}
                fontSize={pointSize}
              />
            ))}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
