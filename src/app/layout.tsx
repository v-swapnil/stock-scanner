import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  title: "Stock Scanner",
  description: "Market intelligence dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${GeistSans.className} ${GeistMono.variable} antialiased dark`}
    >
      <body className="bg-[#08090d]">{children}</body>
    </html>
  );
}
