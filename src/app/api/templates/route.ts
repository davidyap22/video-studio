import { NextResponse } from "next/server";

// List all available templates with their schemas
export async function GET() {
  const templates = {
    TitleCard: {
      description: "Title card with video background",
      props: {
        videoSrc: { type: "string", required: true, description: "Path to background video" },
        title: { type: "string", required: true, description: "Main title text" },
        subtitle: { type: "string", optional: true, description: "Subtitle text" },
        textColor: { type: "string", optional: true, default: "#c9a067", description: "Title color" },
        subtitleColor: { type: "string", optional: true, default: "#ffffff", description: "Subtitle color" },
        titleSize: { type: "number", optional: true, default: 80, description: "Title font size" },
        subtitleSize: { type: "number", optional: true, default: 28, description: "Subtitle font size" },
      },
    },
    Intro: {
      description: "Intro animation with video background",
      props: {
        videoSrc: { type: "string", required: true, description: "Path to background video" },
        title: { type: "string", required: true, description: "Main title text" },
        subtitle: { type: "string", optional: true, description: "Subtitle text" },
        textColor: { type: "string", optional: true, default: "#c9a067", description: "Text color" },
        titleSize: { type: "number", optional: true, default: 80 },
        subtitleSize: { type: "number", optional: true, default: 28 },
      },
    },
    Headline: {
      description: "News headline with highlight words",
      props: {
        headline1: { type: "string", required: true, description: "First headline" },
        headline2: { type: "string", optional: true, description: "Second headline" },
        highlightWords: { type: "array", required: true, description: "Words to highlight" },
        highlightColor: { type: "string", optional: true, default: "#ffd700" },
        backgroundColor: { type: "string", optional: true, default: "#1a1a1a" },
        textColor: { type: "string", optional: true, default: "#ffffff" },
        videoSrc: { type: "string", optional: true, description: "Optional video background" },
        fontSize: { type: "number", optional: true, default: 72 },
      },
    },
    QuoteCard: {
      description: "Quote card with portrait",
      props: {
        portraitSrc: { type: "string", optional: true, description: "Portrait image path" },
        personName: { type: "string", required: true, description: "Person name" },
        quoteLine1: { type: "string", required: true, description: "First line of quote" },
        quoteLine2: { type: "string", optional: true, description: "Second line of quote" },
        videoSrc: { type: "string", optional: true, description: "Background video" },
        textColor: { type: "string", optional: true, default: "#c9a067" },
        quoteSize: { type: "number", optional: true, default: 48 },
        nameSize: { type: "number", optional: true, default: 32 },
      },
    },
    OutlineCard: {
      description: "Outline card with bullet points",
      props: {
        badge: { type: "string", required: true, description: "Badge text" },
        cardTitle: { type: "string", required: true, description: "Card title" },
        cardSubtitle: { type: "string", optional: true },
        cardImageSrc: { type: "string", optional: true },
        videoSrc: { type: "string", optional: true, description: "Background video (20% opacity, blur)" },
        point1: { type: "string", required: true },
        point2: { type: "string", optional: true },
        point3: { type: "string", optional: true },
        point4: { type: "string", optional: true },
        point5: { type: "string", optional: true },
        textColor: { type: "string", optional: true, default: "#c9a067" },
        titleSize: { type: "number", optional: true, default: 48 },
        pointSize: { type: "number", optional: true, default: 56 },
      },
    },
    Timeline: {
      description: "Timeline with nodes and media",
      props: {
        items: {
          type: "array",
          required: true,
          description: "Array of {year, label, mediaSrc?, mediaType?}",
        },
        lineColor: { type: "string", optional: true, default: "#ffd700" },
        textColor: { type: "string", optional: true, default: "#ffd700" },
        yearSize: { type: "number", optional: true, default: 28 },
        labelSize: { type: "number", optional: true, default: 16 },
        backgroundVideoSrc: { type: "string", optional: true, description: "Background video (20% opacity)" },
        backgroundImageSrc: { type: "string", optional: true, description: "Background image (50% opacity)" },
      },
    },
    TimelineDiagonal: {
      description: "Diagonal timeline with camera pan",
      props: {
        items: { type: "array", required: true },
        lineColor: { type: "string", optional: true, default: "#ffd700" },
        textColor: { type: "string", optional: true, default: "#ffd700" },
        yearSize: { type: "number", optional: true, default: 28 },
        labelSize: { type: "number", optional: true, default: 16 },
      },
    },
    TimelineZoom: {
      description: "Timeline with zoom animation",
      props: {
        items: { type: "array", required: true },
        lineColor: { type: "string", optional: true, default: "#ffd700" },
        textColor: { type: "string", optional: true, default: "#ffd700" },
        direction: { type: "string", optional: true, enum: ["leftToRight", "rightToLeft"], default: "leftToRight" },
        yearSize: { type: "number", optional: true, default: 28 },
        labelSize: { type: "number", optional: true, default: 16 },
      },
    },
    TimelineRewind: {
      description: "Timeline with rewind effect",
      props: {
        items: { type: "array", required: true },
        lineColor: { type: "string", optional: true, default: "#ffd700" },
        textColor: { type: "string", optional: true, default: "#ffd700" },
        yearSize: { type: "number", optional: true, default: 28 },
        labelSize: { type: "number", optional: true, default: 16 },
      },
    },
    ImageShowcase: {
      description: "Skewed image showcase",
      props: {
        images: { type: "array", required: true, description: "Array of image paths" },
        direction: { type: "string", optional: true, enum: ["bottomToTop", "topToBottom", "leftToRight", "rightToLeft"] },
        skewAngle: { type: "number", optional: true, default: 8 },
        backgroundColor: { type: "string", optional: true, default: "#0a0a0a" },
      },
    },
    AlertTitle: {
      description: "Alert title with glowing ring",
      props: {
        mainTitle: { type: "string", required: true },
        subtitle: { type: "string", optional: true },
        bannerText: { type: "string", optional: true },
        backgroundColor: { type: "string", optional: true, default: "#2a1515" },
        ringColor: { type: "string", optional: true, default: "#8866aa" },
        bannerColor: { type: "string", optional: true, default: "#6b3a3a" },
        textColor: { type: "string", optional: true, default: "#d4af7a" },
        titleSize: { type: "number", optional: true, default: 120 },
        subtitleSize: { type: "number", optional: true, default: 48 },
      },
    },
    AlertTitleV2: {
      description: "Premium alert title with center mask",
      props: {
        mainTitle: { type: "string", required: true },
        subtitle: { type: "string", optional: true },
        bannerTexts: { type: "array", optional: true },
        backgroundColor: { type: "string", optional: true, default: "#120808" },
        ringColor: { type: "string", optional: true, default: "#7755aa" },
        textColor: { type: "string", optional: true, default: "#c9a067" },
        titleSize: { type: "number", optional: true, default: 140 },
        subtitleSize: { type: "number", optional: true, default: 48 },
      },
    },
    FootballMap: {
      description: "2D map with football league highlight",
      props: {
        country: { type: "string", required: true, enum: ["france", "england", "germany", "italy", "spain", "europe"] },
        title: { type: "string", optional: true },
        subtitle: { type: "string", optional: true },
        highlightColor: { type: "string", optional: true, default: "#ffd700" },
        textColor: { type: "string", optional: true, default: "#ffd700" },
        backgroundColor: { type: "string", optional: true, default: "#0a0a15" },
        titleSize: { type: "number", optional: true, default: 72 },
        subtitleSize: { type: "number", optional: true, default: 36 },
      },
    },
    FootballMap3D: {
      description: "3D globe with football league highlight",
      props: {
        country: { type: "string", required: true, enum: ["france", "england", "germany", "italy", "spain", "europe"] },
        title: { type: "string", optional: true },
        subtitle: { type: "string", optional: true },
        highlightColor: { type: "string", optional: true, default: "#ffd700" },
        textColor: { type: "string", optional: true, default: "#ffd700" },
        backgroundColor: { type: "string", optional: true, default: "#0a0a15" },
        titleSize: { type: "number", optional: true, default: 72 },
        subtitleSize: { type: "number", optional: true, default: 36 },
      },
    },
    FilmTimeline: {
      description: "Historical film timeline with CRT effects",
      props: {
        mediaItems: {
          type: "array",
          required: true,
          description: "Array of {src, type, caption, year}",
        },
        startYear: { type: "number", optional: true, default: 1920 },
        endYear: { type: "number", optional: true, default: 1980 },
        captionSize: { type: "number", optional: true, default: 48 },
        textColor: { type: "string", optional: true, default: "#ffffff" },
        blackAndWhite: { type: "boolean", optional: true, default: true },
      },
    },
  };

  return NextResponse.json({
    templates,
    endpoints: {
      listTemplates: "GET /api/templates",
      renderVideo: "POST /api/templates/render",
      uploadMedia: "POST /api/upload",
    },
  });
}
