import "~/styles/globals.css";
import { type Metadata } from "next";
import { Libre_Franklin } from "next/font/google";
import { Toaster } from "~/components/ui/sonner";
import { TooltipProvider } from "~/components/ui/tooltip";
import Providers from "~/components/auth/Providers";
import ThemeProvider from "~/components/theme/ThemeProvider";

export const metadata: Metadata = {
  title: {
    template: "%s | Sonauto",
    default: "Sonauto — Sonata + Auto",
  },
  description: "AI music generation SaaS",
  icons: [{ rel: "icon", url: "/favicon.svg", type: "image/svg+xml" }],
};

const libreFranklin = Libre_Franklin({
  subsets: ["latin"],
  variable: "--font-libre-franklin",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={libreFranklin.variable}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body className="selection:bg-primary/20 min-h-dvh selection:text-white">
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
}
