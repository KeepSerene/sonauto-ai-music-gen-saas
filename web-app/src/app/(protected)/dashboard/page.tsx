import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
};

async function DashboardPage() {
  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-y-auto lg:overflow-hidden">
      DashboardPage
    </main>
  );
}

export default DashboardPage;
