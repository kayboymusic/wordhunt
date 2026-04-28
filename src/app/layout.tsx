import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WordHunt",
  description: "A daily word guessing game. Challenge your friends.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
