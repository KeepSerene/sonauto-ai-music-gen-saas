import { Music4 } from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import TrackCard from "~/components/TrackCard";
import { getSession } from "~/server/better-auth/server";
import { db } from "~/server/db";

export const metadata: Metadata = {
  title: "Dashboard",
};

// ─────────────────────────────────────────────────────────────────────────────
// FOOTER
// ─────────────────────────────────────────────────────────────────────────────
function DashboardFooter() {
  return (
    <footer className="mt-auto border-t px-4 py-4">
      <p className="text-muted-foreground/70 text-center text-[11px]">
        &copy; {new Date().getFullYear()} Sonauto. All rights reserved.
      </p>
    </footer>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────
async function DashboardPage() {
  const session = await getSession();

  if (!session?.user) return redirect("/auth/sign-in");

  const songs = await db.song.findMany({
    where: {
      isPublished: true,
    },
    include: {
      user: { select: { name: true } },
      _count: { select: { likes: true } },
      likes: {
        where: { userId: session.user.id },
        select: { userId: true },
      },
      categories: true,
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const songsWithUrlsAndLikedStatus = songs.map((song) => ({
    ...song,
    thumbnailUrl: song.thumbnailUrl,
    audioUrl: song.audioUrl,
    hasLiked: song.likes.length > 0,
  }));

  const recentWindowStart = new Date();
  recentWindowStart.setDate(recentWindowStart.getDate() - 2);

  const calculateScore = (
    track: (typeof songsWithUrlsAndLikedStatus)[number],
  ) => {
    return track._count.likes * 5 + track.listensCount;
  };

  const recentTracks = songsWithUrlsAndLikedStatus.filter(
    (track) => track.createdAt >= recentWindowStart,
  );
  recentTracks.sort((a, b) => calculateScore(b) - calculateScore(a));

  let trendingTracks = recentTracks.slice(0, 10);

  if (trendingTracks.length < 10) {
    const olderTracks = songsWithUrlsAndLikedStatus.filter(
      (track) => track.createdAt < recentWindowStart,
    );
    olderTracks.sort((a, b) => calculateScore(b) - calculateScore(a));

    const needed = 10 - trendingTracks.length;
    trendingTracks = [...trendingTracks, ...olderTracks.slice(0, needed)];
  }

  const trendingTrackIds = new Set(trendingTracks.map((track) => track.id));

  const categorizedTracks = songsWithUrlsAndLikedStatus
    .filter((t) => !trendingTrackIds.has(t.id) && t.categories.length > 0)
    .reduce(
      (acc, curr) => {
        const primaryCategory = curr.categories[0];

        if (primaryCategory) {
          if (!acc[primaryCategory.name]) {
            acc[primaryCategory.name] = [];
          }

          if (acc[primaryCategory.name]!.length < 10) {
            acc[primaryCategory.name]!.push(curr);
          }
        }

        return acc;
      },
      {} as Record<string, Array<(typeof songsWithUrlsAndLikedStatus)[number]>>,
    );

  // ── Empty state ────────────────────────────────────────────────────────────
  if (
    trendingTracks.length === 0 &&
    Object.keys(categorizedTracks).length === 0
  ) {
    return (
      <main className="flex flex-1 flex-col overflow-y-auto">
        <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
          {/* Icon with soft radial glow */}
          <div className="relative mb-6 flex items-center justify-center">
            <div className="bg-primary/20 absolute size-32 rounded-full blur-2xl" />

            <div className="border-border bg-muted/60 relative flex size-24 items-center justify-center rounded-full border">
              <Music4 className="text-primary/60 size-10" />
            </div>
          </div>

          <h1 className="text-xl font-bold tracking-tight">Nothing here yet</h1>

          <p className="text-muted-foreground mt-2 max-w-xs text-sm leading-relaxed">
            No tracks have been published yet. Be the first to generate a song
            and share it with the community.
          </p>
        </div>

        <DashboardFooter />
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col overflow-y-auto">
      <div className="flex-1 p-4 pb-0">
        <h1 className="text-2xl font-bold tracking-tight">Discover Tracks</h1>

        {/* Trending tracks */}
        {trendingTracks.length > 0 && (
          <section className="mt-6">
            <h2 className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
              Trending
            </h2>

            <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {trendingTracks.map((track) => (
                <li key={track.id}>
                  <TrackCard track={track} />
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Categorized tracks */}
        {Object.entries(categorizedTracks)
          .slice(0, 5)
          .map(([category, tracks]) => (
            <section key={category} className="mt-8">
              <h2 className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
                {category}
              </h2>

              <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {tracks.map((track) => (
                  <li key={track.id}>
                    <TrackCard track={track} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
      </div>

      <DashboardFooter />
    </main>
  );
}

export default DashboardPage;
