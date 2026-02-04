import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  spring,
} from "remotion";
import { z } from "zod";
import React from "react";

export const alertTitleV2Schema = z.object({
  mainTitle: z.string(),
  subtitle: z.string().optional(),
  bannerTexts: z.array(z.string()).optional(),
  backgroundColor: z.string().optional(),
  ringColor: z.string().optional(),
  textColor: z.string().optional(),
  mainTitleSize: z.number().optional(),
  subtitleSize: z.number().optional(),
});

// Single tape row - elegant diagonal ribbon
const TapeRow: React.FC<{
  text: string;
  direction: "left" | "right";
  speed: number;
  yPosition: number;
  opacity: number;
  bgColor: string;
  textColor: string;
  fontSize: number;
}> = ({ text, direction, speed, yPosition, opacity, bgColor, textColor, fontSize }) => {
  const frame = useCurrentFrame();

  const scrollOffset = (frame * speed) % 800;
  const translateX = direction === "left" ? -scrollOffset : scrollOffset - 800;
  const repeatedText = Array(30).fill(text).join("     •     ");

  return (
    <div
      style={{
        position: "absolute",
        top: yPosition,
        left: -1200,
        width: 4500,
        height: fontSize + 24,
        transform: "rotate(-45deg)",
        transformOrigin: "center center",
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: bgColor,
          opacity: opacity * 0.85,
          borderTop: `1px solid rgba(200,170,120,${opacity * 0.25})`,
          borderBottom: `1px solid rgba(80,50,30,${opacity * 0.4})`,
        }}
      />
      <div
        style={{
          position: "relative",
          whiteSpace: "nowrap",
          fontSize,
          fontWeight: 600,
          color: textColor,
          opacity: opacity,
          letterSpacing: "0.12em",
          fontFamily: "Georgia, 'Times New Roman', serif",
          transform: `translateX(${translateX}px)`,
          textShadow: "0 1px 3px rgba(0,0,0,0.5)",
        }}
      >
        {repeatedText}
      </div>
    </div>
  );
};

// Fire flame with better styling
const FireFlame: React.FC<{
  x: number;
  side: "left" | "right";
  delay: number;
  size: number;
}> = ({ x, side, delay, size }) => {
  const frame = useCurrentFrame();

  const flicker1 = Math.sin((frame + delay) * 0.12) * 0.3 + 0.7;
  const flicker2 = Math.sin((frame + delay) * 0.18 + 1) * 0.25 + 0.75;
  const rise = Math.sin((frame + delay) * 0.06) * 15;
  const sway = Math.sin((frame + delay) * 0.08) * 10;

  const baseX = side === "left" ? x : 1920 - x - size;

  return (
    <div
      style={{
        position: "absolute",
        left: baseX + sway,
        bottom: -20,
        width: size,
        height: size * 2.2 + rise,
        pointerEvents: "none",
        zIndex: 5,
      }}
    >
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: "5%",
          right: "5%",
          height: "100%",
          background: `radial-gradient(ellipse at bottom, rgba(255,120,30,${flicker1 * 0.5}) 0%, rgba(200,60,0,${flicker1 * 0.3}) 40%, transparent 75%)`,
          filter: "blur(12px)",
          transform: `scaleY(${flicker1})`,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: "15%",
          right: "15%",
          height: "75%",
          background: `radial-gradient(ellipse at bottom, rgba(255,180,50,${flicker2 * 0.6}) 0%, rgba(255,100,0,${flicker2 * 0.4}) 50%, transparent 80%)`,
          filter: "blur(6px)",
          transform: `scaleY(${flicker2})`,
        }}
      />
    </div>
  );
};

// Tape colors palette - muted, elegant
const tapeColors = [
  "#5a3535", // muted burgundy
  "#4a3545", // muted purple
  "#3a4555", // muted blue
  "#554535", // muted brown
  "#455545", // muted teal
];

export const AlertTitleV2: React.FC<z.infer<typeof alertTitleV2Schema>> = ({
  mainTitle,
  subtitle,
  bannerTexts = ["SANCTIONS", "制裁", "RESTRICTED"],
  backgroundColor = "#120808",
  ringColor = "#7755aa",
  textColor = "#c9a067",
  mainTitleSize = 130,
  subtitleSize = 52,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, height } = useVideoConfig();

  // Generate tape rows
  const rowSpacing = 70;
  const numRows = Math.ceil((height + 1800) / rowSpacing);

  const tapeRows = Array.from({ length: numRows }).map((_, i) => ({
    yPosition: -600 + i * rowSpacing,
    direction: (i % 2 === 0 ? "left" : "right") as "left" | "right",
    speed: 0.6 + (i % 4) * 0.15,
    opacity: 0.55 + (i % 3) * 0.15,
    fontSize: 17 + (i % 3) * 2,
    textIndex: i % bannerTexts.length,
    colorIndex: i % tapeColors.length,
  }));

  // Fire positions
  const flames = [
    { x: 0, delay: 0, size: 140 },
    { x: 100, delay: 8, size: 110 },
    { x: 180, delay: 16, size: 90 },
    { x: 50, delay: 12, size: 100 },
    { x: 240, delay: 20, size: 75 },
  ];

  // Animations
  const ringScale = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 35 },
  });

  const ringOpacity = interpolate(ringScale, [0, 1], [0, 0.85]);
  const pulse = Math.sin(frame * 0.04) * 0.04 + 1;

  // Title and subtitle appear immediately
  const titleProgress = 1;
  const subtitleProgress = 1;

  const glowIntensity = interpolate(Math.sin(frame * 0.06), [-1, 1], [25, 55]);

  const fadeOut = interpolate(
    frame,
    [durationInFrames - 25, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ backgroundColor, overflow: "hidden", opacity: fadeOut }}>
      {/* Subtle ambient gradients */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `
            radial-gradient(ellipse at 15% 25%, rgba(100,50,30,0.12) 0%, transparent 45%),
            radial-gradient(ellipse at 85% 75%, rgba(100,50,30,0.12) 0%, transparent 45%),
            radial-gradient(ellipse at 50% 50%, rgba(60,30,60,0.08) 0%, transparent 55%)
          `,
        }}
      />

      {/* Tape container with CENTER MASK - key for legibility */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          maskImage: `radial-gradient(
            ellipse 42% 38% at 50% 50%,
            transparent 0%,
            transparent 55%,
            rgba(0,0,0,0.25) 70%,
            rgba(0,0,0,0.6) 85%,
            black 100%
          )`,
          WebkitMaskImage: `radial-gradient(
            ellipse 42% 38% at 50% 50%,
            transparent 0%,
            transparent 55%,
            rgba(0,0,0,0.25) 70%,
            rgba(0,0,0,0.6) 85%,
            black 100%
          )`,
        }}
      >
        {tapeRows.map((row, index) => (
          <TapeRow
            key={index}
            text={bannerTexts[row.textIndex]}
            direction={row.direction}
            speed={row.speed}
            yPosition={row.yPosition}
            opacity={row.opacity}
            bgColor={tapeColors[row.colorIndex]}
            textColor={textColor}
            fontSize={row.fontSize}
          />
        ))}
      </div>

      {/* Vignette for depth */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(
            ellipse at center,
            transparent 25%,
            rgba(8,4,4,0.35) 60%,
            rgba(8,4,4,0.75) 100%
          )`,
          pointerEvents: "none",
        }}
      />

      {/* Glowing ring - larger */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) scale(${ringScale * pulse})`,
          width: 700,
          height: 700,
          borderRadius: "50%",
          border: `4px solid ${ringColor}`,
          opacity: ringOpacity,
          boxShadow: `
            0 0 ${glowIntensity}px ${ringColor},
            0 0 ${glowIntensity * 1.8}px ${ringColor},
            inset 0 0 ${glowIntensity * 0.8}px rgba(255,255,255,0.08)
          `,
        }}
      />

      {/* Inner glow circle */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) scale(${ringScale})`,
          width: 680,
          height: 680,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 55%)`,
          opacity: ringOpacity,
        }}
      />

      {/* Main title */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -55%) scale(${interpolate(titleProgress, [0, 1], [0.6, 1])})`,
          opacity: titleProgress,
          textAlign: "center",
          zIndex: 20,
        }}
      >
        <div
          style={{
            fontSize: mainTitleSize,
            fontWeight: 700,
            color: textColor,
            fontFamily: "Georgia, Times New Roman, serif",
            textShadow: `
              0 0 30px rgba(255,255,255,0.25),
              0 4px 12px rgba(0,0,0,0.6)
            `,
            lineHeight: 1.3,
          }}
        >
          {mainTitle}
        </div>
      </div>

      {/* Subtitle */}
      {subtitle && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: `translate(-50%, 90px) scale(${subtitleProgress})`,
            opacity: subtitleProgress,
            textAlign: "center",
            zIndex: 20,
          }}
        >
          <div
            style={{
              fontSize: subtitleSize,
              fontWeight: 700,
              color: "rgba(255,255,255,0.88)",
              fontFamily: "Georgia, Times New Roman, serif",
              lineHeight: 1.3,
              textShadow: "0 2px 12px rgba(0,0,0,0.6)",
            }}
          >
            {subtitle}
          </div>
        </div>
      )}

      {/* Fire effects - left */}
      {flames.map((f, i) => (
        <FireFlame key={`left-${i}`} x={f.x} side="left" delay={f.delay} size={f.size} />
      ))}

      {/* Fire effects - right */}
      {flames.map((f, i) => (
        <FireFlame key={`right-${i}`} x={f.x} side="right" delay={f.delay + 5} size={f.size} />
      ))}

      {/* Bottom glow */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 280,
          background: "linear-gradient(to top, rgba(255,80,20,0.25) 0%, rgba(255,60,0,0.1) 50%, transparent 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Side glows */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          width: 350,
          background: "linear-gradient(to right, rgba(255,80,20,0.15) 0%, transparent 100%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          width: 350,
          background: "linear-gradient(to left, rgba(255,80,20,0.15) 0%, transparent 100%)",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
