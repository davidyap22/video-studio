import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  spring,
  Video,
  staticFile,
  random,
} from "remotion";
import { z } from "zod";

export const introSchema = z.object({
  videoSrc: z.string(),
  title: z.string(),
  subtitle: z.string().optional(),
  textColor: z.string().optional(),
  titleSize: z.number().optional(),
  subtitleSize: z.number().optional(),
});

// Floating dust particle
const DustParticle: React.FC<{
  id: number;
  startX: number;
  startY: number;
  size: number;
  speed: number;
  opacity: number;
}> = ({ id, startX, startY, size, speed, opacity }) => {
  const frame = useCurrentFrame();

  // Continuous floating motion
  const drift = frame * speed;
  const x = startX + Math.sin(frame * 0.02 + id) * 30 + drift * 0.3;
  const y = startY - drift; // Float upward

  // Wrap around when going off screen
  const wrappedY = ((y % 1200) + 1200) % 1200 - 100;

  // Twinkle effect
  const twinkle = 0.5 + Math.sin(frame * 0.1 + id * 10) * 0.5;

  // Fade in/out at edges
  const fadeY = interpolate(wrappedY, [-100, 0, 1000, 1100], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: wrappedY,
        width: size,
        height: size,
        borderRadius: "50%",
        background: `radial-gradient(circle, rgba(255,250,230,${opacity * twinkle * fadeY}) 0%, transparent 70%)`,
        filter: `blur(${size > 3 ? 1 : 0}px)`,
      }}
    />
  );
};

// Light ray/streak
const LightRay: React.FC<{
  id: number;
  side: "left" | "right";
}> = ({ id, side }) => {
  const frame = useCurrentFrame();

  const baseDelay = id * 15;
  const cycleLength = 120;
  const cycleFrame = (frame - baseDelay) % cycleLength;

  // Ray travels across screen
  const progress = interpolate(cycleFrame, [0, cycleLength], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Fade in and out
  const opacity = interpolate(
    cycleFrame,
    [0, 20, cycleLength - 20, cycleLength],
    [0, 0.4, 0.4, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  const startY = 100 + random(`ray-${id}`) * 800;
  const angle = side === "left" ? -25 : 25;
  const startX = side === "left" ? -200 : 2120;
  const endX = side === "left" ? 600 : 1320;

  const currentX = interpolate(progress, [0, 1], [startX, endX]);
  const currentY = startY + progress * 200;

  if (frame < baseDelay) return null;

  return (
    <div
      style={{
        position: "absolute",
        left: currentX,
        top: currentY,
        width: 150 + random(`ray-w-${id}`) * 100,
        height: 1,
        background: `linear-gradient(${side === "left" ? "90deg" : "270deg"},
          transparent 0%,
          rgba(255,245,220,${opacity}) 20%,
          rgba(255,250,235,${opacity * 1.5}) 50%,
          rgba(255,245,220,${opacity}) 80%,
          transparent 100%
        )`,
        transform: `rotate(${angle}deg)`,
        filter: "blur(1px)",
      }}
    />
  );
};

// Glowing light orb (subtle)
const LightOrb: React.FC<{
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
}> = ({ id, x, y, size, delay }) => {
  const frame = useCurrentFrame();

  // Pulse effect
  const pulse = 0.7 + Math.sin(frame * 0.03 + id) * 0.3;
  const drift = Math.sin(frame * 0.015 + id * 5) * 20;

  // Fade in
  const fadeIn = interpolate(frame - delay, [0, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  if (frame < delay) return null;

  return (
    <div
      style={{
        position: "absolute",
        left: x + drift,
        top: y,
        width: size,
        height: size,
        borderRadius: "50%",
        background: `radial-gradient(circle,
          rgba(255,250,230,${0.15 * pulse * fadeIn}) 0%,
          rgba(255,245,200,${0.08 * pulse * fadeIn}) 40%,
          transparent 70%
        )`,
        filter: `blur(${size / 4}px)`,
      }}
    />
  );
};

export const Intro: React.FC<z.infer<typeof introSchema>> = ({
  videoSrc,
  title,
  subtitle,
  textColor = "#c9a067",
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

  // Subtitle animation
  const subtitleOpacity = interpolate(frame, [50, 70], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Generate dust particles
  const dustParticles = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    startX: random(`dust-x-${i}`) * 1920,
    startY: random(`dust-y-${i}`) * 1200,
    size: 2 + random(`dust-s-${i}`) * 4,
    speed: 0.3 + random(`dust-sp-${i}`) * 0.7,
    opacity: 0.3 + random(`dust-o-${i}`) * 0.5,
  }));

  // Generate light orbs (subtle glows)
  const lightOrbs = [
    { id: 1, x: 100, y: 200, size: 150, delay: 10 },
    { id: 2, x: 1750, y: 300, size: 120, delay: 25 },
    { id: 3, x: 150, y: 700, size: 100, delay: 40 },
    { id: 4, x: 1700, y: 600, size: 130, delay: 55 },
    { id: 5, x: 80, y: 450, size: 80, delay: 30 },
    { id: 6, x: 1800, y: 850, size: 90, delay: 45 },
  ];

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
              rgba(0,0,0,0.5) 50%,
              rgba(0,0,0,0.7) 100%
            )
          `,
        }}
      />

      {/* Dot Pattern Overlay */}
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)`,
          backgroundSize: "4px 4px",
        }}
      />

      {/* Cinematic Black Bars */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 80,
          background: "linear-gradient(180deg, #000 0%, transparent 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 80,
          background: "linear-gradient(0deg, #000 0%, transparent 100%)",
        }}
      />

      {/* Light Orbs (subtle glows on sides) */}
      {lightOrbs.map((orb) => (
        <LightOrb key={orb.id} {...orb} />
      ))}

      {/* Light Rays */}
      {Array.from({ length: 4 }, (_, i) => (
        <LightRay key={`left-${i}`} id={i} side="left" />
      ))}
      {Array.from({ length: 4 }, (_, i) => (
        <LightRay key={`right-${i}`} id={i + 4} side="right" />
      ))}

      {/* Floating Dust Particles */}
      {dustParticles.map((p) => (
        <DustParticle key={p.id} {...p} />
      ))}

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
            background: "radial-gradient(ellipse at center, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 50%, transparent 80%)",
            pointerEvents: "none",
          }}
        />

        {/* Main Title */}
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

        {/* Subtitle */}
        {subtitle && (
          <div
            style={{
              fontFamily: "Georgia, Times New Roman, serif",
              fontSize: subtitleSize,
              fontWeight: 700,
              lineHeight: 1.3,
              letterSpacing: "0.2em",
              color: "rgba(255, 255, 255, 0.8)",
              marginTop: 30,
              opacity: subtitleOpacity,
              textTransform: "uppercase",
            }}
          >
            {subtitle}
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
