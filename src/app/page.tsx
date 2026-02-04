"use client";

import { Player } from "@remotion/player";
import type { NextPage } from "next";
import { useMemo, useState } from "react";
import { TitleCard } from "../remotion/templates/title-card";
import { Intro } from "../remotion/templates/intro";
import { Headline } from "../remotion/templates/headline";
import { QuoteCard } from "../remotion/templates/quote-card";
import { OutlineCard } from "../remotion/templates/outline-card";
import { Timeline, TimelineDiagonal, TimelineZoom, TimelineRewind } from "../remotion/templates/timeline";
import { ImageShowcase } from "../remotion/templates/image-showcase";
import { AlertTitle, AlertTitleV2 } from "../remotion/templates/alert-title";
import { FootballMap, FootballMap3D } from "../remotion/templates/football-map";
import { FilmTimeline } from "../remotion/templates/film-timeline";
import type { MediaItem } from "../remotion/templates/film-timeline";

type TemplateType = "TitleCard" | "Intro" | "Headline" | "QuoteCard" | "OutlineCard" | "Timeline" | "TimelineDiagonal" | "TimelineZoom" | "TimelineRewind" | "ImageShowcase" | "AlertTitle" | "AlertTitleV2" | "FootballMap" | "FootballMap3D" | "FilmTimeline";

// API Documentation for each template
const templateDocs: Record<TemplateType, { description: string; curl: string }> = {
  TitleCard: {
    description: "Title card with video background, main title and subtitle",
    curl: `curl -X POST http://localhost:3002/api/templates/render \\
  -H "Content-Type: application/json" \\
  -d '{
    "template": "TitleCard",
    "props": {
      "videoSrc": "uploads/background.mp4",
      "title": "Your Title",
      "subtitle": "Your Subtitle",
      "textColor": "#c9a067",
      "subtitleColor": "#ffffff",
      "titleSize": 80,
      "subtitleSize": 28
    },
    "duration": 6
  }'`,
  },
  Intro: {
    description: "Intro animation with video background",
    curl: `curl -X POST http://localhost:3002/api/templates/render \\
  -H "Content-Type: application/json" \\
  -d '{
    "template": "Intro",
    "props": {
      "videoSrc": "uploads/background.mp4",
      "title": "Your Title",
      "subtitle": "Your Subtitle",
      "textColor": "#c9a067",
      "titleSize": 80,
      "subtitleSize": 28
    },
    "duration": 6
  }'`,
  },
  Headline: {
    description: "News headline with highlight words",
    curl: `curl -X POST http://localhost:3002/api/templates/render \\
  -H "Content-Type: application/json" \\
  -d '{
    "template": "Headline",
    "props": {
      "headline1": "Breaking News:",
      "headline2": "Major announcement expected",
      "highlightWords": ["Breaking News", "Major"],
      "highlightColor": "#ffd700",
      "backgroundColor": "#1a1a1a",
      "textColor": "#ffffff",
      "fontSize": 72
    },
    "duration": 6
  }'`,
  },
  QuoteCard: {
    description: "Quote card with portrait image",
    curl: `curl -X POST http://localhost:3002/api/templates/render \\
  -H "Content-Type: application/json" \\
  -d '{
    "template": "QuoteCard",
    "props": {
      "portraitSrc": "uploads/portrait.jpg",
      "personName": "Person Name",
      "quoteLine1": "First line of quote",
      "quoteLine2": "Second line of quote",
      "textColor": "#c9a067",
      "quoteSize": 48,
      "nameSize": 32
    },
    "duration": 6
  }'`,
  },
  OutlineCard: {
    description: "Outline card with bullet points",
    curl: `curl -X POST http://localhost:3002/api/templates/render \\
  -H "Content-Type: application/json" \\
  -d '{
    "template": "OutlineCard",
    "props": {
      "badge": "Outline",
      "cardTitle": "Card Title",
      "cardSubtitle": "Subtitle",
      "point1": "First point",
      "point2": "Second point",
      "point3": "Third point",
      "textColor": "#c9a067",
      "titleSize": 48,
      "pointSize": 56
    },
    "duration": 6
  }'`,
  },
  Timeline: {
    description: "Timeline with nodes and optional media per item",
    curl: `curl -X POST http://localhost:3002/api/templates/render \\
  -H "Content-Type: application/json" \\
  -d '{
    "template": "Timeline",
    "props": {
      "items": [
        {"year": "1990", "label": "Event 1"},
        {"year": "2000", "label": "Event 2"},
        {"year": "2010", "label": "Event 3"}
      ],
      "lineColor": "#ffd700",
      "textColor": "#ffd700",
      "yearSize": 28,
      "labelSize": 16
    },
    "duration": 8
  }'`,
  },
  TimelineDiagonal: {
    description: "Diagonal timeline with camera pan animation",
    curl: `curl -X POST http://localhost:3002/api/templates/render \\
  -H "Content-Type: application/json" \\
  -d '{
    "template": "TimelineDiagonal",
    "props": {
      "items": [
        {"year": "1990", "label": "Event 1"},
        {"year": "2000", "label": "Event 2"},
        {"year": "2010", "label": "Event 3"}
      ],
      "lineColor": "#ffd700",
      "textColor": "#ffd700"
    },
    "duration": 10
  }'`,
  },
  TimelineZoom: {
    description: "Timeline with zoom animation on each item",
    curl: `curl -X POST http://localhost:3002/api/templates/render \\
  -H "Content-Type: application/json" \\
  -d '{
    "template": "TimelineZoom",
    "props": {
      "items": [
        {"year": "1990", "label": "Event 1"},
        {"year": "2000", "label": "Event 2"},
        {"year": "2010", "label": "Event 3"}
      ],
      "lineColor": "#ffd700",
      "textColor": "#ffd700",
      "direction": "leftToRight"
    },
    "duration": 15
  }'`,
  },
  TimelineRewind: {
    description: "Timeline with rewind effect from newest to oldest",
    curl: `curl -X POST http://localhost:3002/api/templates/render \\
  -H "Content-Type: application/json" \\
  -d '{
    "template": "TimelineRewind",
    "props": {
      "items": [
        {"year": "1990", "label": "Event 1"},
        {"year": "2000", "label": "Event 2"},
        {"year": "2010", "label": "Event 3"}
      ],
      "lineColor": "#ffd700",
      "textColor": "#ffd700"
    },
    "duration": 10
  }'`,
  },
  ImageShowcase: {
    description: "Skewed image showcase with animation",
    curl: `curl -X POST http://localhost:3002/api/templates/render \\
  -H "Content-Type: application/json" \\
  -d '{
    "template": "ImageShowcase",
    "props": {
      "images": [
        "uploads/image1.jpg",
        "uploads/image2.jpg",
        "uploads/image3.jpg"
      ],
      "direction": "bottomToTop",
      "skewAngle": 8,
      "backgroundColor": "#0a0a0a"
    },
    "duration": 6
  }'`,
  },
  AlertTitle: {
    description: "Alert title with glowing ring and banners",
    curl: `curl -X POST http://localhost:3002/api/templates/render \\
  -H "Content-Type: application/json" \\
  -d '{
    "template": "AlertTitle",
    "props": {
      "mainTitle": "制裁",
      "subtitle": "Sanctions",
      "bannerText": "SANCTIONS 制裁",
      "backgroundColor": "#2a1515",
      "ringColor": "#8866aa",
      "bannerColor": "#6b3a3a",
      "textColor": "#d4af7a",
      "titleSize": 120,
      "subtitleSize": 48
    },
    "duration": 6
  }'`,
  },
  AlertTitleV2: {
    description: "Premium alert title with center mask effect",
    curl: `curl -X POST http://localhost:3002/api/templates/render \\
  -H "Content-Type: application/json" \\
  -d '{
    "template": "AlertTitleV2",
    "props": {
      "mainTitle": "制裁",
      "subtitle": "Sanctions",
      "bannerTexts": ["SANCTIONS", "制裁", "RESTRICTED"],
      "backgroundColor": "#120808",
      "ringColor": "#7755aa",
      "textColor": "#c9a067",
      "titleSize": 140,
      "subtitleSize": 48
    },
    "duration": 6
  }'`,
  },
  FootballMap: {
    description: "2D map with football league highlight",
    curl: `curl -X POST http://localhost:3002/api/templates/render \\
  -H "Content-Type: application/json" \\
  -d '{
    "template": "FootballMap",
    "props": {
      "country": "england",
      "title": "England",
      "subtitle": "Premier League",
      "highlightColor": "#ffd700",
      "textColor": "#ffd700",
      "backgroundColor": "#0a0a15",
      "titleSize": 72,
      "subtitleSize": 36
    },
    "duration": 6
  }'`,
  },
  FootballMap3D: {
    description: "3D globe with football league highlight and rotation",
    curl: `curl -X POST http://localhost:3002/api/templates/render \\
  -H "Content-Type: application/json" \\
  -d '{
    "template": "FootballMap3D",
    "props": {
      "country": "england",
      "title": "England",
      "subtitle": "Premier League",
      "highlightColor": "#ffd700",
      "textColor": "#ffd700",
      "backgroundColor": "#0a0a15",
      "titleSize": 72,
      "subtitleSize": 36
    },
    "duration": 6
  }'`,
  },
  FilmTimeline: {
    description: "Historical film timeline with CRT/VHS effects",
    curl: `curl -X POST http://localhost:3002/api/templates/render \\
  -H "Content-Type: application/json" \\
  -d '{
    "template": "FilmTimeline",
    "props": {
      "mediaItems": [
        {"src": "uploads/old1.jpg", "type": "image", "caption": "Event 1", "year": 1920},
        {"src": "uploads/old2.mp4", "type": "video", "caption": "Event 2", "year": 1940}
      ],
      "startYear": 1920,
      "endYear": 1980,
      "textColor": "#ffffff",
      "blackAndWhite": true
    },
    "duration": 10
  }'`,
  },
};

const Home: NextPage = () => {
  // Upload state
  const [videoSrc, setVideoSrc] = useState<string>("uploads/6854091-hd_1920_1080_30fps.mp4");
  const [portraitSrc, setPortraitSrc] = useState<string>("");
  const [cardImageSrc, setCardImageSrc] = useState<string>("");
  const [quoteVideoSrc, setQuoteVideoSrc] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Render state
  const [rendering, setRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState<string>("");
  const [renderedVideoUrl, setRenderedVideoUrl] = useState<string | null>(null);

  // Copy state
  const [copied, setCopied] = useState(false);

  // Active category state
  const [activeCategory, setActiveCategory] = useState<string>("Title");

  // Show API docs state
  const [showApiDocs, setShowApiDocs] = useState(false);

  // Template categories
  const templateCategories: Record<string, { icon: string; templates: TemplateType[] }> = {
    "Title": {
      icon: "📺",
      templates: ["TitleCard", "Intro"],
    },
    "Headlines": {
      icon: "📰",
      templates: ["Headline", "QuoteCard"],
    },
    "Timeline": {
      icon: "📅",
      templates: ["Timeline", "TimelineDiagonal", "TimelineZoom", "TimelineRewind"],
    },
    "Cards": {
      icon: "🎴",
      templates: ["OutlineCard", "AlertTitle", "AlertTitleV2"],
    },
    "Showcase": {
      icon: "🖼️",
      templates: ["ImageShowcase", "FilmTimeline"],
    },
    "Maps": {
      icon: "🗺️",
      templates: ["FootballMap", "FootballMap3D"],
    },
  };

  // Copy to clipboard function
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // Get duration based on template
  const getDuration = () => {
    switch (template) {
      case "TitleCard":
      case "Intro":
        return titleCardDuration;
      case "Headline":
        return headlineDuration;
      case "QuoteCard":
        return quoteDuration;
      case "OutlineCard":
        return outlineDuration;
      case "Timeline":
      case "TimelineDiagonal":
      case "TimelineZoom":
      case "TimelineRewind":
        return timelineDuration;
      case "ImageShowcase":
        return showcaseDuration;
      case "AlertTitle":
      case "AlertTitleV2":
        return alertDuration;
      case "FootballMap":
      case "FootballMap3D":
        return mapDuration;
      case "FilmTimeline":
        return filmDuration;
      default:
        return 6;
    }
  };

  // Template state
  const [template, setTemplate] = useState<TemplateType>("TitleCard");

  // TitleCard/Intro props
  const [title, setTitle] = useState("Political Instability");
  const [subtitle, setSubtitle] = useState("A Global Crisis");
  const [titleCardTextColor, setTitleCardTextColor] = useState("#c9a067");
  const [titleCardSubtitleColor, setTitleCardSubtitleColor] = useState("#ffffff");
  const [titleCardTitleSize, setTitleCardTitleSize] = useState(80);
  const [titleCardSubtitleSize, setTitleCardSubtitleSize] = useState(28);
  const [titleCardDuration, setTitleCardDuration] = useState(6);

  // Headline props
  const [headline1, setHeadline1] = useState("Breaking News:");
  const [headline2, setHeadline2] = useState("Major announcement expected today");
  const [highlightWords, setHighlightWords] = useState("Breaking News, Major");
  const [highlightColor, setHighlightColor] = useState("#ffd700");
  const [bgColor, setBgColor] = useState("#1a1a1a");
  const [headlineTextColor, setHeadlineTextColor] = useState("#ffffff");
  const [headlineVideoSrc, setHeadlineVideoSrc] = useState<string>("");
  const [headlineDuration, setHeadlineDuration] = useState(6); // in seconds
  const [headlineFontSize, setHeadlineFontSize] = useState(72);

  // QuoteCard props
  const [personName, setPersonName] = useState("Alfred Adler");
  const [quoteLine1, setQuoteLine1] = useState("Almost all human suffering");
  const [quoteLine2, setQuoteLine2] = useState("comes from social interaction");
  const [quoteTextColor, setQuoteTextColor] = useState("#c9a067");
  const [quoteSize, setQuoteSize] = useState(48);
  const [quoteNameSize, setQuoteNameSize] = useState(32);
  const [quoteDuration, setQuoteDuration] = useState(6);

  // OutlineCard props
  const [badge, setBadge] = useState("Outline");
  const [cardTitle, setCardTitle] = useState("Disadvantages");
  const [cardSubtitle, setCardSubtitle] = useState("Overview");
  const [point1, setPoint1] = useState("Lack of feedback");
  const [point2, setPoint2] = useState("Cognitive decline");
  const [point3, setPoint3] = useState("Health risks");
  const [point4, setPoint4] = useState("");
  const [point5, setPoint5] = useState("");
  const [outlineTextColor, setOutlineTextColor] = useState("#c9a067");
  const [outlineTitleSize, setOutlineTitleSize] = useState(48);
  const [outlinePointSize, setOutlinePointSize] = useState(56);
  const [outlineDuration, setOutlineDuration] = useState(6);
  const [outlineVideoSrc, setOutlineVideoSrc] = useState<string>("");

  // Timeline props
  const [timelineItems, setTimelineItems] = useState<Array<{
    year: string;
    label: string;
    mediaSrc?: string;
    mediaType?: "image" | "video";
  }>>([
    { year: "1990", label: "Beginning" },
    { year: "2000", label: "Growth" },
    { year: "2010", label: "Expansion" },
    { year: "2020", label: "Innovation" },
    { year: "2025", label: "Future" },
  ]);
  const [timelineColor, setTimelineColor] = useState("#ffd700");
  const [timelineDirection, setTimelineDirection] = useState<"leftToRight" | "rightToLeft">("leftToRight");
  const [timelineYearSize, setTimelineYearSize] = useState(28);
  const [timelineLabelSize, setTimelineLabelSize] = useState(16);
  const [timelineDuration, setTimelineDuration] = useState(8);
  const [timelineBgVideoSrc, setTimelineBgVideoSrc] = useState<string>("");
  const [timelineBgImageSrc, setTimelineBgImageSrc] = useState<string>("");

  // ImageShowcase props
  const [showcaseImages, setShowcaseImages] = useState<string[]>([]);
  const [showcaseDirection, setShowcaseDirection] = useState<"bottomToTop" | "topToBottom" | "leftToRight" | "rightToLeft">("bottomToTop");
  const [showcaseSkewAngle, setShowcaseSkewAngle] = useState(8);
  const [showcaseBgColor, setShowcaseBgColor] = useState("#0a0a0a");
  const [showcaseDuration, setShowcaseDuration] = useState(6);

  // AlertTitle props
  const [alertMainTitle, setAlertMainTitle] = useState("制裁");
  const [alertSubtitle, setAlertSubtitle] = useState("Sanctions");
  const [alertBannerText, setAlertBannerText] = useState("SANCTIONS 制裁");
  const [alertBgColor, setAlertBgColor] = useState("#2a1515");
  const [alertRingColor, setAlertRingColor] = useState("#8866aa");
  const [alertBannerColor, setAlertBannerColor] = useState("#6b3a3a");
  const [alertTextColor, setAlertTextColor] = useState("#d4af7a");
  const [alertMainTitleSize, setAlertMainTitleSize] = useState(110);
  const [alertSubtitleSize, setAlertSubtitleSize] = useState(48);
  const [alertDuration, setAlertDuration] = useState(6);

  // AlertTitleV2 props
  const [alertV2MainTitle, setAlertV2MainTitle] = useState("制裁");
  const [alertV2Subtitle, setAlertV2Subtitle] = useState("Sanctions");
  const [alertV2BannerTexts, setAlertV2BannerTexts] = useState(["SANCTIONS", "制裁", "RESTRICTED"]);
  const [alertV2BgColor, setAlertV2BgColor] = useState("#120808");
  const [alertV2RingColor, setAlertV2RingColor] = useState("#7755aa");
  const [alertV2TextColor, setAlertV2TextColor] = useState("#c9a067");
  const [alertV2MainTitleSize, setAlertV2MainTitleSize] = useState(130);
  const [alertV2SubtitleSize, setAlertV2SubtitleSize] = useState(52);

  // FootballMap props
  const [mapCountry, setMapCountry] = useState<"france" | "england" | "germany" | "italy" | "spain" | "europe">("england");
  const [mapTitle, setMapTitle] = useState("");
  const [mapSubtitle, setMapSubtitle] = useState("");
  const [mapHighlightColor, setMapHighlightColor] = useState("#ffd700");
  const [mapTextColor, setMapTextColor] = useState("#ffd700");
  const [mapBgColor, setMapBgColor] = useState("#0a0a15");
  const [mapTitleSize, setMapTitleSize] = useState(72);
  const [mapSubtitleSize, setMapSubtitleSize] = useState(36);
  const [mapDuration, setMapDuration] = useState(6);

  // FilmTimeline props
  const [filmMediaItems, setFilmMediaItems] = useState<MediaItem[]>([]);
  const [filmCaptionSize, setFilmCaptionSize] = useState(48);
  const [filmStartYear, setFilmStartYear] = useState(1920);
  const [filmEndYear, setFilmEndYear] = useState(1980);
  const [filmTextColor, setFilmTextColor] = useState("#ffffff");
  const [filmBlackAndWhite, setFilmBlackAndWhite] = useState(true);
  const [filmDuration, setFilmDuration] = useState(6);
  // Temp state for adding new item
  const [newItemCaption, setNewItemCaption] = useState("");
  const [newItemYear, setNewItemYear] = useState(1950);

  // Handle file upload
  const handleUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "video" | "image",
    target?: "portrait" | "cardImage" | "quoteVideo" | "headlineVideo" | "showcaseImage" | "filmMedia" | "outlineVideo"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append(type === "video" ? "video" : "image", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      if (target === "filmMedia") {
        // Add new media item to array
        const newItem: MediaItem = {
          src: data.path,
          type: type,
          caption: newItemCaption || `Event ${filmMediaItems.length + 1}`,
          year: newItemYear,
        };
        setFilmMediaItems(prev => [...prev, newItem]);
        setNewItemCaption("");
      } else if (type === "video" && target === "quoteVideo") {
        setQuoteVideoSrc(data.path);
      } else if (type === "video" && target === "headlineVideo") {
        setHeadlineVideoSrc(data.path);
      } else if (type === "video" && target === "outlineVideo") {
        setOutlineVideoSrc(data.path);
      } else if (type === "video") {
        setVideoSrc(data.path);
      } else if (target === "portrait") {
        setPortraitSrc(data.path);
      } else if (target === "cardImage") {
        setCardImageSrc(data.path);
      } else if (target === "showcaseImage") {
        setShowcaseImages((prev) => [...prev, data.path]);
      }
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  // Get component and props based on template
  const { component, inputProps } = useMemo(() => {
    switch (template) {
      case "TitleCard":
        return {
          component: TitleCard,
          inputProps: {
            videoSrc,
            title,
            subtitle,
            textColor: titleCardTextColor,
            subtitleColor: titleCardSubtitleColor,
            titleSize: titleCardTitleSize,
            subtitleSize: titleCardSubtitleSize,
          },
        };
      case "Intro":
        return {
          component: Intro,
          inputProps: {
            videoSrc,
            title,
            subtitle,
            textColor: titleCardTextColor,
            titleSize: titleCardTitleSize,
            subtitleSize: titleCardSubtitleSize,
          },
        };
      case "Headline":
        return {
          component: Headline,
          inputProps: {
            headline1,
            headline2: headline2 || undefined,
            highlightWords: highlightWords.split(",").map((w) => w.trim()),
            highlightColor,
            backgroundColor: bgColor,
            textColor: headlineTextColor,
            videoSrc: headlineVideoSrc || undefined,
            fontSize: headlineFontSize,
          },
        };
      case "QuoteCard":
        return {
          component: QuoteCard,
          inputProps: {
            portraitSrc,
            personName,
            quoteLine1,
            quoteLine2,
            videoSrc: quoteVideoSrc || undefined,
            textColor: quoteTextColor,
            quoteSize,
            nameSize: quoteNameSize,
          },
        };
      case "OutlineCard":
        return {
          component: OutlineCard,
          inputProps: {
            badge,
            cardTitle,
            cardSubtitle,
            cardImageSrc,
            videoSrc: outlineVideoSrc || undefined,
            point1,
            point2: point2 || undefined,
            point3: point3 || undefined,
            point4: point4 || undefined,
            point5: point5 || undefined,
            textColor: outlineTextColor,
            titleSize: outlineTitleSize,
            pointSize: outlinePointSize,
          },
        };
      case "Timeline":
        return {
          component: Timeline,
          inputProps: {
            items: timelineItems,
            lineColor: timelineColor,
            textColor: timelineColor,
            yearSize: timelineYearSize,
            labelSize: timelineLabelSize,
            backgroundVideoSrc: timelineBgVideoSrc || undefined,
            backgroundImageSrc: timelineBgImageSrc || undefined,
          },
        };
      case "TimelineDiagonal":
        return {
          component: TimelineDiagonal,
          inputProps: {
            items: timelineItems,
            lineColor: timelineColor,
            textColor: timelineColor,
            yearSize: timelineYearSize,
            labelSize: timelineLabelSize,
          },
        };
      case "TimelineZoom":
        return {
          component: TimelineZoom,
          inputProps: {
            items: timelineItems,
            lineColor: timelineColor,
            textColor: timelineColor,
            direction: timelineDirection,
            yearSize: timelineYearSize,
            labelSize: timelineLabelSize,
          },
        };
      case "TimelineRewind":
        return {
          component: TimelineRewind,
          inputProps: {
            items: timelineItems,
            lineColor: timelineColor,
            textColor: timelineColor,
            yearSize: timelineYearSize,
            labelSize: timelineLabelSize,
          },
        };
      case "ImageShowcase":
        return {
          component: ImageShowcase,
          inputProps: {
            images: showcaseImages,
            direction: showcaseDirection,
            skewAngle: showcaseSkewAngle,
            backgroundColor: showcaseBgColor,
          },
        };
      case "AlertTitle":
        return {
          component: AlertTitle,
          inputProps: {
            mainTitle: alertMainTitle,
            subtitle: alertSubtitle || undefined,
            bannerText: alertBannerText,
            backgroundColor: alertBgColor,
            ringColor: alertRingColor,
            bannerColor: alertBannerColor,
            textColor: alertTextColor,
            mainTitleSize: alertMainTitleSize,
            subtitleSize: alertSubtitleSize,
          },
        };
      case "AlertTitleV2":
        return {
          component: AlertTitleV2,
          inputProps: {
            mainTitle: alertV2MainTitle,
            subtitle: alertV2Subtitle || undefined,
            bannerTexts: alertV2BannerTexts,
            backgroundColor: alertV2BgColor,
            ringColor: alertV2RingColor,
            textColor: alertV2TextColor,
            mainTitleSize: alertV2MainTitleSize,
            subtitleSize: alertV2SubtitleSize,
          },
        };
      case "FootballMap":
        return {
          component: FootballMap,
          inputProps: {
            country: mapCountry,
            title: mapTitle || undefined,
            subtitle: mapSubtitle || undefined,
            highlightColor: mapHighlightColor,
            textColor: mapTextColor,
            backgroundColor: mapBgColor,
            titleSize: mapTitleSize,
            subtitleSize: mapSubtitleSize,
          },
        };
      case "FootballMap3D":
        return {
          component: FootballMap3D,
          inputProps: {
            country: mapCountry,
            title: mapTitle || undefined,
            subtitle: mapSubtitle || undefined,
            highlightColor: mapHighlightColor,
            textColor: mapTextColor,
            backgroundColor: mapBgColor,
            titleSize: mapTitleSize,
            subtitleSize: mapSubtitleSize,
          },
        };
      case "FilmTimeline":
        return {
          component: FilmTimeline,
          inputProps: {
            mediaItems: filmMediaItems,
            captionSize: filmCaptionSize,
            startYear: filmStartYear,
            endYear: filmEndYear,
            textColor: filmTextColor,
            blackAndWhite: filmBlackAndWhite,
          },
        };
      default:
        return {
          component: TitleCard,
          inputProps: { videoSrc, title, subtitle },
        };
    }
  }, [template, videoSrc, portraitSrc, cardImageSrc, quoteVideoSrc, title, subtitle, titleCardTextColor, titleCardTitleSize, titleCardSubtitleSize, headline1, headline2, highlightWords, highlightColor, bgColor, headlineTextColor, headlineVideoSrc, headlineFontSize, personName, quoteLine1, quoteLine2, quoteTextColor, quoteSize, quoteNameSize, badge, cardTitle, cardSubtitle, point1, point2, point3, point4, point5, outlineTextColor, outlineTitleSize, outlinePointSize, timelineItems, timelineColor, timelineDirection, timelineYearSize, timelineLabelSize, showcaseImages, showcaseDirection, showcaseSkewAngle, showcaseBgColor, alertMainTitle, alertSubtitle, alertBannerText, alertBgColor, alertRingColor, alertBannerColor, alertTextColor, alertMainTitleSize, alertSubtitleSize, alertV2MainTitle, alertV2Subtitle, alertV2BannerTexts, alertV2BgColor, alertV2RingColor, alertV2TextColor, alertV2MainTitleSize, alertV2SubtitleSize, mapCountry, mapTitle, mapSubtitle, mapHighlightColor, mapTextColor, mapBgColor, mapTitleSize, mapSubtitleSize, filmMediaItems, filmCaptionSize, filmStartYear, filmEndYear, filmTextColor, filmBlackAndWhite]);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Video Studio</h1>
          <div className="flex items-center gap-4">
            <a
              href="/tools"
              className="px-4 py-2 rounded-lg text-sm font-medium bg-purple-600 hover:bg-purple-700 transition"
            >
              Video Tools
            </a>
            <span className="text-sm text-gray-400">Template: <span className="text-white font-medium">{template}</span></span>
            <button
              onClick={() => setShowApiDocs(!showApiDocs)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                showApiDocs ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"
              }`}
            >
              {showApiDocs ? "Hide API" : "Show API"}
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Template Categories */}
        <aside className="w-64 bg-gray-900 border-r border-gray-800 min-h-[calc(100vh-73px)] p-4">
          <nav className="space-y-2">
            {Object.entries(templateCategories).map(([category, { icon, templates }]) => (
              <div key={category}>
                <button
                  onClick={() => setActiveCategory(category)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition ${
                    activeCategory === category
                      ? "bg-gray-800 text-white"
                      : "text-gray-400 hover:bg-gray-800/50 hover:text-white"
                  }`}
                >
                  <span className="text-lg">{icon}</span>
                  <span className="font-medium">{category}</span>
                  <span className="ml-auto text-xs bg-gray-700 px-2 py-1 rounded">{templates.length}</span>
                </button>
                {activeCategory === category && (
                  <div className="ml-4 mt-2 space-y-1 border-l-2 border-gray-700 pl-4">
                    {templates.map((t) => (
                      <button
                        key={t}
                        onClick={() => setTemplate(t)}
                        className={`w-full text-left px-3 py-2 rounded text-sm transition ${
                          template === t
                            ? "bg-blue-600 text-white"
                            : "text-gray-400 hover:bg-gray-800 hover:text-white"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
              {/* Preview - Takes more space */}
              <div className="xl:col-span-3">
                <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Preview</h2>
                    <span className="text-xs text-gray-500">1920 × 1080</span>
                  </div>
                  <div className="relative rounded-lg overflow-hidden bg-black aspect-video">
                    <Player
                      component={component as React.ComponentType<Record<string, unknown>>}
                      inputProps={inputProps as Record<string, unknown>}
                      durationInFrames={getDuration() * 30}
                      fps={30}
                      compositionHeight={1080}
                      compositionWidth={1920}
                      style={{ width: "100%" }}
                      controls
                      autoPlay
                      loop
                    />
                  </div>

                  {/* Render Actions */}
                  <div className="mt-4 flex items-center gap-4">
                    <button
                      onClick={async () => {
                        if (rendering) return;
                        setRendering(true);
                        setRenderProgress("Rendering...");
                        setRenderedVideoUrl(null);
                        try {
                          const response = await fetch("/api/render", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ compositionId: template, inputProps }),
                          });
                          const data = await response.json();
                          if (response.ok && data.success) {
                            setRenderProgress("Complete!");
                            setRenderedVideoUrl(data.videoUrl);
                          } else {
                            setRenderProgress(`Error: ${data.error}`);
                          }
                        } catch (error) {
                          setRenderProgress(`Error: ${error instanceof Error ? error.message : "Unknown"}`);
                        } finally {
                          setRendering(false);
                        }
                      }}
                      disabled={rendering}
                      className={`flex-1 py-3 rounded-lg font-semibold transition ${
                        rendering ? "bg-gray-700 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
                      }`}
                    >
                      {rendering ? "Rendering..." : "Render Video"}
                    </button>
                    {renderedVideoUrl && (
                      <a
                        href={renderedVideoUrl}
                        download
                        className="px-6 py-3 rounded-lg font-semibold bg-blue-600 hover:bg-blue-700 transition"
                      >
                        Download
                      </a>
                    )}
                  </div>
                  {renderProgress && (
                    <p className={`mt-2 text-sm ${renderProgress.includes("Error") ? "text-red-400" : "text-gray-400"}`}>
                      {renderProgress}
                    </p>
                  )}
                </div>

                {/* API Documentation - Collapsible */}
                {showApiDocs && (
                  <div className="mt-6 bg-gray-900 rounded-xl p-4 border border-gray-800">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold">API Documentation - {template}</h3>
                      <button
                        onClick={() => copyToClipboard(templateDocs[template].curl)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                          copied ? "bg-green-600" : "bg-gray-700 hover:bg-gray-600"
                        }`}
                      >
                        {copied ? "Copied!" : "Copy curl"}
                      </button>
                    </div>
                    <p className="text-gray-400 text-sm mb-3">{templateDocs[template].description}</p>
                    <div className="bg-gray-950 rounded-lg p-4 overflow-x-auto border border-gray-800">
                      <pre className="text-xs text-green-400 whitespace-pre-wrap font-mono">
                        {templateDocs[template].curl}
                      </pre>
                    </div>
                  </div>
                )}
              </div>

              {/* Properties Panel */}
              <div className="xl:col-span-2">
                <div className="bg-gray-900 rounded-xl p-4 border border-gray-800 max-h-[calc(100vh-150px)] overflow-y-auto">
                  <h2 className="text-lg font-semibold mb-4">Properties</h2>
                  <div className="space-y-4">

            {/* Video Upload - for TitleCard and Intro */}
            {(template === "TitleCard" || template === "Intro") && (
              <div className="bg-gray-800 rounded-lg p-4">
                <h2 className="text-lg font-semibold mb-3">Background Video</h2>
                <label className="block">
                  <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center cursor-pointer hover:border-gray-500 transition">
                    <input
                      type="file"
                      accept="video/mp4,video/webm,video/quicktime"
                      onChange={(e) => handleUpload(e, "video")}
                      className="hidden"
                      disabled={uploading}
                    />
                    {uploading ? (
                      <div className="text-gray-400">Uploading...</div>
                    ) : (
                      <>
                        <div className="text-gray-400 mb-1">Click to upload video</div>
                        <div className="text-gray-500 text-sm">MP4, WebM, MOV</div>
                      </>
                    )}
                  </div>
                </label>
              </div>
            )}

            {/* Portrait Upload - for QuoteCard */}
            {template === "QuoteCard" && (
              <>
                <div className="bg-gray-800 rounded-lg p-4">
                  <h2 className="text-lg font-semibold mb-3">Portrait Image</h2>
                  <label className="block">
                    <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center cursor-pointer hover:border-gray-500 transition">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) => handleUpload(e, "image", "portrait")}
                        className="hidden"
                        disabled={uploading}
                      />
                      <div className="text-gray-400 mb-1">Click to upload portrait</div>
                      <div className="text-gray-500 text-sm">JPG, PNG, WebP</div>
                    </div>
                  </label>
                </div>

                <div className="bg-gray-800 rounded-lg p-4">
                  <h2 className="text-lg font-semibold mb-3">Background Video (optional)</h2>
                  <label className="block">
                    <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center cursor-pointer hover:border-gray-500 transition">
                      <input
                        type="file"
                        accept="video/mp4,video/webm,video/quicktime"
                        onChange={(e) => handleUpload(e, "video", "quoteVideo")}
                        className="hidden"
                        disabled={uploading}
                      />
                      {uploading ? (
                        <div className="text-gray-400">Uploading...</div>
                      ) : (
                        <>
                          <div className="text-gray-400 mb-1">Click to upload video</div>
                          <div className="text-gray-500 text-sm">MP4, WebM, MOV (50% opacity + blur)</div>
                        </>
                      )}
                    </div>
                  </label>
                  {quoteVideoSrc && (
                    <div className="mt-2 flex items-center justify-between text-sm">
                      <span className="text-green-400">Video loaded</span>
                      <button
                        onClick={() => setQuoteVideoSrc("")}
                        className="text-red-400 hover:text-red-300"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Card Image Upload - for OutlineCard */}
            {template === "OutlineCard" && (
              <div className="bg-gray-800 rounded-lg p-4">
                <h2 className="text-lg font-semibold mb-3">Card Background (optional)</h2>
                <label className="block">
                  <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center cursor-pointer hover:border-gray-500 transition">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => handleUpload(e, "image", "cardImage")}
                      className="hidden"
                      disabled={uploading}
                    />
                    <div className="text-gray-400 mb-1">Click to upload image</div>
                    <div className="text-gray-500 text-sm">JPG, PNG, WebP</div>
                  </div>
                </label>
              </div>
            )}

            {/* Video Background Upload - for Headline */}
            {template === "Headline" && (
              <div className="bg-gray-800 rounded-lg p-4">
                <h2 className="text-lg font-semibold mb-3">Background Video (optional)</h2>
                <label className="block">
                  <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center cursor-pointer hover:border-gray-500 transition">
                    <input
                      type="file"
                      accept="video/mp4,video/webm,video/quicktime"
                      onChange={(e) => handleUpload(e, "video", "headlineVideo")}
                      className="hidden"
                      disabled={uploading}
                    />
                    {uploading ? (
                      <div className="text-gray-400">Uploading...</div>
                    ) : (
                      <>
                        <div className="text-gray-400 mb-1">Click to upload video</div>
                        <div className="text-gray-500 text-sm">MP4, WebM, MOV (20% opacity + blur)</div>
                      </>
                    )}
                  </div>
                </label>
                {headlineVideoSrc && (
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-green-400">Video loaded</span>
                    <button
                      onClick={() => setHeadlineVideoSrc("")}
                      className="text-red-400 hover:text-red-300"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Image Upload - for ImageShowcase */}
            {template === "ImageShowcase" && (
              <div className="bg-gray-800 rounded-lg p-4">
                <h2 className="text-lg font-semibold mb-3">Images ({showcaseImages.length}/5)</h2>
                <label className="block">
                  <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center cursor-pointer hover:border-gray-500 transition">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => handleUpload(e, "image", "showcaseImage")}
                      className="hidden"
                      disabled={uploading || showcaseImages.length >= 5}
                    />
                    {uploading ? (
                      <div className="text-gray-400">Uploading...</div>
                    ) : showcaseImages.length >= 5 ? (
                      <div className="text-gray-500">Maximum 5 images</div>
                    ) : (
                      <>
                        <div className="text-gray-400 mb-1">Click to add image</div>
                        <div className="text-gray-500 text-sm">JPG, PNG, WebP</div>
                      </>
                    )}
                  </div>
                </label>
                {showcaseImages.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {showcaseImages.map((img, index) => (
                      <div key={index} className="flex items-center justify-between text-sm bg-gray-700 rounded px-3 py-2">
                        <span className="text-gray-300 truncate flex-1">Image {index + 1}</span>
                        <button
                          onClick={() => setShowcaseImages(showcaseImages.filter((_, i) => i !== index))}
                          className="text-red-400 hover:text-red-300 ml-2"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => setShowcaseImages([])}
                      className="w-full bg-red-900 hover:bg-red-800 px-3 py-2 rounded text-sm"
                    >
                      Clear All
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Media Upload - for FilmTimeline */}
            {template === "FilmTimeline" && (
              <div className="bg-gray-800 rounded-lg p-4">
                <h2 className="text-lg font-semibold mb-3">Historical Media ({filmMediaItems.length})</h2>
                <div className="space-y-3">
                  {/* New item form */}
                  <div className="bg-gray-700 rounded p-3 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={newItemCaption}
                        onChange={(e) => setNewItemCaption(e.target.value)}
                        placeholder="Caption"
                        className="bg-gray-600 border border-gray-500 rounded px-2 py-1 text-white text-sm"
                      />
                      <input
                        type="number"
                        value={newItemYear}
                        onChange={(e) => setNewItemYear(Number(e.target.value))}
                        placeholder="Year"
                        className="bg-gray-600 border border-gray-500 rounded px-2 py-1 text-white text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <label className="block">
                        <div className="border border-dashed border-gray-500 rounded p-2 text-center cursor-pointer hover:border-gray-400 transition text-sm">
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={(e) => handleUpload(e, "image", "filmMedia")}
                            className="hidden"
                            disabled={uploading}
                          />
                          {uploading ? "..." : "+ Image"}
                        </div>
                      </label>
                      <label className="block">
                        <div className="border border-dashed border-gray-500 rounded p-2 text-center cursor-pointer hover:border-gray-400 transition text-sm">
                          <input
                            type="file"
                            accept="video/mp4,video/webm"
                            onChange={(e) => handleUpload(e, "video", "filmMedia")}
                            className="hidden"
                            disabled={uploading}
                          />
                          {uploading ? "..." : "+ Video"}
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Media items list */}
                  {filmMediaItems.length > 0 && (
                    <div className="space-y-2">
                      {filmMediaItems.map((item, index) => (
                        <div key={index} className="bg-gray-700 rounded p-2 flex items-center gap-2">
                          <span className="text-blue-400 font-bold w-6">{index + 1}</span>
                          <div className="flex-1">
                            <input
                              type="text"
                              value={item.caption}
                              onChange={(e) => {
                                const newItems = [...filmMediaItems];
                                newItems[index] = { ...item, caption: e.target.value };
                                setFilmMediaItems(newItems);
                              }}
                              className="bg-gray-600 border border-gray-500 rounded px-2 py-1 text-white text-sm w-full"
                            />
                          </div>
                          <input
                            type="number"
                            value={item.year}
                            onChange={(e) => {
                              const newItems = [...filmMediaItems];
                              newItems[index] = { ...item, year: Number(e.target.value) };
                              setFilmMediaItems(newItems);
                            }}
                            className="bg-gray-600 border border-gray-500 rounded px-2 py-1 text-white text-sm w-16"
                          />
                          <span className="text-xs text-gray-400 w-12">{item.type}</span>
                          {/* Move up */}
                          <button
                            onClick={() => {
                              if (index > 0) {
                                const newItems = [...filmMediaItems];
                                [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
                                setFilmMediaItems(newItems);
                              }
                            }}
                            disabled={index === 0}
                            className="text-gray-400 hover:text-white disabled:opacity-30"
                          >
                            ↑
                          </button>
                          {/* Move down */}
                          <button
                            onClick={() => {
                              if (index < filmMediaItems.length - 1) {
                                const newItems = [...filmMediaItems];
                                [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
                                setFilmMediaItems(newItems);
                              }
                            }}
                            disabled={index === filmMediaItems.length - 1}
                            className="text-gray-400 hover:text-white disabled:opacity-30"
                          >
                            ↓
                          </button>
                          {/* Delete */}
                          <button
                            onClick={() => setFilmMediaItems(filmMediaItems.filter((_, i) => i !== index))}
                            className="text-red-400 hover:text-red-300"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => setFilmMediaItems([])}
                        className="w-full bg-red-900 hover:bg-red-800 px-3 py-1 rounded text-sm"
                      >
                        Clear All
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {uploadError && (
              <div className="bg-red-900/50 text-red-400 p-3 rounded-lg text-sm">
                {uploadError}
              </div>
            )}

            {/* Props Editor */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-3">Properties</h2>

              {/* TitleCard / Intro Props */}
              {(template === "TitleCard" || template === "Intro") && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Title Size: {titleCardTitleSize}px</label>
                    <input
                      type="range"
                      min={40}
                      max={150}
                      value={titleCardTitleSize}
                      onChange={(e) => setTitleCardTitleSize(Number(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Subtitle</label>
                    <input
                      type="text"
                      value={subtitle}
                      onChange={(e) => setSubtitle(e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Subtitle Size: {titleCardSubtitleSize}px</label>
                    <input
                      type="range"
                      min={16}
                      max={60}
                      value={titleCardSubtitleSize}
                      onChange={(e) => setTitleCardSubtitleSize(Number(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Duration: {titleCardDuration} seconds</label>
                    <input
                      type="range"
                      min={3}
                      max={15}
                      value={titleCardDuration}
                      onChange={(e) => setTitleCardDuration(Number(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Title Color</label>
                    <input
                      type="color"
                      value={titleCardTextColor}
                      onChange={(e) => setTitleCardTextColor(e.target.value)}
                      className="w-full h-10 rounded cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Subtitle Color</label>
                    <input
                      type="color"
                      value={titleCardSubtitleColor}
                      onChange={(e) => setTitleCardSubtitleColor(e.target.value)}
                      className="w-full h-10 rounded cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {/* Headline Props */}
              {template === "Headline" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Headline 1</label>
                    <input
                      type="text"
                      value={headline1}
                      onChange={(e) => setHeadline1(e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Headline 2 (optional)</label>
                    <input
                      type="text"
                      value={headline2}
                      onChange={(e) => setHeadline2(e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Highlight Words (comma separated)</label>
                    <input
                      type="text"
                      value={highlightWords}
                      onChange={(e) => setHighlightWords(e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Font Size: {headlineFontSize}px</label>
                    <input
                      type="range"
                      min={36}
                      max={120}
                      value={headlineFontSize}
                      onChange={(e) => setHeadlineFontSize(Number(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Duration: {headlineDuration} seconds</label>
                    <input
                      type="range"
                      min={3}
                      max={15}
                      value={headlineDuration}
                      onChange={(e) => setHeadlineDuration(Number(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Highlight</label>
                      <input
                        type="color"
                        value={highlightColor}
                        onChange={(e) => setHighlightColor(e.target.value)}
                        className="w-full h-10 rounded cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Text</label>
                      <input
                        type="color"
                        value={headlineTextColor}
                        onChange={(e) => setHeadlineTextColor(e.target.value)}
                        className="w-full h-10 rounded cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Background</label>
                      <input
                        type="color"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="w-full h-10 rounded cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* QuoteCard Props */}
              {template === "QuoteCard" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Person Name</label>
                    <input
                      type="text"
                      value={personName}
                      onChange={(e) => setPersonName(e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Name Size: {quoteNameSize}px</label>
                    <input
                      type="range"
                      min={20}
                      max={60}
                      value={quoteNameSize}
                      onChange={(e) => setQuoteNameSize(Number(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Quote Line 1</label>
                    <input
                      type="text"
                      value={quoteLine1}
                      onChange={(e) => setQuoteLine1(e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Quote Line 2</label>
                    <input
                      type="text"
                      value={quoteLine2}
                      onChange={(e) => setQuoteLine2(e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Quote Size: {quoteSize}px</label>
                    <input
                      type="range"
                      min={24}
                      max={80}
                      value={quoteSize}
                      onChange={(e) => setQuoteSize(Number(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Duration: {quoteDuration} seconds</label>
                    <input
                      type="range"
                      min={3}
                      max={15}
                      value={quoteDuration}
                      onChange={(e) => setQuoteDuration(Number(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Text Color</label>
                    <input
                      type="color"
                      value={quoteTextColor}
                      onChange={(e) => setQuoteTextColor(e.target.value)}
                      className="w-full h-10 rounded cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {/* OutlineCard Props */}
              {template === "OutlineCard" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Badge Text</label>
                    <input
                      type="text"
                      value={badge}
                      onChange={(e) => setBadge(e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Card Title</label>
                      <input
                        type="text"
                        value={cardTitle}
                        onChange={(e) => setCardTitle(e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Card Subtitle</label>
                      <input
                        type="text"
                        value={cardSubtitle}
                        onChange={(e) => setCardSubtitle(e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Point 1</label>
                    <input
                      type="text"
                      value={point1}
                      onChange={(e) => setPoint1(e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Point 2</label>
                    <input
                      type="text"
                      value={point2}
                      onChange={(e) => setPoint2(e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Point 3</label>
                    <input
                      type="text"
                      value={point3}
                      onChange={(e) => setPoint3(e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Point 4 (optional)</label>
                    <input
                      type="text"
                      value={point4}
                      onChange={(e) => setPoint4(e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Point 5 (optional)</label>
                    <input
                      type="text"
                      value={point5}
                      onChange={(e) => setPoint5(e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Title Size: {outlineTitleSize}px</label>
                    <input
                      type="range"
                      min={24}
                      max={80}
                      value={outlineTitleSize}
                      onChange={(e) => setOutlineTitleSize(Number(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Point Size: {outlinePointSize}px</label>
                    <input
                      type="range"
                      min={24}
                      max={80}
                      value={outlinePointSize}
                      onChange={(e) => setOutlinePointSize(Number(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Duration: {outlineDuration} seconds</label>
                    <input
                      type="range"
                      min={3}
                      max={15}
                      value={outlineDuration}
                      onChange={(e) => setOutlineDuration(Number(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Text Color</label>
                    <input
                      type="color"
                      value={outlineTextColor}
                      onChange={(e) => setOutlineTextColor(e.target.value)}
                      className="w-full h-10 rounded cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Background Video (20% opacity, 50% blur)
                    </label>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => handleUpload(e, "video", "outlineVideo")}
                      className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-gray-700 file:text-white hover:file:bg-gray-600"
                    />
                    {outlineVideoSrc && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-xs text-green-400">Video loaded</span>
                        <button
                          onClick={() => setOutlineVideoSrc("")}
                          className="text-xs text-red-400 hover:text-red-300"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Timeline Props */}
              {(template === "Timeline" || template === "TimelineDiagonal" || template === "TimelineZoom" || template === "TimelineRewind") && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Line Color</label>
                    <input
                      type="color"
                      value={timelineColor}
                      onChange={(e) => setTimelineColor(e.target.value)}
                      className="w-full h-10 rounded cursor-pointer"
                    />
                  </div>
                  {template === "TimelineZoom" && (
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Direction</label>
                      <select
                        value={timelineDirection}
                        onChange={(e) => setTimelineDirection(e.target.value as "leftToRight" | "rightToLeft")}
                        className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                      >
                        <option value="leftToRight">Left to Right (1990 → 2025)</option>
                        <option value="rightToLeft">Right to Left (2025 → 1990)</option>
                      </select>
                    </div>
                  )}
                  <div className="text-sm text-gray-400 mb-2">Timeline Items</div>
                  {timelineItems.map((item, index) => (
                    <div key={index} className="border border-gray-600 rounded p-3 mb-2">
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <input
                          type="text"
                          value={item.year}
                          onChange={(e) => {
                            const newItems = [...timelineItems];
                            newItems[index] = { ...newItems[index], year: e.target.value };
                            setTimelineItems(newItems);
                          }}
                          placeholder="Year"
                          className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm"
                        />
                        <input
                          type="text"
                          value={item.label || ""}
                          onChange={(e) => {
                            const newItems = [...timelineItems];
                            newItems[index] = { ...newItems[index], label: e.target.value };
                            setTimelineItems(newItems);
                          }}
                          placeholder="Label"
                          className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          accept="image/*,video/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const formData = new FormData();
                            formData.append(file.type.startsWith("video") ? "video" : "image", file);
                            const response = await fetch("/api/upload", { method: "POST", body: formData });
                            const data = await response.json();
                            if (response.ok) {
                              const newItems = [...timelineItems];
                              newItems[index] = {
                                ...newItems[index],
                                mediaSrc: data.path,
                                mediaType: file.type.startsWith("video") ? "video" : "image",
                              };
                              setTimelineItems(newItems);
                            }
                          }}
                          className="flex-1 text-xs text-gray-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-gray-700 file:text-white"
                        />
                        {item.mediaSrc && (
                          <button
                            onClick={() => {
                              const newItems = [...timelineItems];
                              newItems[index] = { ...newItems[index], mediaSrc: undefined, mediaType: undefined };
                              setTimelineItems(newItems);
                            }}
                            className="text-xs text-red-400 hover:text-red-300"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                      {item.mediaSrc && (
                        <div className="mt-1 text-xs text-green-400">
                          {item.mediaType === "video" ? "🎬" : "🖼️"} Media loaded
                        </div>
                      )}
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setTimelineItems([...timelineItems, { year: "", label: "" }])}
                      className="flex-1 bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded text-sm"
                    >
                      + Add Item
                    </button>
                    {timelineItems.length > 2 && (
                      <button
                        onClick={() => setTimelineItems(timelineItems.slice(0, -1))}
                        className="bg-red-900 hover:bg-red-800 px-3 py-2 rounded text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Year Size: {timelineYearSize}px</label>
                    <input
                      type="range"
                      min={16}
                      max={48}
                      value={timelineYearSize}
                      onChange={(e) => setTimelineYearSize(Number(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Label Size: {timelineLabelSize}px</label>
                    <input
                      type="range"
                      min={12}
                      max={32}
                      value={timelineLabelSize}
                      onChange={(e) => setTimelineLabelSize(Number(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Duration: {timelineDuration} seconds</label>
                    <input
                      type="range"
                      min={5}
                      max={20}
                      value={timelineDuration}
                      onChange={(e) => setTimelineDuration(Number(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  {template === "Timeline" && (
                    <>
                      <div className="border-t border-gray-600 pt-4 mt-4">
                        <div className="text-sm text-gray-400 mb-2">Background Media</div>
                        <div className="mb-3">
                          <label className="block text-xs text-gray-500 mb-1">
                            Video Background (20% opacity, 50% blur)
                          </label>
                          <input
                            type="file"
                            accept="video/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const formData = new FormData();
                              formData.append("video", file);
                              const response = await fetch("/api/upload", { method: "POST", body: formData });
                              const data = await response.json();
                              if (response.ok) {
                                setTimelineBgVideoSrc(data.path);
                                setTimelineBgImageSrc("");
                              }
                            }}
                            className="w-full text-xs text-gray-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-gray-700 file:text-white"
                          />
                          {timelineBgVideoSrc && (
                            <div className="mt-1 flex items-center gap-2">
                              <span className="text-xs text-green-400">🎬 Video loaded</span>
                              <button
                                onClick={() => setTimelineBgVideoSrc("")}
                                className="text-xs text-red-400 hover:text-red-300"
                              >
                                Remove
                              </button>
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">
                            Image Background (50% opacity)
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const formData = new FormData();
                              formData.append("image", file);
                              const response = await fetch("/api/upload", { method: "POST", body: formData });
                              const data = await response.json();
                              if (response.ok) {
                                setTimelineBgImageSrc(data.path);
                                setTimelineBgVideoSrc("");
                              }
                            }}
                            className="w-full text-xs text-gray-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-gray-700 file:text-white"
                          />
                          {timelineBgImageSrc && (
                            <div className="mt-1 flex items-center gap-2">
                              <span className="text-xs text-green-400">🖼️ Image loaded</span>
                              <button
                                onClick={() => setTimelineBgImageSrc("")}
                                className="text-xs text-red-400 hover:text-red-300"
                              >
                                Remove
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* ImageShowcase Props */}
              {template === "ImageShowcase" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Animation Direction</label>
                    <select
                      value={showcaseDirection}
                      onChange={(e) => setShowcaseDirection(e.target.value as "bottomToTop" | "topToBottom" | "leftToRight" | "rightToLeft")}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                    >
                      <option value="bottomToTop">Bottom to Top</option>
                      <option value="topToBottom">Top to Bottom</option>
                      <option value="leftToRight">Left to Right</option>
                      <option value="rightToLeft">Right to Left</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Skew Angle: {showcaseSkewAngle}°</label>
                    <input
                      type="range"
                      min={0}
                      max={20}
                      value={showcaseSkewAngle}
                      onChange={(e) => setShowcaseSkewAngle(Number(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Background Color</label>
                    <input
                      type="color"
                      value={showcaseBgColor}
                      onChange={(e) => setShowcaseBgColor(e.target.value)}
                      className="w-full h-10 rounded cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Duration: {showcaseDuration} seconds</label>
                    <input
                      type="range"
                      min={3}
                      max={15}
                      value={showcaseDuration}
                      onChange={(e) => setShowcaseDuration(Number(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {/* AlertTitle Props */}
              {template === "AlertTitle" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Main Title</label>
                    <input
                      type="text"
                      value={alertMainTitle}
                      onChange={(e) => setAlertMainTitle(e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Subtitle</label>
                    <input
                      type="text"
                      value={alertSubtitle}
                      onChange={(e) => setAlertSubtitle(e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Banner Text</label>
                    <input
                      type="text"
                      value={alertBannerText}
                      onChange={(e) => setAlertBannerText(e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Main Title Size: {alertMainTitleSize}px</label>
                    <input
                      type="range"
                      min={60}
                      max={180}
                      value={alertMainTitleSize}
                      onChange={(e) => setAlertMainTitleSize(Number(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Subtitle Size: {alertSubtitleSize}px</label>
                    <input
                      type="range"
                      min={24}
                      max={80}
                      value={alertSubtitleSize}
                      onChange={(e) => setAlertSubtitleSize(Number(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Duration: {alertDuration} seconds</label>
                    <input
                      type="range"
                      min={3}
                      max={15}
                      value={alertDuration}
                      onChange={(e) => setAlertDuration(Number(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Background</label>
                      <input
                        type="color"
                        value={alertBgColor}
                        onChange={(e) => setAlertBgColor(e.target.value)}
                        className="w-full h-10 rounded cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Ring</label>
                      <input
                        type="color"
                        value={alertRingColor}
                        onChange={(e) => setAlertRingColor(e.target.value)}
                        className="w-full h-10 rounded cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Banner</label>
                      <input
                        type="color"
                        value={alertBannerColor}
                        onChange={(e) => setAlertBannerColor(e.target.value)}
                        className="w-full h-10 rounded cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Text</label>
                      <input
                        type="color"
                        value={alertTextColor}
                        onChange={(e) => setAlertTextColor(e.target.value)}
                        className="w-full h-10 rounded cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* AlertTitleV2 Props */}
              {template === "AlertTitleV2" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Main Title</label>
                    <input
                      type="text"
                      value={alertV2MainTitle}
                      onChange={(e) => setAlertV2MainTitle(e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Main Title Size: {alertV2MainTitleSize}px</label>
                    <input
                      type="range"
                      min={60}
                      max={200}
                      value={alertV2MainTitleSize}
                      onChange={(e) => setAlertV2MainTitleSize(Number(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Subtitle</label>
                    <input
                      type="text"
                      value={alertV2Subtitle}
                      onChange={(e) => setAlertV2Subtitle(e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Subtitle Size: {alertV2SubtitleSize}px</label>
                    <input
                      type="range"
                      min={24}
                      max={100}
                      value={alertV2SubtitleSize}
                      onChange={(e) => setAlertV2SubtitleSize(Number(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Banner Texts</label>
                    {alertV2BannerTexts.map((text, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={text}
                          onChange={(e) => {
                            const newTexts = [...alertV2BannerTexts];
                            newTexts[index] = e.target.value;
                            setAlertV2BannerTexts(newTexts);
                          }}
                          placeholder={`Banner ${index + 1}`}
                          className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm"
                        />
                        {alertV2BannerTexts.length > 1 && (
                          <button
                            onClick={() => setAlertV2BannerTexts(alertV2BannerTexts.filter((_, i) => i !== index))}
                            className="px-3 py-2 bg-red-900 hover:bg-red-800 rounded text-sm"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                    {alertV2BannerTexts.length < 5 && (
                      <button
                        onClick={() => setAlertV2BannerTexts([...alertV2BannerTexts, ""])}
                        className="w-full bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded text-sm"
                      >
                        + Add Banner Text
                      </button>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Duration: {alertDuration} seconds</label>
                    <input
                      type="range"
                      min={3}
                      max={15}
                      value={alertDuration}
                      onChange={(e) => setAlertDuration(Number(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Background</label>
                      <input
                        type="color"
                        value={alertV2BgColor}
                        onChange={(e) => setAlertV2BgColor(e.target.value)}
                        className="w-full h-10 rounded cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Ring</label>
                      <input
                        type="color"
                        value={alertV2RingColor}
                        onChange={(e) => setAlertV2RingColor(e.target.value)}
                        className="w-full h-10 rounded cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Text</label>
                      <input
                        type="color"
                        value={alertV2TextColor}
                        onChange={(e) => setAlertV2TextColor(e.target.value)}
                        className="w-full h-10 rounded cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* FootballMap / FootballMap3D Props */}
              {(template === "FootballMap" || template === "FootballMap3D") && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Country / Region</label>
                    <select
                      value={mapCountry}
                      onChange={(e) => setMapCountry(e.target.value as typeof mapCountry)}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                    >
                      <option value="england">England (英国) - Premier League</option>
                      <option value="france">France (法国) - Ligue 1</option>
                      <option value="germany">Germany (德国) - Bundesliga</option>
                      <option value="italy">Italy (意大利) - Serie A</option>
                      <option value="spain">Spain (西班牙) - La Liga</option>
                      <option value="europe">Europe (欧洲) - Top 5 Leagues</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Title (optional, auto-fills)</label>
                    <input
                      type="text"
                      value={mapTitle}
                      onChange={(e) => setMapTitle(e.target.value)}
                      placeholder="Leave empty for country name"
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Title Size: {mapTitleSize}px</label>
                    <input
                      type="range"
                      min={36}
                      max={120}
                      value={mapTitleSize}
                      onChange={(e) => setMapTitleSize(Number(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Subtitle (optional, auto-fills)</label>
                    <input
                      type="text"
                      value={mapSubtitle}
                      onChange={(e) => setMapSubtitle(e.target.value)}
                      placeholder="Leave empty for league name"
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Subtitle Size: {mapSubtitleSize}px</label>
                    <input
                      type="range"
                      min={20}
                      max={72}
                      value={mapSubtitleSize}
                      onChange={(e) => setMapSubtitleSize(Number(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Duration: {mapDuration} seconds</label>
                    <input
                      type="range"
                      min={3}
                      max={15}
                      value={mapDuration}
                      onChange={(e) => setMapDuration(Number(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Highlight</label>
                      <input
                        type="color"
                        value={mapHighlightColor}
                        onChange={(e) => setMapHighlightColor(e.target.value)}
                        className="w-full h-10 rounded cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Text</label>
                      <input
                        type="color"
                        value={mapTextColor}
                        onChange={(e) => setMapTextColor(e.target.value)}
                        className="w-full h-10 rounded cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Background</label>
                      <input
                        type="color"
                        value={mapBgColor}
                        onChange={(e) => setMapBgColor(e.target.value)}
                        className="w-full h-10 rounded cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* FilmTimeline Props */}
              {template === "FilmTimeline" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Caption Size: {filmCaptionSize}px</label>
                    <input
                      type="range"
                      min={24}
                      max={80}
                      value={filmCaptionSize}
                      onChange={(e) => setFilmCaptionSize(Number(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Timeline Start</label>
                      <input
                        type="number"
                        value={filmStartYear}
                        onChange={(e) => setFilmStartYear(Number(e.target.value))}
                        className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Timeline End</label>
                      <input
                        type="number"
                        value={filmEndYear}
                        onChange={(e) => setFilmEndYear(Number(e.target.value))}
                        className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Duration: {filmDuration}s ({filmMediaItems.length > 0 ? `${(filmDuration / filmMediaItems.length).toFixed(1)}s per item` : 'add media'})</label>
                    <input
                      type="range"
                      min={3}
                      max={30}
                      value={filmDuration}
                      onChange={(e) => setFilmDuration(Number(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="text-sm text-gray-400">Black & White</label>
                    <input
                      type="checkbox"
                      checked={filmBlackAndWhite}
                      onChange={(e) => setFilmBlackAndWhite(e.target.checked)}
                      className="w-5 h-5 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Text Color</label>
                    <input
                      type="color"
                      value={filmTextColor}
                      onChange={(e) => setFilmTextColor(e.target.value)}
                      className="w-full h-10 rounded cursor-pointer"
                    />
                  </div>
                </div>
              )}

                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </main>
      </div>
    </div>
  );
};

export default Home;
