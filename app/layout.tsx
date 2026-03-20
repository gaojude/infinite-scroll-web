import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Infinite Scroll — Terminal Workspace for macOS",
  description:
    "A keyboard-driven terminal workspace with notes, session persistence, and infinite expandability.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
