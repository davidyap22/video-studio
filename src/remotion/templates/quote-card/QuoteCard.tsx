import {
  AbsoluteFill,
  Img,
  Video,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  spring,
  staticFile,
  random,
} from "remotion";
import { z } from "zod";

export const quoteCardSchema = z.object({
  portraitSrc: z.string().optional(),
  personName: z.string(),
  quoteLine1: z.string(),
  quoteLine2: z.string().optional(),
  videoSrc: z.string().optional(),
  textColor: z.string().optional(),
  quoteSize: z.number().optional(),
  nameSize: z.number().optional(),
});

// Floating light particle
const LightParticle: React.FC<{
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
}> = ({ id, x, y, size, delay }) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(
    frame - delay,
    [0, 30, 60, 90],
    [0, 0.8, 0.8, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const drift = Math.sin(frame * 0.03 + id) * 10;
  const rise = (frame - delay) * 0.3;

  return (
    <div
      style={{
        position: "absolute",
        left: x + drift,
        top: y - rise,
        width: size,
        height: size,
        borderRadius: "50%",
        background: `radial-gradient(circle, rgba(255,215,0,${opacity}) 0%, transparent 70%)`,
        filter: "blur(2px)",
      }}
    />
  );
};

export const QuoteCard: React.FC<z.infer<typeof quoteCardSchema>> = ({
  portraitSrc,
  personName,
  quoteLine1,
  quoteLine2,
  videoSrc,
  textColor = "#c9a067",
  quoteSize = 48,
  nameSize = 32,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Portrait animation
  const portraitProgress = spring({
    frame: frame - 10,
    fps,
    config: { damping: 15, stiffness: 80 },
  });
  const portraitScale = interpolate(portraitProgress, [0, 1], [0.8, 1]);
  const portraitOpacity = interpolate(portraitProgress, [0, 1], [0, 1]);

  // Name animation
  const nameOpacity = interpolate(frame, [30, 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Quote frame animation
  const quoteFrameProgress = spring({
    frame: frame - 20,
    fps,
    config: { damping: 12, stiffness: 60 },
  });

  // Quote text animation
  const quote1Opacity = interpolate(frame, [40, 60], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const quote2Opacity = interpolate(frame, [55, 75], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Quotation marks animation
  const quoteMarkOpacity = interpolate(frame, [25, 45], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Generate light particles
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: random(`p-x-${i}`) * 1920,
    y: random(`p-y-${i}`) * 1080,
    size: 4 + random(`p-s-${i}`) * 8,
    delay: random(`p-d-${i}`) * 60,
  }));

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a0a" }}>
      {/* Video Background (optional) */}
      {videoSrc && (
        <AbsoluteFill
          style={{
            opacity: 0.2,
            filter: "blur(4px)",
          }}
        >
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

      {/* Dot Pattern Background */}
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)`,
          backgroundSize: "30px 30px",
        }}
      />

      {/* Light Particles */}
      {particles.map((p) => (
        <LightParticle key={p.id} {...p} />
      ))}

      {/* Main Content */}
      <AbsoluteFill>
        {/* Content Container - Centered */}
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
            gap: 100,
          }}
        >
          {/* Portrait Section */}
          <div
            style={{
              opacity: portraitOpacity,
              transform: `scale(${portraitScale})`,
              flexShrink: 0,
            }}
          >
            {/* Gold Frame */}
            <div
              style={{
                width: 300,
                height: 380,
                border: `3px solid ${textColor}`,
                padding: 8,
                background: "rgba(0,0,0,0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {portraitSrc ? (
                <Img
                  src={staticFile(portraitSrc)}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    background: "linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#666",
                    fontSize: 48,
                  }}
                >
                  ?
                </div>
              )}
            </div>

            {/* Person Name */}
            <div
              style={{
                marginTop: 20,
                textAlign: "center",
                fontFamily: "Georgia, Times New Roman, serif",
                fontSize: nameSize,
                fontWeight: 700,
                lineHeight: 1.3,
                letterSpacing: "0.3em",
                opacity: nameOpacity,
                color: textColor,
              }}
            >
              {personName}
            </div>
          </div>

          {/* Quote Section */}
          <div
            style={{
              position: "relative",
              maxWidth: 800,
            }}
          >
            {/* Opening Quote Mark */}
            <div
              style={{
                position: "absolute",
                left: -50,
                top: -20,
                fontSize: 100,
                fontFamily: "Georgia, serif",
                color: textColor,
                opacity: quoteMarkOpacity,
                lineHeight: 1,
              }}
            >
              "
            </div>

            {/* Quote Frame */}
            <div
              style={{
                border: `2px solid ${textColor}`,
                borderRadius: 4,
                padding: "40px 50px",
                transform: `scaleX(${quoteFrameProgress})`,
                transformOrigin: "left",
                background: "rgba(0,0,0,0.3)",
              }}
            >
              {/* Quote Line 1 */}
              <div
                style={{
                  fontFamily: "Georgia, Times New Roman, serif",
                  fontSize: quoteSize,
                  fontWeight: 700,
                  color: textColor,
                  opacity: quote1Opacity,
                  marginBottom: quoteLine2 ? 15 : 0,
                  lineHeight: 1.3,
                }}
              >
                {quoteLine1}
              </div>

              {/* Quote Line 2 */}
              {quoteLine2 && (
                <div
                  style={{
                    fontFamily: "Georgia, Times New Roman, serif",
                    fontSize: quoteSize,
                    fontWeight: 700,
                    color: textColor,
                    opacity: quote2Opacity,
                    lineHeight: 1.3,
                  }}
                >
                  {quoteLine2}
                </div>
              )}
            </div>

            {/* Closing Quote Mark */}
            <div
              style={{
                position: "absolute",
                right: -30,
                bottom: -50,
                fontSize: 100,
                fontFamily: "Georgia, serif",
                color: textColor,
                opacity: quoteMarkOpacity,
                lineHeight: 1,
              }}
            >
              "
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
