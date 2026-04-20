import "~/styles/globals.css";
import { type Metadata } from "next";
import { Libre_Franklin } from "next/font/google";
import { Toaster } from "~/components/ui/sonner";
import { TooltipProvider } from "~/components/ui/tooltip";
import Providers from "~/components/auth/Providers";
import ThemeProvider from "~/components/theme/ThemeProvider";
import { env } from "~/env";

// ─────────────────────────────────────────────────────────────────────────────
// METADATA
// ─────────────────────────────────────────────────────────────────────────────

const APP_URL = env.NEXT_PUBLIC_APP_URL;
const APP_TITLE = "Sonauto — Sonata, Automated";
const APP_DESCRIPTION =
  "Turn any idea into a full song — AI-written lyrics, original melody, and unique artwork — in minutes. Describe your vision and let Sonauto compose the rest.";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    template: "%s | Sonauto",
    default: APP_TITLE,
  },
  description: APP_DESCRIPTION,
  keywords: [
    "AI music generation",
    "AI song maker",
    "text to music",
    "AI lyrics generator",
    "music AI",
    "song generator",
    "AI composer",
    "AI music",
    "generate music from text",
    "AI audio generation",
    "music creation tool",
    "lyric writer AI",
  ],
  authors: [
    {
      name: "Dhrubajyoti Bhattacharjee",
      url: "https://math-to-dev.vercel.app",
    },
  ],
  creator: "Dhrubajyoti Bhattacharjee",
  publisher: "Sonauto",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: APP_URL,
    title: APP_TITLE,
    description: APP_DESCRIPTION,
    siteName: "Sonauto",
    images: [
      {
        url: "/hero-banner-dark.webp",
        width: 1200,
        height: 630,
        alt: "Sonauto — AI Music Generation. Sonata, Automated.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: APP_TITLE,
    description: APP_DESCRIPTION,
    creator: "@UsualLearner",
    site: "@sonauto",
    images: ["/hero-banner-dark.webp"],
  },
  icons: [{ rel: "icon", url: "/favicon.svg", type: "image/svg+xml" }],
  alternates: {
    canonical: APP_URL,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// FONT
// ─────────────────────────────────────────────────────────────────────────────

const libreFranklin = Libre_Franklin({
  subsets: ["latin"],
  variable: "--font-libre-franklin",
});

// ─────────────────────────────────────────────────────────────────────────────
// LAYOUT
// ─────────────────────────────────────────────────────────────────────────────

const RootLayout = ({ children }: Readonly<{ children: React.ReactNode }>) => (
  <html
    lang="en"
    className={libreFranklin.variable}
    data-scroll-behavior="smooth"
    suppressHydrationWarning
  >
    <body className="selection:bg-primary selection:text-primary-foreground min-h-dvh">
      <ThemeProvider
        attribute="class"
        enableSystem
        enableColorScheme
        defaultTheme="system"
      >
        <Providers>
          <TooltipProvider>{children}</TooltipProvider>
        </Providers>

        <Toaster position="top-right" richColors />
      </ThemeProvider>
    </body>
  </html>
);

export default RootLayout;
