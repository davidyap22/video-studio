import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  spring,
} from "remotion";
import { z } from "zod";

export const alertTitleSchema = z.object({
  mainTitle: z.string(),
  subtitle: z.string().optional(),
  bannerText: z.string(),
  backgroundColor: z.string().optional(),
  ringColor: z.string().optional(),
  bannerColor: z.string().optional(),
  textColor: z.string().optional(),
  mainTitleSize: z.number().optional(),
  subtitleSize: z.number().optional(),
});

// Single diagonal banner
const DiagonalBanner: React.FC<{
  text: string;
  rotation: number;
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
  color: string;
  textColor: string;
  speed?: number;
  height?: number;
  fontSize?: number;
  opacity?: number;
}> = ({ text, rotation, top, bottom, left, right, color, textColor, speed = 3, height = 45, fontSize = 20, opacity = 0.85 }) => {
  const frame = useCurrentFrame();

  // Scroll speed with variation
  const scrollOffset = (frame * speed) % 500;

  // Repeat text for seamless scrolling
  const repeatedText = Array(25).fill(text).join("   •   ");

  return (
    <div
      style={{
        position: "absolute",
        top: top !== undefined ? top : "auto",
        bottom: bottom !== undefined ? bottom : "auto",
        left: left !== undefined ? left : "auto",
        right: right !== undefined ? right : "auto",
        width: 1600,
        height,
        transform: `rotate(${rotation}deg)`,
        overflow: "hidden",
        zIndex: 10,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: color,
          opacity,
        }}
      />
      <div
        style={{
          position: "relative",
          whiteSpace: "nowrap",
          fontSize,
          fontWeight: 700,
          color: textColor,
          lineHeight: `${height}px`,
          fontFamily: "Georgia, Times New Roman, serif",
          transform: `translateX(-${scrollOffset}px)`,
        }}
      >
        {repeatedText}
      </div>
    </div>
  );
};

// Color palette for banners
const bannerColors = [
  "#6b3a3a", // dark red
  "#4a3a5a", // purple
  "#3a4a5a", // blue-gray
  "#5a4a3a", // brown
  "#3a5a4a", // teal
];

// Generate all banners - fill all edges including top, bottom, left, right
const generateAllBanners = (
  text: string,
  defaultColor: string,
  textColor: string
) => {
  const banners: Array<{
    rotation: number;
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
    speed: number;
    height: number;
    fontSize: number;
    opacity: number;
    colorIndex: number;
  }> = [
    // Top left corner - diagonal
    { rotation: -45, top: -30, left: -400, speed: 2.5, height: 45, fontSize: 20, opacity: 0.85, colorIndex: 0 },
    { rotation: -42, top: 30, left: -350, speed: 3.0, height: 40, fontSize: 18, opacity: 0.75, colorIndex: 1 },
    { rotation: -48, top: 90, left: -380, speed: 2.8, height: 38, fontSize: 16, opacity: 0.65, colorIndex: 2 },

    // Top edge - horizontal banners
    { rotation: -12, top: -20, left: 300, speed: 3.2, height: 40, fontSize: 17, opacity: 0.8, colorIndex: 3 },
    { rotation: -8, top: 25, left: 450, speed: 2.8, height: 36, fontSize: 15, opacity: 0.7, colorIndex: 4 },
    { rotation: 12, top: -20, right: 300, speed: 3.0, height: 40, fontSize: 17, opacity: 0.8, colorIndex: 0 },
    { rotation: 8, top: 25, right: 450, speed: 2.6, height: 36, fontSize: 15, opacity: 0.7, colorIndex: 1 },

    // Top right corner - diagonal
    { rotation: 45, top: -30, right: -400, speed: 2.8, height: 45, fontSize: 20, opacity: 0.85, colorIndex: 1 },
    { rotation: 42, top: 30, right: -350, speed: 3.2, height: 40, fontSize: 18, opacity: 0.75, colorIndex: 2 },
    { rotation: 48, top: 90, right: -380, speed: 2.5, height: 38, fontSize: 16, opacity: 0.65, colorIndex: 3 },

    // Right edge - vertical banners
    { rotation: 78, top: 250, right: -150, speed: 2.2, height: 38, fontSize: 15, opacity: 0.7, colorIndex: 4 },
    { rotation: 82, top: 400, right: -100, speed: 2.5, height: 35, fontSize: 14, opacity: 0.6, colorIndex: 0 },
    { rotation: 75, top: 550, right: -130, speed: 2.8, height: 36, fontSize: 14, opacity: 0.65, colorIndex: 1 },

    // Bottom right corner - diagonal
    { rotation: -45, bottom: -30, right: -400, speed: 2.5, height: 45, fontSize: 20, opacity: 0.85, colorIndex: 2 },
    { rotation: -42, bottom: 30, right: -350, speed: 3.0, height: 40, fontSize: 18, opacity: 0.75, colorIndex: 3 },
    { rotation: -48, bottom: 90, right: -380, speed: 2.8, height: 38, fontSize: 16, opacity: 0.65, colorIndex: 4 },

    // Bottom edge - horizontal banners
    { rotation: 12, bottom: -20, right: 300, speed: 3.2, height: 40, fontSize: 17, opacity: 0.8, colorIndex: 0 },
    { rotation: 8, bottom: 25, right: 450, speed: 2.8, height: 36, fontSize: 15, opacity: 0.7, colorIndex: 1 },
    { rotation: -12, bottom: -20, left: 300, speed: 3.0, height: 40, fontSize: 17, opacity: 0.8, colorIndex: 2 },
    { rotation: -8, bottom: 25, left: 450, speed: 2.6, height: 36, fontSize: 15, opacity: 0.7, colorIndex: 3 },

    // Bottom left corner - diagonal
    { rotation: 45, bottom: -30, left: -400, speed: 2.8, height: 45, fontSize: 20, opacity: 0.85, colorIndex: 3 },
    { rotation: 42, bottom: 30, left: -350, speed: 3.2, height: 40, fontSize: 18, opacity: 0.75, colorIndex: 4 },
    { rotation: 48, bottom: 90, left: -380, speed: 2.5, height: 38, fontSize: 16, opacity: 0.65, colorIndex: 0 },

    // Left edge - vertical banners
    { rotation: -78, top: 250, left: -150, speed: 2.2, height: 38, fontSize: 15, opacity: 0.7, colorIndex: 1 },
    { rotation: -82, top: 400, left: -100, speed: 2.5, height: 35, fontSize: 14, opacity: 0.6, colorIndex: 2 },
    { rotation: -75, top: 550, left: -130, speed: 2.8, height: 36, fontSize: 14, opacity: 0.65, colorIndex: 3 },
  ];

  return banners.map((b, i) => (
    <DiagonalBanner
      key={`banner-${i}`}
      text={text}
      rotation={b.rotation}
      top={b.top}
      bottom={b.bottom}
      left={b.left}
      right={b.right}
      color={bannerColors[b.colorIndex]}
      textColor={textColor}
      speed={b.speed}
      height={b.height}
      fontSize={b.fontSize}
      opacity={b.opacity}
    />
  ));
};

// Fire flame element
const FireFlame: React.FC<{
  x: number;
  side: "left" | "right";
  delay: number;
  size: number;
}> = ({ x, side, delay, size }) => {
  const frame = useCurrentFrame();

  // Flickering animation
  const flicker1 = Math.sin((frame + delay) * 0.15) * 0.3 + 0.7;
  const flicker2 = Math.sin((frame + delay) * 0.2 + 1) * 0.2 + 0.8;
  const flicker3 = Math.sin((frame + delay) * 0.25 + 2) * 0.25 + 0.75;

  // Rising motion
  const rise = Math.sin((frame + delay) * 0.08) * 20;
  const sway = Math.sin((frame + delay) * 0.1) * 15;

  const baseX = side === "left" ? x : 1920 - x - size;

  return (
    <div
      style={{
        position: "absolute",
        left: baseX + sway,
        bottom: 0,
        width: size,
        height: size * 2.5 + rise,
        pointerEvents: "none",
      }}
    >
      {/* Outer flame (red/orange) */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: "10%",
          right: "10%",
          height: "100%",
          background: `radial-gradient(ellipse at bottom, rgba(255,100,0,${flicker1 * 0.6}) 0%, rgba(255,50,0,${flicker1 * 0.4}) 30%, transparent 70%)`,
          filter: "blur(8px)",
          transform: `scaleY(${flicker1})`,
        }}
      />
      {/* Middle flame (orange/yellow) */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: "20%",
          right: "20%",
          height: "80%",
          background: `radial-gradient(ellipse at bottom, rgba(255,150,0,${flicker2 * 0.7}) 0%, rgba(255,100,0,${flicker2 * 0.5}) 40%, transparent 70%)`,
          filter: "blur(5px)",
          transform: `scaleY(${flicker2})`,
        }}
      />
      {/* Inner flame (yellow/white) */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: "30%",
          right: "30%",
          height: "60%",
          background: `radial-gradient(ellipse at bottom, rgba(255,220,100,${flicker3 * 0.8}) 0%, rgba(255,180,50,${flicker3 * 0.5}) 50%, transparent 80%)`,
          filter: "blur(3px)",
          transform: `scaleY(${flicker3})`,
        }}
      />
    </div>
  );
};

// Ember particle
const Ember: React.FC<{
  startX: number;
  startY: number;
  delay: number;
}> = ({ startX, startY, delay }) => {
  const frame = useCurrentFrame();

  // Rising animation with loop
  const cycleLength = 120;
  const progress = ((frame + delay) % cycleLength) / cycleLength;

  const y = startY - progress * 400;
  const x = startX + Math.sin((frame + delay) * 0.1) * 30;
  const opacity = progress < 0.2 ? progress * 5 : progress > 0.8 ? (1 - progress) * 5 : 1;
  const size = 3 + Math.sin((frame + delay) * 0.3) * 2;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: size,
        height: size,
        borderRadius: "50%",
        background: `radial-gradient(circle, rgba(255,200,50,${opacity}) 0%, rgba(255,100,0,${opacity * 0.5}) 100%)`,
        boxShadow: `0 0 ${size * 2}px rgba(255,150,0,${opacity * 0.5})`,
        pointerEvents: "none",
      }}
    />
  );
};

export const AlertTitle: React.FC<z.infer<typeof alertTitleSchema>> = ({
  mainTitle,
  subtitle,
  bannerText,
  backgroundColor = "#2a1515",
  ringColor = "#8866aa",
  bannerColor = "#6b3a3a",
  textColor = "#d4af7a",
  mainTitleSize = 110,
  subtitleSize = 48,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Generate fire flames for both sides
  const leftFlames = [
    { x: 0, delay: 0, size: 120 },
    { x: 80, delay: 10, size: 100 },
    { x: 150, delay: 20, size: 80 },
    { x: 30, delay: 15, size: 90 },
    { x: 200, delay: 25, size: 70 },
  ];

  const rightFlames = [
    { x: 0, delay: 5, size: 120 },
    { x: 80, delay: 15, size: 100 },
    { x: 150, delay: 8, size: 80 },
    { x: 30, delay: 22, size: 90 },
    { x: 200, delay: 18, size: 70 },
  ];

  // Generate embers
  const embers = Array.from({ length: 20 }).map((_, i) => ({
    startX: i < 10 ? 50 + (i % 5) * 60 : 1620 + (i % 5) * 60,
    startY: 800 + (i % 3) * 100,
    delay: i * 15,
  }));

  // Ring animation
  const ringScale = spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 40 },
  });

  const ringOpacity = interpolate(ringScale, [0, 1], [0, 0.8]);

  // Ring pulse
  const pulse = Math.sin(frame * 0.05) * 0.05 + 1;

  // Title animation
  const titleProgress = spring({
    frame: frame - 15,
    fps,
    config: { damping: 15, stiffness: 80 },
  });

  const titleScale = interpolate(titleProgress, [0, 1], [0.5, 1]);
  const titleOpacity = interpolate(titleProgress, [0, 1], [0, 1]);

  // Subtitle animation
  const subtitleProgress = spring({
    frame: frame - 30,
    fps,
    config: { damping: 15, stiffness: 80 },
  });

  // Glow animation
  const glowIntensity = interpolate(
    Math.sin(frame * 0.08),
    [-1, 1],
    [30, 60]
  );

  // Background particles/smoke effect positions
  const particles = Array.from({ length: 8 }).map((_, i) => ({
    x: 200 + (i * 250) + Math.sin(frame * 0.02 + i) * 50,
    y: 150 + (i % 3) * 300 + Math.cos(frame * 0.015 + i) * 30,
    size: 100 + (i % 3) * 80,
    opacity: 0.15 + Math.sin(frame * 0.03 + i * 0.5) * 0.1,
  }));

  return (
    <AbsoluteFill style={{ backgroundColor, overflow: "hidden" }}>
      {/* Atmospheric particles/smoke */}
      {particles.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            background: `radial-gradient(circle, rgba(255,150,100,${p.opacity}) 0%, transparent 70%)`,
            filter: "blur(30px)",
          }}
        />
      ))}

      {/* Vignette overlay */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.6) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Glowing ring */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) scale(${ringScale * pulse})`,
          width: 650,
          height: 650,
          borderRadius: "50%",
          border: `5px solid ${ringColor}`,
          opacity: ringOpacity,
          boxShadow: `
            0 0 ${glowIntensity}px ${ringColor},
            0 0 ${glowIntensity * 2}px ${ringColor},
            inset 0 0 ${glowIntensity}px rgba(255,255,255,0.1)
          `,
        }}
      />

      {/* Inner glow */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) scale(${ringScale})`,
          width: 630,
          height: 630,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 60%)`,
          opacity: ringOpacity,
        }}
      />

      {/* Main title */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -60%) scale(${titleScale})`,
          opacity: titleOpacity,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: mainTitleSize,
            fontWeight: 700,
            color: textColor,
            fontFamily: "Georgia, Times New Roman, serif",
            lineHeight: 1.3,
            textShadow: `
              0 0 20px rgba(255,255,255,0.3),
              0 4px 8px rgba(0,0,0,0.5)
            `,
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
            transform: `translate(-50%, 80px) scale(${subtitleProgress})`,
            opacity: subtitleProgress,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: subtitleSize,
              fontWeight: 700,
              color: "rgba(255,255,255,0.9)",
              fontFamily: "Georgia, Times New Roman, serif",
              lineHeight: 1.3,
              textShadow: "0 2px 10px rgba(0,0,0,0.5)",
            }}
          >
            {subtitle}
          </div>
        </div>
      )}

      {/* Banners - diagonal at corners, horizontal at edges, vertical at sides */}
      {generateAllBanners(bannerText, bannerColor, textColor)}

      {/* Fire flames on left side */}
      {leftFlames.map((f, i) => (
        <FireFlame key={`left-${i}`} x={f.x} side="left" delay={f.delay} size={f.size} />
      ))}

      {/* Fire flames on right side */}
      {rightFlames.map((f, i) => (
        <FireFlame key={`right-${i}`} x={f.x} side="right" delay={f.delay} size={f.size} />
      ))}

      {/* Embers floating up */}
      {embers.map((e, i) => (
        <Ember key={`ember-${i}`} startX={e.startX} startY={e.startY} delay={e.delay} />
      ))}

      {/* Edge fire/glow effect */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 250,
          background: "linear-gradient(to top, rgba(255,80,0,0.3) 0%, rgba(255,50,0,0.15) 40%, transparent 100%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 150,
          background: "linear-gradient(to bottom, rgba(255,100,50,0.15) 0%, transparent 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Side fire glow */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          width: 300,
          background: "linear-gradient(to right, rgba(255,80,0,0.2) 0%, transparent 100%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          width: 300,
          background: "linear-gradient(to left, rgba(255,80,0,0.2) 0%, transparent 100%)",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
