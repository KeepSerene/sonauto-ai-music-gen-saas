import type { Metadata } from "next";
import BillingRedirect from "~/components/BillingRedirect";

export const metadata: Metadata = {
  title: "Redirecting to Billing | Sonauto",
};

const BillingPage = () => (
  <main className="flex h-full flex-col items-center justify-center p-4">
    <BillingRedirect />
  </main>
);

export default BillingPage;
