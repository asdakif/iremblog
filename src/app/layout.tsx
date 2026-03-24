import type { Metadata } from "next";
import "./globals.css";
import PWARegister from "@/components/public/PWARegister";
import PushPrompt from "@/components/public/PushPrompt";
import { cookies } from "next/headers";
import { normalizeLocale } from "@/lib/i18n";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

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
  alternates: {
    canonical: "/",
    languages: {
      en: `${siteUrl}/?lang=en`,
      tr: `${siteUrl}/?lang=tr`,
    },
  },
  manifest: "/manifest.json",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const locale = normalizeLocale(cookieStore.get("lang")?.value);
  return (
    <html lang={locale} suppressHydrationWarning>
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
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-3 focus:py-2 focus:rounded-lg focus:bg-ink-600 focus:text-white"
        >
          Skip to content
        </a>
        <div id="main-content">{children}</div>
        <PWARegister />
        <PushPrompt />
      </body>
    </html>
  );
}
