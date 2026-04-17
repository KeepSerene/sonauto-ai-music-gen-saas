import { Music4 } from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import TrackCard from "~/components/TrackCard";
import { getSession } from "~/server/better-auth/server";
import { db } from "~/server/db";

export const metadata: Metadata = {
  title: "Dashboard",
};

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
  recentWindowStart.setDate(recentWindowStart.getDate() - 2); // two-day-ago window

  // Helper: Calculate a weighted engagement score.
  // We weight Likes heavily (e.g., 5 points) because they require explicit user intent,
  // whereas Listens (1 point) are passive.
  const calculateScore = (
    track: (typeof songsWithUrlsAndLikedStatus)[number],
  ) => {
    return track._count.likes * 5 + track.listensCount;
  };

  // 1. Isolate tracks from the last 48 hours and sort them by highest engagement
  const recentTracks = songsWithUrlsAndLikedStatus.filter(
    (track) => track.createdAt >= recentWindowStart,
  );
  recentTracks.sort((a, b) => calculateScore(b) - calculateScore(a));

  let trendingTracks = recentTracks.slice(0, 10);

  // 2. Fallback strategy: If we don't have 10 tracks from the last 48 hours
  // (e.g., slow weekend or new app), backfill with the highest-scoring older tracks.
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

  if (
    trendingTracks.length === 0 &&
    Object.keys(categorizedTracks).length === 0
  ) {
    return (
      <section className="flex h-full flex-col items-center justify-center p-4 text-center">
        <Music4 className="text-muted-foreground size-20" />

        <h1 className="mt-4 text-2xl font-bold tracking-tight">
          No tracks yet
        </h1>

        <p className="text-muted-foreground mt-2">
          There are no published tracks available right now. Check back later.
        </p>
      </section>
    );
  }

  return (
    <main className="overflow-y-auto p-4">
      <h1 className="text-2xl font-bold tracking-tight">Discover Tracks</h1>

      {/* Trending tracks */}
      {trendingTracks.length > 0 && (
        <section className="mt-6">
          <h2 className="text-xl font-semibold">Trending</h2>

          <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
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
          <section key={category} className="mt-6">
            <h2 className="text-xl font-semibold">{category}</h2>

            <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {tracks.map((track) => (
                <li key={track.id}>
                  <TrackCard track={track} />
                </li>
              ))}
            </ul>
          </section>
        ))}
    </main>
  );
}

export default DashboardPage;
