import type { Metadata } from "next";
import { Loader2 } from "lucide-react";
import { Suspense } from "react";
import TrackGenPanel from "~/components/track-generation/TrackGenPanel";
import TracksFetcher from "~/components/track-generation/TracksFetcher";

export const metadata: Metadata = {
  title: "Generate Track",
};

const GeneratePage = () => (
  <main className="flex min-h-0 flex-1 flex-col overflow-y-auto lg:flex-row lg:overflow-hidden">
    <TrackGenPanel />

    <Suspense
      fallback={
        <div className="flex size-full flex-col items-center justify-center gap-4">
          <div className="bg-muted/30 flex size-12 items-center justify-center rounded-md">
            <Loader2
              aria-hidden="true"
              className="text-muted-foreground size-6 animate-spin"
            />
          </div>

          <p className="text-muted-foreground">Fetching tracks...</p>
        </div>
      }
    >
      <TracksFetcher />
    </Suspense>
  </main>
);

export default GeneratePage;
