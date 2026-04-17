import type { Metadata } from "next";
import { AccountView } from "@daveyplate/better-auth-ui";

export const metadata: Metadata = {
  title: "Account Settings",
};

export default async function AccountPage({
  params,
}: {
  params: Promise<{ account?: string[] }>;
}) {
  const { account } = await params;
  const pathname = `/account/${account?.join("/") ?? "settings"}`;

  return (
    <main className="flex px-4 py-12">
      <AccountView pathname={pathname} />
    </main>
  );
}
