import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Branded display font (editorial serif) — the ONE display face carried across
// landing, quiz, and the share card (the card loads the same .woff in Satori).
const fraunces = localFont({
  src: [
    { path: "../fonts/fraunces-600.woff", weight: "600", style: "normal" },
    { path: "../fonts/fraunces-900.woff", weight: "900", style: "normal" },
  ],
  variable: "--font-fraunces",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Vibe Check — Which footballer matches your vibe?",
  description:
    "A 7-tap quiz reads your vibe and matches you to a footballer's style. Free, shareable.",
  // §23.F (PWA-light) — installable, iOS standalone home-screen app.
  applicationName: "Vibe Check",
  appleWebApp: { capable: true, title: "Vibe Check", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  themeColor: "#08090d",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
