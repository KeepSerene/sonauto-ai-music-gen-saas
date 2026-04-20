import type { Metadata } from "next";
import { Loader2 } from "lucide-react";
import { Suspense } from "react";
import TrackGenPanel from "~/components/tracks/TrackGenPanel";
import TracksFetcher from "~/components/tracks/TracksFetcher";
import { getSession } from "~/server/better-auth/server";
import { redirect } from "next/navigation";
import { db } from "~/server/db";

export const metadata: Metadata = {
  title: "Generate Track",
};

async function GeneratePage() {
  const session = await getSession();

  if (!session?.user) return redirect("/auth/sign-in");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { credits: true },
  });

  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-y-auto lg:flex-row lg:overflow-hidden">
      <TrackGenPanel credits={user?.credits ?? 0} />

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
}

export default GeneratePage;
