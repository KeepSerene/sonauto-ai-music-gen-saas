import { redirect } from "next/navigation";
import { SidebarProvider } from "~/components/ui/sidebar";
import AppSidebar from "~/components/AppSidebar";
import { db } from "~/server/db";
import AudioPlayer from "~/components/audio-player/AudioPlayer";
import AppHeader from "~/components/AppHeader";
import { getSession } from "~/server/better-auth/server";
import CheckoutSuccessModal from "~/components/CheckoutSuccessModal";
import { DAILY_GENERATION_LIMIT } from "~/lib/constants";

// Layout for all protected routes
async function ProtectedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getSession();

  if (!session?.user) return redirect("/auth/sign-in");

  // Rolling 24-hour window
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [user, dailySongCount, oldestDailySong] = await Promise.all([
    db.user.findUnique({
      where: { id: session.user.id },
      select: { credits: true },
    }),
    db.song.count({
      where: { userId: session.user.id, createdAt: { gte: since } },
    }),
    db.song.findFirst({
      where: { userId: session.user.id, createdAt: { gte: since } },
      orderBy: { createdAt: "asc" },
      select: { createdAt: true },
    }),
  ]);

  if (!user) return redirect("/auth/sign-in");

  const isRateLimited = dailySongCount >= DAILY_GENERATION_LIMIT;
  const rateLimitResetAt =
    isRateLimited && oldestDailySong
      ? new Date(
          oldestDailySong.createdAt.getTime() + 24 * 60 * 60 * 1000,
        ).toISOString()
      : null;

  return (
    <SidebarProvider className="h-dvh overflow-hidden">
      <AppSidebar user={user} />

      <div className="flex grow flex-col overflow-hidden">
        <AppHeader rateLimitResetAt={rateLimitResetAt} />

        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      </div>

      <AudioPlayer />

      <CheckoutSuccessModal />
    </SidebarProvider>
  );
}

export default ProtectedLayout;
