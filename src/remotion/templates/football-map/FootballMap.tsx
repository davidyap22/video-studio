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
} from "react-simple-maps";

export const footballMapSchema = z.object({
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
  france: ["250"], // France
  england: ["826"], // United Kingdom
  germany: ["276"], // Germany
  italy: ["380"], // Italy
  spain: ["724"], // Spain
  europe: ["250", "826", "276", "380", "724"], // All 5
};

// Map projection settings for each country
const projectionConfig: Record<string, { center: [number, number]; scale: number }> = {
  france: { center: [2.5, 46.5], scale: 2200 },
  england: { center: [-2, 54], scale: 2800 },
  germany: { center: [10.5, 51], scale: 2800 },
  italy: { center: [12.5, 42], scale: 2000 },
  spain: { center: [-3.5, 40], scale: 2200 },
  europe: { center: [10, 50], scale: 600 },
};

// Major cities/stadiums for each country with real coordinates
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

export const FootballMap: React.FC<z.infer<typeof footballMapSchema>> = ({
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

  // Map fade in
  const mapOpacity = interpolate(frame, [20, 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Map scale animation
  const mapScale = interpolate(frame, [20, 60], [0.8, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Pulse animation for highlight
  const pulseOpacity = interpolate(
    Math.sin(frame * 0.08),
    [-1, 1],
    [0.6, 1]
  );

  const displayTitle = title || countryNames[country].en;
  const displaySubtitle = subtitle || leagueNames[country];
  const cities = majorCities[country];
  const projection = projectionConfig[country];
  const isoCodes = countryIsoCodes[country];

  return (
    <AbsoluteFill style={{ backgroundColor }}>
      {/* Gradient overlay */}
      <AbsoluteFill
        style={{
          background: `
            radial-gradient(ellipse at 50% 50%, rgba(30, 40, 80, 0.4) 0%, transparent 70%),
            radial-gradient(ellipse at 80% 20%, rgba(50, 30, 60, 0.3) 0%, transparent 50%)
          `,
        }}
      />

      {/* Main content */}
      <AbsoluteFill>
        {/* Title */}
        <div
          style={{
            position: "absolute",
            top: 60,
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
              textShadow: `0 0 30px ${highlightColor}40`,
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

        {/* Map container */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: `translate(-50%, -35%) scale(${mapScale})`,
            width: country === "europe" ? 1200 : 800,
            height: country === "europe" ? 800 : 600,
            opacity: mapOpacity,
          }}
        >
          <ComposableMap
            projection="geoMercator"
            projectionConfig={projection}
            style={{ width: "100%", height: "100%" }}
          >
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const isHighlighted = isoCodes.includes(geo.id);
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={isHighlighted ? highlightColor : "rgba(40,40,60,0.3)"}
                      fillOpacity={isHighlighted ? 0.4 * pulseOpacity : 0.3}
                      stroke={isHighlighted ? highlightColor : "rgba(100,100,120,0.3)"}
                      strokeWidth={isHighlighted ? 2 : 0.5}
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

            {/* City markers */}
            {cities.map((city, index) => {
              const cityDelay = 50 + index * 12;
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
                    r={12}
                    fill={highlightColor}
                    opacity={0.3 * cityOpacity}
                    transform={`scale(${cityScale})`}
                  />
                  {/* Main dot */}
                  <circle
                    r={6}
                    fill={highlightColor}
                    opacity={cityOpacity}
                    transform={`scale(${cityScale})`}
                  />
                  {/* City name */}
                  <text
                    textAnchor="middle"
                    y={-20}
                    style={{
                      fontFamily: "Georgia, Times New Roman, serif",
                      fontWeight: 700,
                      fontSize: country === "europe" ? 14 : 16,
                      fill: "white",
                      opacity: cityOpacity,
                    }}
                  >
                    {city.name}
                  </text>
                </Marker>
              );
            })}
          </ComposableMap>
        </div>

        {/* Football icon decoration */}
        <div
          style={{
            position: "absolute",
            bottom: 50,
            left: "50%",
            transform: "translateX(-50%)",
            opacity: interpolate(frame, [70, 90], [0, 0.6], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          <svg width={40} height={40} viewBox="0 0 100 100">
            <circle
              cx={50}
              cy={50}
              r={45}
              fill="none"
              stroke="white"
              strokeWidth={3}
            />
            {/* Pentagon pattern */}
            <path
              d="M 50,15 L 70,35 L 65,60 L 35,60 L 30,35 Z"
              fill="none"
              stroke="white"
              strokeWidth={2}
            />
            <path
              d="M 50,15 L 50,5 M 70,35 L 85,30 M 65,60 L 75,75 M 35,60 L 25,75 M 30,35 L 15,30"
              stroke="white"
              strokeWidth={2}
            />
          </svg>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
