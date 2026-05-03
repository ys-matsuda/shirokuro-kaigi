import type { Metadata, Viewport } from "next";

import { appConfig } from "@/config/app";

import "./globals.css";

export const metadata: Metadata = {
  title: appConfig.name,
  description:
    "Discordコミュニティで、白黒つけずに感覚の分布や揺れを楽しむローカルプロトタイプ。",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#080a13",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
