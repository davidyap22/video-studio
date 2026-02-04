import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import React from "react";

interface TapeRowProps {
  text: string;
  direction: "left" | "right";
  speed: number;
  yPosition: number;
  opacity: number;
  color: string;
  fontSize: number;
}

const TapeRow: React.FC<TapeRowProps> = ({
  text,
  direction,
  speed,
  yPosition,
  opacity,
  color,
  fontSize,
}) => {
  const frame = useCurrentFrame();

  // Slow, smooth infinite scroll
  const scrollOffset = (frame * speed) % 800;
  const translateX = direction === "left" ? -scrollOffset : scrollOffset - 800;

  // Repeat text many times for seamless loop
  const repeatedText = Array(30)
    .fill(text)
    .join("     •     ");

  return (
    <div
      style={{
        position: "absolute",
        top: yPosition,
        left: -1000,
        width: 4000,
        height: fontSize + 20,
        transform: "rotate(-45deg)",
        transformOrigin: "center center",
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      {/* Tape background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(90deg,
            rgba(60,40,30,${opacity * 0.9}) 0%,
            rgba(80,50,40,${opacity}) 50%,
            rgba(60,40,30,${opacity * 0.9}) 100%)`,
          borderTop: `1px solid rgba(200,170,120,${opacity * 0.3})`,
          borderBottom: `1px solid rgba(100,70,50,${opacity * 0.5})`,
        }}
      />
      {/* Scrolling text */}
      <div
        style={{
          position: "relative",
          whiteSpace: "nowrap",
          fontSize,
          fontWeight: 600,
          color,
          opacity: opacity * 1.2,
          letterSpacing: "0.15em",
          fontFamily: "Georgia, 'Times New Roman', serif",
          transform: `translateX(${translateX}px)`,
          textShadow: "0 1px 2px rgba(0,0,0,0.5)",
        }}
      >
        {repeatedText}
      </div>
    </div>
  );
};

interface SanctionedBackgroundProps {
  texts?: string[];
  backgroundColor?: string;
  tapeColor?: string;
  textColor?: string;
}

export const SanctionedBackground: React.FC<SanctionedBackgroundProps> = ({
  texts = ["SANCTIONS", "制裁", "RESTRICTED"],
  backgroundColor = "#1a0808",
  tapeColor = "#4a3020",
  textColor = "#c9a067",
}) => {
  const { height } = useVideoConfig();

  // Generate tape rows covering the entire screen
  const tapeRows: Array<{
    yPosition: number;
    direction: "left" | "right";
    speed: number;
    opacity: number;
    fontSize: number;
    textIndex: number;
  }> = [];

  // Create dense coverage from top to bottom
  const rowSpacing = 65;
  const numRows = Math.ceil((height + 1500) / rowSpacing);

  for (let i = 0; i < numRows; i++) {
    tapeRows.push({
      yPosition: -400 + i * rowSpacing,
      direction: i % 2 === 0 ? "left" : "right",
      speed: 0.8 + (i % 3) * 0.3, // Vary speed slightly
      opacity: 0.6 + (i % 4) * 0.1, // Vary opacity
      fontSize: 18 + (i % 3) * 2, // Vary size slightly
      textIndex: i % texts.length,
    });
  }

  return (
    <AbsoluteFill style={{ backgroundColor, overflow: "hidden" }}>
      {/* Subtle ambient gradient */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `
            radial-gradient(ellipse at 20% 20%, rgba(80,40,20,0.15) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 80%, rgba(80,40,20,0.15) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 50%, rgba(40,20,40,0.1) 0%, transparent 60%)
          `,
        }}
      />

      {/* Tape container with center mask */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          // CSS mask to fade out center - key for legibility
          maskImage: `radial-gradient(
            ellipse 45% 40% at 50% 50%,
            transparent 0%,
            transparent 50%,
            rgba(0,0,0,0.3) 65%,
            rgba(0,0,0,0.7) 80%,
            black 100%
          )`,
          WebkitMaskImage: `radial-gradient(
            ellipse 45% 40% at 50% 50%,
            transparent 0%,
            transparent 50%,
            rgba(0,0,0,0.3) 65%,
            rgba(0,0,0,0.7) 80%,
            black 100%
          )`,
        }}
      >
        {/* All tape rows */}
        {tapeRows.map((row, index) => (
          <TapeRow
            key={index}
            text={texts[row.textIndex]}
            direction={row.direction}
            speed={row.speed}
            yPosition={row.yPosition}
            opacity={row.opacity}
            color={textColor}
            fontSize={row.fontSize}
          />
        ))}
      </div>

      {/* Vignette overlay for depth */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(
            ellipse at center,
            transparent 30%,
            rgba(10,5,5,0.4) 70%,
            rgba(10,5,5,0.8) 100%
          )`,
          pointerEvents: "none",
        }}
      />

      {/* Subtle film grain texture */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.03,
          background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
