import {
  AudioLines,
  Coins,
  Disc3,
  Download,
  FileAudio2,
  FileText,
  Globe,
  Guitar,
  Headphones,
  ImagePlay,
  LayoutDashboard,
  Mic2,
  Music2,
  Music3,
  Music4,
  PenLine,
  Piano,
  Radio,
  SlidersHorizontal,
  Wand2,
  Waves,
} from "lucide-react";
import GithubIcon from "~/components/icons/GitHubIcon";
import LinkedInIcon from "~/components/icons/LinkedIn";
import XIcon from "~/components/icons/XIcon";

export const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{8,32}$/;
export const POLAR_STARTER_PACK_ID = "33e1a6a4-6c15-4438-8444-b4d0a600b7cc";
export const POLAR_PRODUCER_PACK_ID = "e448e02c-25d6-49d7-8e4f-c1759e2e5d22";
export const POLAR_STUDIO_PACK_ID = "4a4093ab-6041-4384-aad8-44a518c0bc19";
export const PROTECTED_ROUTES = [
  "/dashboard",
  "/generate",
  "/billing",
  "/account/settings",
];
export const AUTH_ROUTES = ["/auth"];
export const APP_SIDEBAR_ITEMS = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Generate",
    href: "/generate",
    icon: Music2,
  },
];
export const HOME_NAV_LINKS = [
  { label: "How it Works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
] as const;
export const HOME_HOW_IT_WORKS_STEPS = [
  {
    number: "01",
    icon: FileText,
    title: "Describe your sound",
    body: "Type a genre, a mood, a story — anything. One line or a paragraph. Sonauto understands what you're going for.",
  },
  {
    number: "02",
    icon: Wand2,
    title: "AI composes everything",
    body: "Lyrics, melody, and original artwork are generated together in minutes. No technical knowledge needed — just your words.",
  },
  {
    number: "03",
    icon: Download,
    title: "Own your creation",
    body: "Download your track as a high-quality WAV, publish it to the community, or keep it private. Your song, your call.",
  },
] as const;
export const HOME_FEATURES = [
  {
    icon: SlidersHorizontal,
    title: "Four Creative Modes",
    body: "Choose from pure instrumentals, quick vibe-only prompts, AI-assisted lyrics, or full manual control over your own words.",
  },
  {
    icon: PenLine,
    title: "AI-Crafted Lyrics",
    body: "Verses, choruses, and bridges — structured to the song's mood and scaled to your chosen duration.",
  },
  {
    icon: ImagePlay,
    title: "Original Artwork",
    body: "Every track gets a unique AI-generated cover that reflects its sound and atmosphere. No two are alike.",
  },
  {
    icon: Globe,
    title: "Community Discovery",
    body: "Browse trending and genre-categorized tracks published by other creators. Get inspired, or share your own.",
  },
  {
    icon: FileAudio2,
    title: "High-Quality Downloads",
    body: "Export any of your tracks as a WAV file at any time. Your music, ready for wherever you want to take it.",
  },
  {
    icon: Coins,
    title: "Pay as You Go",
    body: "No monthly fees or subscriptions. Buy credits when you need them and spend them only when you generate.",
  },
] as const;
export const HOME_PRICING_PLANS = [
  {
    name: "Free",
    price: "$0",
    period: null,
    tagline: "Just sign up",
    credits: 10,
    songs: 5,
    badge: null,
    highlighted: false,
    cta: "Start for Free",
    href: "/billing",
    perks: [
      "10 credits on signup",
      "All four generation modes",
      "AI-written lyrics",
      "AI-generated artwork",
      "Community discovery",
    ],
  },
  {
    name: "Starter",
    price: "$5",
    period: "one-time",
    tagline: "Starter Pack",
    credits: 60,
    songs: 30,
    badge: null,
    highlighted: false,
    cta: "Get Starter Pack",
    href: "/billing",
    perks: [
      "60 credits",
      "All four generation modes",
      "AI-written lyrics",
      "AI-generated artwork",
      "High-quality WAV downloads",
    ],
  },
  {
    name: "Producer",
    price: "$12",
    period: "one-time",
    tagline: "Producer Pack",
    credits: 160,
    songs: 80,
    badge: "Most Popular",
    highlighted: true,
    cta: "Get Producer Pack",
    href: "/billing",
    perks: [
      "160 credits",
      "All four generation modes",
      "AI-written lyrics",
      "AI-generated artwork",
      "High-quality WAV downloads",
    ],
  },
  {
    name: "Studio",
    price: "$20",
    period: "one-time",
    tagline: "Studio Pack",
    credits: 300,
    songs: 150,
    badge: "Best Value",
    highlighted: false,
    cta: "Get Studio Pack",
    href: "/billing",
    perks: [
      "300 credits",
      "All four generation modes",
      "AI-written lyrics",
      "AI-generated artwork",
      "High-quality WAV downloads",
    ],
  },
] as const;
export const HOME_FOOTER_SOCIALS = [
  {
    label: "Portfolio",
    href: "https://math-to-dev.vercel.app",
    icon: Globe,
  },
  {
    label: "GitHub",
    href: "https://github.com/KeepSerene",
    icon: GithubIcon,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/dhrubajyoti-bhattacharjee-320822318/",
    icon: LinkedInIcon,
  },
  {
    label: "X (Twitter)",
    href: "https://x.com/UsualLearner",
    icon: XIcon,
  },
] as const;
export const HOME_FOOTER_NAV_LINKS = [
  { label: "How it Works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
] as const;
export const AUTH_LAYOUT_FLOATING_ICONS = [
  {
    Icon: Music2,
    size: 28,
    delay: "0s",
    opacity: 0.15,
    top: "8%",
    left: "12%",
  },
  {
    Icon: Headphones,
    size: 22,
    delay: "0.6s",
    opacity: 0.11,
    top: "14%",
    left: "72%",
  },
  {
    Icon: AudioLines,
    size: 32,
    delay: "1.1s",
    opacity: 0.14,
    top: "30%",
    left: "82%",
  },
  {
    Icon: Radio,
    size: 20,
    delay: "0.3s",
    opacity: 0.1,
    top: "45%",
    left: "6%",
  },
  {
    Icon: Disc3,
    size: 36,
    delay: "0.9s",
    opacity: 0.13,
    top: "52%",
    left: "55%",
  },
  {
    Icon: Mic2,
    size: 24,
    delay: "1.4s",
    opacity: 0.12,
    top: "64%",
    left: "28%",
  },
  {
    Icon: Guitar,
    size: 30,
    delay: "0.2s",
    opacity: 0.11,
    top: "72%",
    left: "78%",
  },
  {
    Icon: Music3,
    size: 20,
    delay: "1.7s",
    opacity: 0.1,
    top: "78%",
    left: "10%",
  },
  {
    Icon: Piano,
    size: 34,
    delay: "0.7s",
    opacity: 0.14,
    top: "84%",
    left: "48%",
  },
  {
    Icon: Music4,
    size: 18,
    delay: "1.2s",
    opacity: 0.09,
    top: "22%",
    left: "42%",
  },
  {
    Icon: Waves,
    size: 26,
    delay: "0.4s",
    opacity: 0.12,
    top: "60%",
    left: "92%",
  },
] as const;
export const DAILY_GENERATION_LIMIT = 3;
