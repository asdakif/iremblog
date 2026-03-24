import type { Metadata } from "next";
import "./globals.css";
import PWARegister from "@/components/public/PWARegister";
import PushPrompt from "@/components/public/PushPrompt";

export const metadata: Metadata = {
  title: {
    default: "Irem Blog — Stories Worth Reading",
    template: "%s | Irem Blog",
  },
  description:
    "A warm, literary space for stories about life, love, and the things that matter most.",
  keywords: ["blog", "stories", "fiction", "memoir", "literature"],
  openGraph: {
    type: "website",
    siteName: "Irem Blog",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Lora:ital,wght@0,400;0,500;0,600;1,400;1,500&display=swap"
          rel="stylesheet"
        />
        <meta name="theme-color" content="#b87333" />
      </head>
      <body className="antialiased">
        {children}
        <PWARegister />
        <PushPrompt />
      </body>
    </html>
  );
}
