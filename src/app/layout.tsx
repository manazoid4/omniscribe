import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OmniScribe — Translate & Stylize Any Video",
  description:
    "Upload any video in any language. Get subtitles, dubbed audio, and artistic style transfers in 15+ languages — powered by AI.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
