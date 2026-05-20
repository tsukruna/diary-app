import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// ✅ ここ重要（manifest追加）
export const metadata: Metadata = {
  title: "自己改善日記",
  description: "AI付き自己改善アプリ",
  manifest: "/manifest.json",
  icons: {
    apple: "/icon.png",
    icon: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <head>
        {/* ✅ iPhone完全アプリ化に必要 */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="自己改善日記" />

        {/* ✅ アイコン */}
        <link rel="apple-touch-icon" href="/icon.png" />
      </head>

      <body className="min-h-screen">
        {children}
      </body>
    </html>
  );
}