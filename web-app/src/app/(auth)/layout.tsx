import { redirect } from "next/navigation";
import { getSession } from "~/server/better-auth/server";

async function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getSession();

  if (session?.user) return redirect("/dashboard");

  return <>{children}</>;
}

export default AuthLayout;
