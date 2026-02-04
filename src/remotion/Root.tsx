import { Composition } from "remotion";
import { TitleCard, titleCardSchema } from "./templates/title-card";
import { Intro, introSchema } from "./templates/intro";
import { Headline, headlineSchema } from "./templates/headline";
import { QuoteCard, quoteCardSchema } from "./templates/quote-card";
import { OutlineCard, outlineCardSchema } from "./templates/outline-card";
import { Timeline, timelineSchema, TimelineDiagonal, timelineDiagonalSchema, TimelineZoom, timelineZoomSchema, TimelineRewind, timelineRewindSchema } from "./templates/timeline";
import { ImageShowcase, imageShowcaseSchema } from "./templates/image-showcase";
import { AlertTitle, alertTitleSchema, AlertTitleV2, alertTitleV2Schema } from "./templates/alert-title";
import { FootballMap, footballMapSchema } from "./templates/football-map/FootballMap";
import { FootballMap3D, footballMap3DSchema } from "./templates/football-map/FootballMap3D";
import { FilmTimeline, filmTimelineSchema } from "./templates/film-timeline/FilmTimeline";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Title Card */}
      <Composition
        id="TitleCard"
        component={TitleCard}
        durationInFrames={180}
        fps={30}
        width={1920}
        height={1080}
        schema={titleCardSchema}
        defaultProps={{
          videoSrc: "uploads/6854091-hd_1920_1080_30fps.mp4",
          title: "Political Instability",
          subtitle: "A Global Crisis",
        }}
      />

      {/* Intro */}
      <Composition
        id="Intro"
        component={Intro}
        durationInFrames={180}
        fps={30}
        width={1920}
        height={1080}
        schema={introSchema}
        defaultProps={{
          videoSrc: "uploads/6854091-hd_1920_1080_30fps.mp4",
          title: "Venezuela",
          subtitle: "Economic Crisis",
        }}
      />

      {/* Headline */}
      <Composition
        id="Headline"
        component={Headline}
        durationInFrames={180}
        fps={30}
        width={1920}
        height={1080}
        schema={headlineSchema}
        defaultProps={{
          headline1: "Breaking News:",
          headline2: "Major announcement expected today",
          highlightWords: ["Breaking News", "Major"],
          highlightColor: "#ffd700",
          backgroundColor: "#1a1a1a",
          textColor: "#ffffff",
          videoSrc: "",
        }}
      />

      {/* QuoteCard - Person Quote */}
      <Composition
        id="QuoteCard"
        component={QuoteCard}
        durationInFrames={180}
        fps={30}
        width={1920}
        height={1080}
        schema={quoteCardSchema}
        defaultProps={{
          portraitSrc: "",
          personName: "Alfred Adler",
          quoteLine1: "Almost all human suffering",
          quoteLine2: "comes from social interaction",
          videoSrc: "",
          textColor: "#c9a067",
        }}
      />

      {/* OutlineCard - Section Outline */}
      <Composition
        id="OutlineCard"
        component={OutlineCard}
        durationInFrames={180}
        fps={30}
        width={1920}
        height={1080}
        schema={outlineCardSchema}
        defaultProps={{
          badge: "Outline",
          cardTitle: "Disadvantages",
          cardSubtitle: "Overview",
          cardImageSrc: "",
          point1: "Lack of feedback",
          point2: "Cognitive decline",
          point3: "Health risks",
          textColor: "#c9a067",
        }}
      />

      {/* Timeline */}
      <Composition
        id="Timeline"
        component={Timeline}
        durationInFrames={240}
        fps={30}
        width={1920}
        height={1080}
        schema={timelineSchema}
        defaultProps={{
          items: [
            { year: "1990", label: "Beginning" },
            { year: "2000", label: "Growth" },
            { year: "2010", label: "Expansion" },
            { year: "2020", label: "Innovation" },
            { year: "2025", label: "Future" },
          ],
          lineColor: "#ffd700",
          textColor: "#ffd700",
        }}
      />

      {/* Timeline Diagonal - Camera pan from right to left */}
      <Composition
        id="TimelineDiagonal"
        component={TimelineDiagonal}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
        schema={timelineDiagonalSchema}
        defaultProps={{
          items: [
            { year: "1990", label: "Formation" },
            { year: "2000", label: "Christmas Tree" },
            { year: "2010", label: "Network" },
            { year: "2020", label: "Modern" },
            { year: "2025", label: "Future" },
          ],
          lineColor: "#ffd700",
          textColor: "#ffd700",
        }}
      />

      {/* Timeline Zoom - Enlarged card view with direction option */}
      <Composition
        id="TimelineZoom"
        component={TimelineZoom}
        durationInFrames={450}
        fps={30}
        width={1920}
        height={1080}
        schema={timelineZoomSchema}
        defaultProps={{
          items: [
            { year: "1990", label: "Formation" },
            { year: "2000", label: "Evolution" },
            { year: "2010", label: "Revolution" },
            { year: "2020", label: "Innovation" },
            { year: "2025", label: "Future" },
          ],
          lineColor: "#ffd700",
          textColor: "#ffd700",
          direction: "leftToRight",
        }}
      />

      {/* Timeline Rewind - Fast rewind from newest to oldest */}
      <Composition
        id="TimelineRewind"
        component={TimelineRewind}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
        schema={timelineRewindSchema}
        defaultProps={{
          items: [
            { year: "1990", label: "Beginning" },
            { year: "2000", label: "Growth" },
            { year: "2010", label: "Expansion" },
            { year: "2020", label: "Innovation" },
            { year: "2025", label: "Future" },
          ],
          lineColor: "#ffd700",
          textColor: "#ffd700",
        }}
      />

      {/* Image Showcase - Skewed images with animation */}
      <Composition
        id="ImageShowcase"
        component={ImageShowcase}
        durationInFrames={180}
        fps={30}
        width={1920}
        height={1080}
        schema={imageShowcaseSchema}
        defaultProps={{
          images: [],
          direction: "bottomToTop",
          skewAngle: 8,
          backgroundColor: "#0a0a0a",
        }}
      />

      {/* Alert Title - Dramatic title with glowing ring and banners */}
      <Composition
        id="AlertTitle"
        component={AlertTitle}
        durationInFrames={180}
        fps={30}
        width={1920}
        height={1080}
        schema={alertTitleSchema}
        defaultProps={{
          mainTitle: "制裁",
          subtitle: "Sanctions",
          bannerText: "SANCTIONS 制裁",
          backgroundColor: "#2a1515",
          ringColor: "#8866aa",
          bannerColor: "#6b3a3a",
          textColor: "#d4af7a",
        }}
      />

      {/* Alert Title V2 - Premium cinematic with center mask */}
      <Composition
        id="AlertTitleV2"
        component={AlertTitleV2}
        durationInFrames={180}
        fps={30}
        width={1920}
        height={1080}
        schema={alertTitleV2Schema}
        defaultProps={{
          mainTitle: "制裁",
          subtitle: "Sanctions",
          bannerTexts: ["SANCTIONS", "制裁", "RESTRICTED"],
          backgroundColor: "#120808",
          ringColor: "#7755aa",
          textColor: "#c9a067",
        }}
      />

      {/* Football Map - 2D map with country highlight */}
      <Composition
        id="FootballMap"
        component={FootballMap}
        durationInFrames={180}
        fps={30}
        width={1920}
        height={1080}
        schema={footballMapSchema}
        defaultProps={{
          country: "england",
          title: "England",
          subtitle: "Premier League",
          highlightColor: "#ffd700",
          textColor: "#ffd700",
          backgroundColor: "#0a0a15",
        }}
      />

      {/* Football Map 3D - 3D globe with rotation */}
      <Composition
        id="FootballMap3D"
        component={FootballMap3D}
        durationInFrames={180}
        fps={30}
        width={1920}
        height={1080}
        schema={footballMap3DSchema}
        defaultProps={{
          country: "england",
          title: "England",
          subtitle: "Premier League",
          highlightColor: "#ffd700",
          textColor: "#ffd700",
          backgroundColor: "#0a0a15",
        }}
      />

      {/* Film Timeline - Historical film aesthetic */}
      <Composition
        id="FilmTimeline"
        component={FilmTimeline}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
        schema={filmTimelineSchema}
        defaultProps={{
          mediaItems: [],
          startYear: 1920,
          endYear: 1980,
          captionSize: 48,
          textColor: "#ffffff",
          blackAndWhite: true,
        }}
      />
    </>
  );
};
