import type { Metadata } from "next";
import { Fraunces, Geist, Geist_Mono } from "next/font/google";
import type { CSSProperties } from "react";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { themeConfig } from "@/lib/customization";
import { siteConfig } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const themeVariables = {
  "--background": themeConfig.colors.background,
  "--foreground": themeConfig.colors.foreground,
  "--ink": themeConfig.colors.ink,
  "--muted": themeConfig.colors.muted,
  "--line": themeConfig.colors.line,
  "--paper": themeConfig.colors.paper,
  "--paper-warm": themeConfig.colors.paperWarm,
  "--blue": themeConfig.colors.blue,
  "--lavender": themeConfig.colors.lavender,
  "--sage": themeConfig.colors.sage,
  "--mint": themeConfig.colors.mint,
  "--clay": themeConfig.colors.clay,
} as CSSProperties;

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} | Handmade Resin Artist Discovery`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
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
      style={themeVariables}
    >
      <body className="flex min-h-full flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
