import type { Metadata } from "next";
import SignOutClient from "~/components/auth/SignOutClient";

export const metadata: Metadata = {
  title: "Signing Out",
  description: "Securely signing out of your account...",
};

const SignOutPage = () => <SignOutClient />;

export default SignOutPage;
