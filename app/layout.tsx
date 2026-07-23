import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ??
    requestHeaders.get("host") ??
    "localhost:3000";
  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");
  const metadataBase = new URL(`${protocol}://${host}`);

  return {
    metadataBase,
    title: "Klein's Duke Map · West Campus V2",
    description:
      "为 Fall 2026 课程与校园生活准备的 Duke West Campus 准确路线地图。",
    openGraph: {
      title: "Klein's Duke Map",
      description: "West Campus · V2 · 固定核验点与真实行人步道路线",
      type: "website",
      images: [
        {
          url: "/og.png",
          width: 1792,
          height: 933,
          alt: "Klein's Duke Map — West Campus V2",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Klein's Duke Map",
      description: "West Campus · V2 · 固定核验点与真实行人步道路线",
      images: ["/og.png"],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
