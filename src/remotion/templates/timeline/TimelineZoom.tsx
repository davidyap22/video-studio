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

export const timelineZoomSchema = z.object({
  items: z.array(
    z.object({
      year: z.string(),
      label: z.string().optional(),
      imageSrc: z.string().optional(),
    })
  ),
  lineColor: z.string().optional(),
  textColor: z.string().optional(),
  direction: z.enum(["leftToRight", "rightToLeft"]).optional(),
});

export const TimelineZoom: React.FC<z.infer<typeof timelineZoomSchema>> = ({
  items,
  lineColor = "#ffd700",
  textColor = "#ffd700",
  direction = "leftToRight",
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Calculate which item is currently active
  const framesPerItem = Math.floor((durationInFrames - 60) / items.length);

  // Determine order based on direction
  const orderedItems = direction === "rightToLeft" ? [...items].reverse() : items;

  // Current item index
  const rawIndex = Math.floor(frame / framesPerItem);
  const currentIndex = Math.min(rawIndex, orderedItems.length - 1);

  // Progress within current item (0 to 1)
  const itemProgress = (frame % framesPerItem) / framesPerItem;

  // Card animation
  const cardProgress = spring({
    frame: frame % framesPerItem,
    fps,
    config: { damping: 15, stiffness: 60 },
  });

  const cardScale = interpolate(cardProgress, [0, 1], [0.8, 1]);
  const cardOpacity = interpolate(cardProgress, [0, 1], [0, 1]);

  // Fade out at end of each item
  const itemFadeOut = interpolate(
    itemProgress,
    [0.85, 1],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Timeline scroll position
  const scrollX = interpolate(
    frame,
    [0, durationInFrames - 60],
    direction === "leftToRight" ? [0, (items.length - 1) * 300] : [(items.length - 1) * 300, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Line progress
  const lineProgress = interpolate(
    frame,
    [0, durationInFrames - 60],
    [0, 100],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const currentItem = orderedItems[currentIndex];

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a0a", overflow: "hidden" }}>
      <AbsoluteFill>
        {/* Large skewed card */}
        <div
          style={{
            position: "absolute",
            top: "15%",
            left: "50%",
            transform: `
              translateX(-50%)
              perspective(1000px)
              rotateY(${direction === "leftToRight" ? -15 : 15}deg)
              rotateX(5deg)
              scale(${cardScale})
            `,
            opacity: cardOpacity * itemFadeOut,
          }}
        >
          <div
            style={{
              width: 500,
              height: 320,
              border: "3px solid rgba(255,255,255,0.8)",
              borderRadius: 12,
              overflow: "hidden",
              background: "rgba(20,20,30,0.95)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
            }}
          >
            {currentItem?.imageSrc ? (
              <Img
                src={staticFile(currentItem.imageSrc)}
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
                  background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
                }}
              >
                <div
                  style={{
                    color: "rgba(255,255,255,0.3)",
                    fontSize: 24,
                    fontFamily: "Georgia, Times New Roman, serif",
                    textAlign: "center",
                  }}
                >
                  {currentItem?.label || currentItem?.year}
                </div>
              </div>
            )}
          </div>

          {/* Card label */}
          {currentItem?.label && (
            <div
              style={{
                marginTop: 20,
                textAlign: "center",
                fontSize: 28,
                color: "rgba(255,255,255,0.9)",
                fontFamily: "Georgia, Times New Roman, serif",
                fontWeight: 600,
              }}
            >
              {currentItem.label}
            </div>
          )}
        </div>

        {/* Connector line from card to timeline */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "58%",
            width: 3,
            height: 120,
            background: "rgba(255,255,255,0.6)",
            transform: "translateX(-50%)",
            opacity: cardOpacity * itemFadeOut,
          }}
        />

        {/* Current year label (large) */}
        <div
          style={{
            position: "absolute",
            right: "15%",
            top: "35%",
            fontSize: 80,
            fontWeight: 700,
            fontStyle: "italic",
            color: textColor,
            fontFamily: "Georgia, Times New Roman, serif",
            opacity: cardOpacity * itemFadeOut,
          }}
        >
          {currentItem?.year}
        </div>

        {/* Timeline at bottom */}
        <div
          style={{
            position: "absolute",
            bottom: 80,
            left: 0,
            right: 0,
            height: 100,
          }}
        >
          {/* Timeline line */}
          <div
            style={{
              position: "absolute",
              top: 50,
              left: 100,
              right: 100,
              height: 4,
              background: "rgba(255,255,255,0.2)",
            }}
          >
            <div
              style={{
                width: `${lineProgress}%`,
                height: "100%",
                background: lineColor,
              }}
            />
          </div>

          {/* Timeline markers container */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: "50%",
              transform: `translateX(-${scrollX}px) translateX(-150px)`,
              display: "flex",
              gap: 300,
            }}
          >
            {items.map((item, index) => {
              const isActive = orderedItems[currentIndex]?.year === item.year;
              return (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  {/* Small tick mark */}
                  <div
                    style={{
                      width: 2,
                      height: 20,
                      background: "rgba(255,255,255,0.5)",
                      marginBottom: 10,
                    }}
                  />

                  {/* Node circle */}
                  <div
                    style={{
                      width: isActive ? 30 : 20,
                      height: isActive ? 30 : 20,
                      borderRadius: "50%",
                      border: `3px solid ${isActive ? lineColor : "rgba(255,255,255,0.6)"}`,
                      background: isActive ? "transparent" : "transparent",
                      transition: "all 0.3s ease",
                    }}
                  />

                  {/* Year label */}
                  <div
                    style={{
                      marginTop: 15,
                      fontSize: isActive ? 32 : 24,
                      fontWeight: isActive ? 700 : 400,
                      color: isActive ? textColor : "rgba(255,255,255,0.5)",
                      fontFamily: "Georgia, Times New Roman, serif",
                      transition: "all 0.3s ease",
                    }}
                  >
                    {item.year}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
