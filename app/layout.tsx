import type { Metadata } from "next";
import "./globals.css";

const url = "https://infinite-scroll.dev";

export const metadata: Metadata = {
  title: "Infinite Scroll — Terminal Workspace for macOS",
  description:
    "A keyboard-driven terminal workspace with notes, session persistence, and infinite expandability.",
  metadataBase: new URL(url),
  openGraph: {
    title: "Infinite Scroll",
    description:
      "A terminal workspace that never forgets. Split, stack, and persist your sessions.",
    url,
    siteName: "Infinite Scroll",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Infinite Scroll — Terminal Workspace for macOS",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Infinite Scroll",
    description:
      "A terminal workspace that never forgets. Split, stack, and persist your sessions.",
    images: ["/og.png"],
  },
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
