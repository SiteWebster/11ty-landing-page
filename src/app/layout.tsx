import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/nav";
import SessionProvider from "@/components/session-provider";

export const metadata: Metadata = {
  title: "QuoteFlow",
  description: "Agency-first multi-tenant quoting platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <SessionProvider>
          <Nav />
          <main>{children}</main>
        </SessionProvider>
      </body>
    </html>
  );
}
