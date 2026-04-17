import type { Metadata } from "next";
import { Loader2 } from "lucide-react";
import { Suspense } from "react";
import TrackGenPanel from "~/components/generation/TrackGenPanel";
import TracksFetcher from "~/components/generation/TracksFetcher";

export const metadata: Metadata = {
  title: "Generate Track",
};

const GeneratePage = () => (
  <main className="flex min-h-0 flex-1 flex-col overflow-y-auto lg:flex-row lg:overflow-hidden">
    <TrackGenPanel />

    <Suspense
      fallback={
        <div className="flex size-full flex-col items-center justify-center gap-2">
          <Loader2 aria-hidden="true" className="size-6 animate-spin" />

          <p className="text-muted-foreground text-lg italic">
            Fetching tracks...
          </p>
        </div>
      }
    >
      <TracksFetcher />
    </Suspense>
  </main>
);

export default GeneratePage;
