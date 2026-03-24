export type Locale = "en" | "tr";

export const DEFAULT_LOCALE: Locale = "en";

export const dictionaries = {
  en: {
    nav: {
      home: "Home",
      fiction: "Fiction",
      memoir: "Memoir",
      poetry: "Poetry",
      profile: "Profile",
      signIn: "Sign in",
      language: "Language",
      search: "Search",
      toggleDark: "Toggle dark mode",
      menu: "Menu",
    },
    home: {
      badge: "Stories that linger",
      titleTop: "Words that",
      titleAccent: "warm the soul",
      description:
        "A place for fiction, memoir, and poetry — stories that slow you down and make you feel something real.",
      startReading: "Start Reading",
      browseStories: "Browse Stories",
      featured: "Featured Stories",
      recent: "Recent Stories",
      viewAll: "View all",
      noStories: "No stories yet. Check back soon.",
    },
  },
  tr: {
    nav: {
      home: "Ana Sayfa",
      fiction: "Kurgu",
      memoir: "Anı",
      poetry: "Şiir",
      profile: "Profil",
      signIn: "Giriş yap",
      language: "Dil",
      search: "Ara",
      toggleDark: "Koyu modu değiştir",
      menu: "Menü",
    },
    home: {
      badge: "İz bırakan hikayeler",
      titleTop: "Ruhu ısıtan",
      titleAccent: "kelimeler",
      description:
        "Kurgu, anı ve şiir için sıcak bir alan — yavaşlatan ve gerçekten hissettiren hikayeler.",
      startReading: "Okumaya Başla",
      browseStories: "Hikayeleri Keşfet",
      featured: "Öne Çıkan Hikayeler",
      recent: "Son Hikayeler",
      viewAll: "Tümünü gör",
      noStories: "Henüz hikaye yok. Yakında tekrar bak.",
    },
  },
} as const;

export function normalizeLocale(value: string | undefined | null): Locale {
  return value === "tr" ? "tr" : DEFAULT_LOCALE;
}
