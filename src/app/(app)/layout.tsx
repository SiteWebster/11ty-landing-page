import Nav from "@/components/nav";
import SessionProvider from "@/components/session-provider";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionProvider>
      <Nav />
      <main>{children}</main>
    </SessionProvider>
  );
}
