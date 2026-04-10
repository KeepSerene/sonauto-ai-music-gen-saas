import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "~/server/better-auth";

async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) return redirect("/auth/sign-in");

  return <div>DashboardPage</div>;
}

export default DashboardPage;
