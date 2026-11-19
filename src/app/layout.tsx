import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { themeScript } from "@/components/ThemeToggle";
import { emailBaseUrl } from "@/lib/baseurl";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "cyrillic"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(emailBaseUrl(process.env)),
  title: { default: "MediPass — QR кодтой яаралтай тусламжийн карт", template: "%s · MediPass" },
  description: "Эрүүл мэндийн яаралтай мэдээллээ бүртгэж, QR код үүсгээрэй. Та өөрөө аль мэдээллийг хэнд харуулахаа шийднэ.",
  applicationName: "MediPass",
  icons: { icon: "/icon.svg" },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: [{ media: "(prefers-color-scheme: light)", color: "#ffffff" }, { media: "(prefers-color-scheme: dark)", color: "#020617" }],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="mn" className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen font-sans">{children}</body>
    </html>
  );
}
