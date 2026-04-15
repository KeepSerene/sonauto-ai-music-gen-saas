import Link from "next/link";

export default async function LandingPage() {
  return (
    <main className="flex flex-col gap-2">
      <p>Landing page</p>

      <Link href="/dashboard">Go to dashboard</Link>
    </main>
  );
}
