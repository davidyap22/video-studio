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

export const imageShowcaseSchema = z.object({
  images: z.array(z.string()),
  direction: z.enum(["bottomToTop", "topToBottom", "leftToRight", "rightToLeft"]).optional(),
  skewAngle: z.number().optional(),
  backgroundColor: z.string().optional(),
});

// Single skewed image card
const SkewedImageCard: React.FC<{
  imageSrc: string;
  index: number;
  total: number;
  direction: string;
  skewAngle: number;
}> = ({ imageSrc, index, total, direction, skewAngle }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Stagger delay for each image
  const staggerDelay = index * 20;

  // Animation progress
  const animProgress = spring({
    frame: frame - staggerDelay,
    fps,
    config: { damping: 15, stiffness: 80 },
  });

  // Calculate card dimensions based on total images
  const cardWidth = total === 1 ? 600 : total === 2 ? 500 : total === 3 ? 420 : 350;
  const cardHeight = total === 1 ? 750 : total === 2 ? 620 : total === 3 ? 520 : 450;

  // Calculate position - spread horizontally across the screen
  let baseX = 0;
  let baseY = height / 2;

  if (total === 1) {
    baseX = width / 2;
  } else if (total === 2) {
    // Two images - closer to center
    baseX = index === 0 ? width * 0.35 : width * 0.65;
  } else if (total === 3) {
    // Three images - center one in middle
    const positions = [width * 0.25, width * 0.5, width * 0.75];
    baseX = positions[index];
  } else {
    // 4+ images - spread evenly but not too far apart
    const margin = 250;
    const availableWidth = width - margin * 2;
    const spacing = availableWidth / (total - 1);
    baseX = margin + index * spacing;
  }

  // Calculate start position based on direction
  let startX = baseX;
  let startY = baseY;

  switch (direction) {
    case "bottomToTop":
      startY = height + cardHeight;
      break;
    case "topToBottom":
      startY = -cardHeight;
      break;
    case "leftToRight":
      startX = -cardWidth;
      break;
    case "rightToLeft":
      startX = width + cardWidth;
      break;
  }

  // Interpolate position
  const currentX = interpolate(animProgress, [0, 1], [startX, baseX]);
  const currentY = interpolate(animProgress, [0, 1], [startY, baseY]);

  // Scale and rotation for entrance effect
  const scale = interpolate(animProgress, [0, 1], [0.8, 1]);
  const rotation = interpolate(animProgress, [0, 1], [direction === "leftToRight" ? -10 : 10, 0]);

  // Card thickness (edge)
  const thickness = 8;

  return (
    <div
      style={{
        position: "absolute",
        left: currentX,
        top: currentY,
        transform: `translate(-50%, -50%)`,
        perspective: 1200,
        perspectiveOrigin: "center center",
        zIndex: index + 1,
      }}
    >
      {/* 3D Card container */}
      <div
        style={{
          width: cardWidth,
          height: cardHeight,
          position: "relative",
          transformStyle: "preserve-3d",
          transform: `
            scale(${scale})
            rotateY(${skewAngle * 2}deg)
            rotateX(${skewAngle * 0.5}deg)
            rotate(${rotation}deg)
          `,
        }}
      >
        {/* Front face */}
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            borderRadius: 16,
            overflow: "hidden",
            border: "4px solid rgba(255,255,255,0.9)",
            boxShadow: "0 25px 80px rgba(0,0,0,0.5), 0 10px 30px rgba(0,0,0,0.3)",
            background: "#1a1a2e",
            backfaceVisibility: "hidden",
            transform: "translateZ(0px)",
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
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                fontSize: 24,
                fontFamily: "Georgia, Times New Roman, serif",
              }}
            >
              Image {index + 1}
            </div>
          )}
        </div>

        {/* Right edge (thickness) */}
        <div
          style={{
            position: "absolute",
            right: -thickness / 2,
            top: 16,
            bottom: 16,
            width: thickness,
            background: "linear-gradient(to right, #2a2a3e, #1a1a2e)",
            transform: `rotateY(90deg) translateZ(${cardWidth / 2 - thickness / 2}px)`,
            transformOrigin: "center center",
          }}
        />

        {/* Bottom edge (thickness) */}
        <div
          style={{
            position: "absolute",
            left: 16,
            right: 16,
            bottom: -thickness / 2,
            height: thickness,
            background: "linear-gradient(to bottom, #2a2a3e, #1a1a2e)",
            transform: `rotateX(-90deg) translateZ(${cardHeight / 2 - thickness / 2}px)`,
            transformOrigin: "center center",
          }}
        />
      </div>

      {/* Shadow effect */}
      <div
        style={{
          position: "absolute",
          bottom: -30,
          left: "5%",
          right: "-5%",
          height: 60,
          background: "radial-gradient(ellipse at center, rgba(0,0,0,0.5) 0%, transparent 70%)",
          filter: "blur(15px)",
          transform: `skewX(${skewAngle}deg)`,
          zIndex: -1,
        }}
      />
    </div>
  );
};

export const ImageShowcase: React.FC<z.infer<typeof imageShowcaseSchema>> = ({
  images,
  direction = "bottomToTop",
  skewAngle = 8,
  backgroundColor = "#0a0a0a",
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Background subtle animation
  const bgShift = interpolate(
    frame,
    [0, durationInFrames],
    [0, 20],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ backgroundColor, overflow: "hidden" }}>
      {/* Animated background gradient */}
      <div
        style={{
          position: "absolute",
          top: -100,
          left: -100,
          right: -100,
          bottom: -100,
          background: `
            radial-gradient(circle at ${30 + bgShift}% ${40 - bgShift * 0.5}%, rgba(100,100,255,0.1) 0%, transparent 50%),
            radial-gradient(circle at ${70 - bgShift}% ${60 + bgShift * 0.5}%, rgba(255,100,150,0.1) 0%, transparent 50%)
          `,
        }}
      />

      {/* Render images */}
      {images.map((imageSrc, index) => (
        <SkewedImageCard
          key={index}
          imageSrc={imageSrc}
          index={index}
          total={images.length}
          direction={direction}
          skewAngle={skewAngle}
        />
      ))}

      {/* Vignette effect */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.4) 100%)",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
