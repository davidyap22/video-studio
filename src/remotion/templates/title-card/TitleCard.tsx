import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  spring,
  Video,
  staticFile,
  Easing,
} from "remotion";
import { noise3D } from "@remotion/noise";
import { z } from "zod";

export const titleCardSchema = z.object({
  videoSrc: z.string(),
  title: z.string(),
  subtitle: z.string().optional(),
  textColor: z.string().optional(),
  subtitleColor: z.string().optional(),
  titleSize: z.number().optional(),
  subtitleSize: z.number().optional(),
});

// Noise Dot Grid component
const NoiseDotGrid: React.FC<{
  rows?: number;
  cols?: number;
  dotColor?: string;
  speed?: number;
}> = ({
  rows = 15,
  cols = 25,
  dotColor = "rgba(255, 255, 255, 0.6)",
  speed = 0.02,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const cellWidth = width / cols;
  const cellHeight = height / rows;

  const dots: Array<{ x: number; y: number; size: number; opacity: number }> = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const noiseX = noise3D("x", col * 0.1, row * 0.1, frame * speed) * 20;
      const noiseY = noise3D("y", col * 0.1, row * 0.1, frame * speed) * 20;
      const noiseSize = noise3D("size", col * 0.1, row * 0.1, frame * speed);
      const noiseOpacity = noise3D("opacity", col * 0.15, row * 0.15, frame * speed * 0.5);

      const baseX = col * cellWidth + cellWidth / 2;
      const baseY = row * cellHeight + cellHeight / 2;

      dots.push({
        x: baseX + noiseX,
        y: baseY + noiseY,
        size: 3 + noiseSize * 4,
        opacity: 0.3 + (noiseOpacity + 1) * 0.35,
      });
    }
  }

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <svg width={width} height={height}>
        {dots.map((dot, i) => (
          <circle
            key={i}
            cx={dot.x}
            cy={dot.y}
            r={dot.size}
            fill={dotColor}
            opacity={dot.opacity}
          />
        ))}
      </svg>
    </AbsoluteFill>
  );
};

export const TitleCard: React.FC<z.infer<typeof titleCardSchema>> = ({
  videoSrc,
  title,
  subtitle,
  textColor = "#c9a067",
  subtitleColor = "#ffffff",
  titleSize = 80,
  subtitleSize = 28,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Title animation
  const titleProgress = spring({
    frame: frame - 20,
    fps,
    config: { damping: 15, stiffness: 80 },
  });

  const titleOpacity = interpolate(titleProgress, [0, 1], [0, 1]);
  const titleY = interpolate(titleProgress, [0, 1], [30, 0]);
  const titleScale = interpolate(titleProgress, [0, 1], [0.9, 1]);

  // Horizontal lines animation
  const lineWidth = interpolate(frame, [40, 70], [0, 120], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Noise grid fade in
  const gridOpacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      {/* Background Video */}
      <AbsoluteFill>
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

      {/* Dark Overlay with Vignette */}
      <AbsoluteFill
        style={{
          background: `
            radial-gradient(ellipse at center,
              rgba(0,0,0,0.3) 0%,
              rgba(0,0,0,0.7) 50%,
              rgba(0,0,0,0.9) 100%
            )
          `,
        }}
      />

      {/* Animated Noise Dot Grid */}
      <AbsoluteFill style={{ opacity: gridOpacity * 0.4 }}>
        <NoiseDotGrid
          rows={12}
          cols={20}
          dotColor="rgba(201, 160, 103, 0.8)"
          speed={0.015}
        />
      </AbsoluteFill>

      {/* Content Container */}
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* Soft glow background */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "80%",
            height: "50%",
            background: "radial-gradient(ellipse at center, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 50%, transparent 80%)",
            pointerEvents: "none",
          }}
        />

        {/* Main Title */}
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            gap: 30,
          }}
        >
          {/* Left Lines */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              alignItems: "flex-end",
            }}
          >
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  width: lineWidth * (1 - i * 0.3),
                  height: 2,
                  background: "linear-gradient(90deg, transparent, #c9a067)",
                }}
              />
            ))}
          </div>

          {/* Title Text */}
          <div
            style={{
              fontFamily: "Georgia, Times New Roman, serif",
              fontSize: titleSize,
              fontWeight: 700,
              lineHeight: 1.3,
              letterSpacing: "0.05em",
              textAlign: "center",
              maxWidth: 1200,
              opacity: titleOpacity,
              transform: `translateY(${titleY}px) scale(${titleScale})`,
              color: textColor,
              textShadow: `0 0 30px ${textColor}40, 0 4px 12px rgba(0,0,0,0.6)`,
              filter: "drop-shadow(2px 4px 8px rgba(0,0,0,0.8))",
            }}
          >
            {title}
          </div>

          {/* Right Lines */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              alignItems: "flex-start",
            }}
          >
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  width: lineWidth * (1 - i * 0.3),
                  height: 2,
                  background: "linear-gradient(270deg, transparent, #c9a067)",
                }}
              />
            ))}
          </div>
        </div>

        {/* Subtitle */}
        {subtitle && (
          <div
            style={{
              fontFamily: "Georgia, Times New Roman, serif",
              fontSize: subtitleSize,
              fontWeight: 700,
              lineHeight: 1.3,
              letterSpacing: "0.2em",
              color: subtitleColor,
              marginTop: 30,
              textTransform: "uppercase",
              textShadow: "0 0 20px rgba(255,255,255,0.5), 0 2px 4px rgba(0,0,0,0.8)",
            }}
          >
            {subtitle}
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
