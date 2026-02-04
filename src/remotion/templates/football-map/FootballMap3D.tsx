import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  spring,
} from "remotion";
import { z } from "zod";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  Graticule,
} from "react-simple-maps";

export const footballMap3DSchema = z.object({
  country: z.enum(["france", "england", "germany", "italy", "spain", "europe"]),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  highlightColor: z.string().optional(),
  textColor: z.string().optional(),
  backgroundColor: z.string().optional(),
  titleSize: z.number().optional(),
  subtitleSize: z.number().optional(),
});

// World topology URL (Natural Earth 110m)
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Country display names
const countryNames: Record<string, { en: string; zh: string }> = {
  france: { en: "France", zh: "法国" },
  england: { en: "England", zh: "英国" },
  germany: { en: "Germany", zh: "德国" },
  italy: { en: "Italy", zh: "意大利" },
  spain: { en: "Spain", zh: "西班牙" },
  europe: { en: "Europe", zh: "欧洲" },
};

// League names
const leagueNames: Record<string, string> = {
  france: "Ligue 1",
  england: "Premier League",
  germany: "Bundesliga",
  italy: "Serie A",
  spain: "La Liga",
  europe: "Top 5 Leagues",
};

// ISO 3166-1 numeric codes for countries
const countryIsoCodes: Record<string, string[]> = {
  france: ["250"],
  england: ["826"],
  germany: ["276"],
  italy: ["380"],
  spain: ["724"],
  europe: ["250", "826", "276", "380", "724"],
};

// Target rotation (longitude, latitude) for each country - where globe should rotate to
const countryRotation: Record<string, [number, number]> = {
  france: [-2.5, -46.5],
  england: [2, -54],
  germany: [-10.5, -51],
  italy: [-12.5, -42],
  spain: [3.5, -40],
  europe: [-10, -50],
};

// Major cities with real coordinates
const majorCities: Record<string, Array<{ name: string; coordinates: [number, number] }>> = {
  france: [
    { name: "Paris", coordinates: [2.3522, 48.8566] },
    { name: "Lyon", coordinates: [4.8357, 45.7640] },
    { name: "Marseille", coordinates: [5.3698, 43.2965] },
    { name: "Monaco", coordinates: [7.4246, 43.7384] },
  ],
  england: [
    { name: "London", coordinates: [-0.1276, 51.5074] },
    { name: "Manchester", coordinates: [-2.2426, 53.4808] },
    { name: "Liverpool", coordinates: [-2.9916, 53.4084] },
    { name: "Birmingham", coordinates: [-1.8904, 52.4862] },
  ],
  germany: [
    { name: "Berlin", coordinates: [13.4050, 52.5200] },
    { name: "Munich", coordinates: [11.5820, 48.1351] },
    { name: "Dortmund", coordinates: [7.4653, 51.5136] },
    { name: "Frankfurt", coordinates: [8.6821, 50.1109] },
  ],
  italy: [
    { name: "Milan", coordinates: [9.1900, 45.4642] },
    { name: "Turin", coordinates: [7.6869, 45.0703] },
    { name: "Rome", coordinates: [12.4964, 41.9028] },
    { name: "Naples", coordinates: [14.2681, 40.8518] },
  ],
  spain: [
    { name: "Madrid", coordinates: [-3.7038, 40.4168] },
    { name: "Barcelona", coordinates: [2.1734, 41.3851] },
    { name: "Sevilla", coordinates: [-5.9845, 37.3891] },
    { name: "Valencia", coordinates: [-0.3763, 39.4699] },
  ],
  europe: [
    { name: "London", coordinates: [-0.1276, 51.5074] },
    { name: "Paris", coordinates: [2.3522, 48.8566] },
    { name: "Madrid", coordinates: [-3.7038, 40.4168] },
    { name: "Berlin", coordinates: [13.4050, 52.5200] },
    { name: "Rome", coordinates: [12.4964, 41.9028] },
  ],
};

export const FootballMap3D: React.FC<z.infer<typeof footballMap3DSchema>> = ({
  country,
  title,
  subtitle,
  highlightColor = "#ffd700",
  textColor = "#ffd700",
  backgroundColor = "#0a0a15",
  titleSize = 72,
  subtitleSize = 36,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Title animation
  const titleProgress = spring({
    frame: frame - 10,
    fps,
    config: { damping: 15, stiffness: 80 },
  });

  // Globe rotation animation - starts from a wide view and rotates to target country
  const targetRotation = countryRotation[country];

  // Start rotation (showing Atlantic/Europe from afar)
  const startRotation: [number, number] = [30, -30];

  // Animate rotation
  const rotationProgress = interpolate(frame, [0, 90], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const currentRotation: [number, number] = [
    interpolate(rotationProgress, [0, 1], [startRotation[0], targetRotation[0]]),
    interpolate(rotationProgress, [0, 1], [startRotation[1], targetRotation[1]]),
  ];

  // Globe scale animation - zoom in as it rotates
  const globeScale = interpolate(frame, [0, 90], [280, 450], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Fade in
  const mapOpacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Pulse animation for highlight
  const pulseOpacity = interpolate(
    Math.sin(frame * 0.08),
    [-1, 1],
    [0.5, 1]
  );

  const displayTitle = title || countryNames[country].en;
  const displaySubtitle = subtitle || leagueNames[country];
  const cities = majorCities[country];
  const isoCodes = countryIsoCodes[country];

  // Only show cities after globe has mostly rotated to target
  const showCities = frame > 70;

  return (
    <AbsoluteFill style={{ backgroundColor }}>
      {/* Space-like gradient background */}
      <AbsoluteFill
        style={{
          background: `
            radial-gradient(ellipse at 30% 30%, rgba(40, 60, 100, 0.4) 0%, transparent 50%),
            radial-gradient(ellipse at 70% 70%, rgba(20, 30, 60, 0.3) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 50%, rgba(10, 15, 30, 0.8) 0%, transparent 80%)
          `,
        }}
      />

      {/* Stars background */}
      <AbsoluteFill style={{ opacity: 0.4 }}>
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${(i * 37) % 100}%`,
              top: `${(i * 53) % 100}%`,
              width: 2,
              height: 2,
              borderRadius: "50%",
              backgroundColor: "white",
              opacity: 0.3 + (i % 5) * 0.15,
            }}
          />
        ))}
      </AbsoluteFill>

      {/* Main content */}
      <AbsoluteFill>
        {/* Title */}
        <div
          style={{
            position: "absolute",
            top: 50,
            left: 0,
            right: 0,
            textAlign: "center",
            transform: `translateY(${interpolate(titleProgress, [0, 1], [-30, 0])}px)`,
            opacity: titleProgress,
            zIndex: 10,
          }}
        >
          <h1
            style={{
              fontSize: titleSize,
              color: textColor,
              fontFamily: "Georgia, Times New Roman, serif",
              fontWeight: 700,
              lineHeight: 1.3,
              margin: 0,
              textShadow: `0 0 40px ${highlightColor}60, 0 0 80px ${highlightColor}30`,
            }}
          >
            {displayTitle}
          </h1>
          <p
            style={{
              fontSize: subtitleSize,
              color: "rgba(255,255,255,0.8)",
              fontFamily: "Georgia, Times New Roman, serif",
              fontWeight: 700,
              lineHeight: 1.3,
              marginTop: 12,
              letterSpacing: "0.1em",
            }}
          >
            {displaySubtitle}
          </p>
        </div>

        {/* 3D Globe container */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -40%)",
            width: 800,
            height: 800,
            opacity: mapOpacity,
          }}
        >
          {/* Globe glow effect */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: globeScale * 2.2,
              height: globeScale * 2.2,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${highlightColor}15 0%, transparent 70%)`,
              filter: "blur(20px)",
            }}
          />

          <ComposableMap
            projection="geoOrthographic"
            projectionConfig={{
              rotate: currentRotation,
              scale: globeScale,
            }}
            style={{
              width: "100%",
              height: "100%",
            }}
          >
            {/* Ocean/Globe background */}
            <circle
              cx={400}
              cy={400}
              r={globeScale}
              fill="rgba(15, 25, 45, 0.9)"
              stroke={highlightColor}
              strokeWidth={1}
              strokeOpacity={0.3}
            />

            {/* Grid lines (graticule) */}
            <Graticule
              stroke="rgba(100, 120, 150, 0.15)"
              strokeWidth={0.5}
            />

            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const isHighlighted = isoCodes.includes(geo.id);
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={isHighlighted ? highlightColor : "rgba(60, 70, 90, 0.8)"}
                      fillOpacity={isHighlighted ? 0.7 * pulseOpacity : 0.6}
                      stroke={isHighlighted ? highlightColor : "rgba(100, 110, 130, 0.5)"}
                      strokeWidth={isHighlighted ? 1.5 : 0.3}
                      style={{
                        default: { outline: "none" },
                        hover: { outline: "none" },
                        pressed: { outline: "none" },
                      }}
                    />
                  );
                })
              }
            </Geographies>

            {/* City markers - only show after rotation completes */}
            {showCities && cities.map((city, index) => {
              const cityDelay = 70 + index * 10;
              const cityProgress = spring({
                frame: frame - cityDelay,
                fps,
                config: { damping: 12, stiffness: 100 },
              });

              const cityScale = interpolate(cityProgress, [0, 1], [0, 1]);
              const cityOpacity = interpolate(cityProgress, [0, 1], [0, 1]);

              return (
                <Marker key={city.name} coordinates={city.coordinates}>
                  {/* Glow effect */}
                  <circle
                    r={10}
                    fill={highlightColor}
                    opacity={0.4 * cityOpacity}
                    transform={`scale(${cityScale})`}
                  />
                  {/* Main dot */}
                  <circle
                    r={5}
                    fill={highlightColor}
                    opacity={cityOpacity}
                    transform={`scale(${cityScale})`}
                  />
                  {/* City name */}
                  <text
                    textAnchor="middle"
                    y={-15}
                    style={{
                      fontFamily: "Georgia, Times New Roman, serif",
                      fontWeight: 700,
                      fontSize: 12,
                      fill: "white",
                      opacity: cityOpacity,
                      textShadow: "0 0 10px rgba(0,0,0,0.8)",
                    }}
                  >
                    {city.name}
                  </text>
                </Marker>
              );
            })}
          </ComposableMap>
        </div>

        {/* League badge at bottom */}
        <div
          style={{
            position: "absolute",
            bottom: 50,
            left: "50%",
            transform: "translateX(-50%)",
            opacity: interpolate(frame, [90, 110], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            display: "flex",
            alignItems: "center",
            gap: 15,
          }}
        >
          {/* Football icon */}
          <svg width={30} height={30} viewBox="0 0 100 100">
            <circle
              cx={50}
              cy={50}
              r={45}
              fill="none"
              stroke={highlightColor}
              strokeWidth={3}
              opacity={0.8}
            />
            <path
              d="M 50,15 L 70,35 L 65,60 L 35,60 L 30,35 Z"
              fill="none"
              stroke={highlightColor}
              strokeWidth={2}
              opacity={0.6}
            />
          </svg>
          <span
            style={{
              fontFamily: "Georgia, Times New Roman, serif",
              fontWeight: 700,
              fontSize: 18,
              color: "rgba(255,255,255,0.6)",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
            }}
          >
            {displaySubtitle}
          </span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
