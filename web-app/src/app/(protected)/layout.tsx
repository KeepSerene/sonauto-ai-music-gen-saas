import { redirect } from "next/navigation";
import { SidebarProvider } from "~/components/ui/sidebar";
import AppSidebar from "~/components/AppSidebar";
import { db } from "~/server/db";
import AudioPlayer from "~/components/AudioPlayer";
import AppHeader from "~/components/AppHeader";
import { getSession } from "~/server/better-auth/server";
import CheckoutSuccessModal from "~/components/CheckoutSuccessModal";

// Layout for all protected routes
async function ProtectedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getSession();

  if (!session?.user) return redirect("/auth/sign-in");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { credits: true },
  });

  if (!user) return redirect("/auth/sign-in");

  return (
    <SidebarProvider className="h-dvh overflow-hidden">
      <AppSidebar user={user} />

      <div className="flex grow flex-col overflow-hidden">
        <AppHeader />

        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      </div>

      <AudioPlayer />

      <CheckoutSuccessModal />
    </SidebarProvider>
  );
}

export default ProtectedLayout;
