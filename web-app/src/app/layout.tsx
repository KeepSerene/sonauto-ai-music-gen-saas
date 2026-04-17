import "~/styles/globals.css";
import { type Metadata } from "next";
import { Libre_Franklin } from "next/font/google";
import { Toaster } from "~/components/ui/sonner";
import { TooltipProvider } from "~/components/ui/tooltip";
import { cn } from "~/lib/utils";
import Providers from "~/components/auth/Providers";

export const metadata: Metadata = {
  title: {
    template: "%s | Sonauto",
    default: "Sonauto — Sonata + Auto",
  },
  description: "AI music generation SaaS",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
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
      className={cn("dark", libreFranklin.variable)}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body className="selection:bg-primary/20 min-h-dvh selection:text-white">
        <Providers>
          <TooltipProvider>{children}</TooltipProvider>
        </Providers>

        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
