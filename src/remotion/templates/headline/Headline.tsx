import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  spring,
  Easing,
  Video,
  staticFile,
} from "remotion";
import { z } from "zod";

export const headlineSchema = z.object({
  headline1: z.string(),
  headline2: z.string().optional(),
  highlightWords: z.array(z.string()),
  highlightColor: z.string().optional(),
  backgroundColor: z.string().optional(),
  textColor: z.string().optional(),
  videoSrc: z.string().optional(),
  fontSize: z.number().optional(),
});

// Check if a word should be highlighted
const shouldHighlight = (word: string, highlightWords: string[]): boolean => {
  const cleanWord = word.replace(/[.,!?;:'"]/g, "").toLowerCase();
  return highlightWords.some((hw) => {
    const cleanHighlight = hw.toLowerCase();
    return cleanWord === cleanHighlight || cleanWord.includes(cleanHighlight);
  });
};

// Animated word component
const AnimatedWord: React.FC<{
  word: string;
  index: number;
  isHighlighted: boolean;
  highlightColor: string;
  textColor: string;
  totalWords: number;
  startDelay: number;
}> = ({ word, index, isHighlighted, highlightColor, textColor, totalWords, startDelay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Word appears
  const wordDelay = startDelay + index * 3;
  const wordProgress = spring({
    frame: frame - wordDelay,
    fps,
    config: { damping: 15, stiffness: 100 },
  });

  const wordOpacity = interpolate(wordProgress, [0, 1], [0, 1]);
  const wordY = interpolate(wordProgress, [0, 1], [20, 0]);

  // Highlight animation (starts after all words appear)
  const highlightDelay = startDelay + totalWords * 3 + 20 + index * 2;
  const highlightProgress = interpolate(
    frame - highlightDelay,
    [0, 15],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    }
  );

  return (
    <span
      style={{
        display: "inline-block",
        position: "relative",
        opacity: wordOpacity,
        transform: `translateY(${wordY}px)`,
        marginRight: "0.3em",
        color: isHighlighted && highlightProgress > 0.5 ? "#000" : textColor,
        transition: "color 0.2s ease",
      }}
    >
      {/* Highlight background */}
      {isHighlighted && (
        <span
          style={{
            position: "absolute",
            left: -4,
            right: -4,
            top: "10%",
            bottom: "5%",
            background: highlightColor,
            transform: `scaleX(${highlightProgress})`,
            transformOrigin: "left",
            zIndex: -1,
            borderRadius: 4,
          }}
        />
      )}
      {word}
    </span>
  );
};

// Animated line component
const AnimatedLine: React.FC<{
  text: string;
  highlightWords: string[];
  highlightColor: string;
  textColor: string;
  startDelay: number;
  fontSize: number;
}> = ({ text, highlightWords, highlightColor, textColor, startDelay, fontSize }) => {
  const words = text.split(" ");

  return (
    <div
      style={{
        fontSize,
        fontWeight: 700,
        fontFamily: "Georgia, Times New Roman, serif",
        lineHeight: 1.3,
        textAlign: "center",
      }}
    >
      {words.map((word, index) => (
        <AnimatedWord
          key={index}
          word={word}
          index={index}
          isHighlighted={shouldHighlight(word, highlightWords)}
          highlightColor={highlightColor}
          textColor={textColor}
          totalWords={words.length}
          startDelay={startDelay}
        />
      ))}
    </div>
  );
};

export const Headline: React.FC<z.infer<typeof headlineSchema>> = ({
  headline1,
  headline2,
  highlightWords,
  highlightColor = "#ffd700",
  backgroundColor = "#1a1a1a",
  textColor = "#ffffff",
  videoSrc,
  fontSize = 72,
}) => {
  const words1 = headline1.split(" ");
  const line1WordCount = words1.length;

  return (
    <AbsoluteFill style={{ backgroundColor }}>
      {/* Video Background (optional) */}
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

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: 100,
          gap: 20,
        }}
      >
        <div
          style={{
            maxWidth: 1400,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
          }}
        >
          {/* Headline 1 */}
          <AnimatedLine
            text={headline1}
            highlightWords={highlightWords}
            highlightColor={highlightColor}
            textColor={textColor}
            startDelay={10}
            fontSize={fontSize}
          />

          {/* Headline 2 (optional) */}
          {headline2 && (
            <AnimatedLine
              text={headline2}
              highlightWords={highlightWords}
              highlightColor={highlightColor}
              textColor={textColor}
              startDelay={10 + line1WordCount * 3 + 10}
              fontSize={fontSize}
            />
          )}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
