import Providers from "~/components/Providers";

function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <Providers>{children}</Providers>;
}

export default AuthLayout;
