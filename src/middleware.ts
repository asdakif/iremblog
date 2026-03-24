import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_LOCALE, normalizeLocale } from "@/lib/i18n";

export function middleware(req: NextRequest) {
  const response = NextResponse.next();
  const currentLocale = req.cookies.get("lang")?.value;
  const url = req.nextUrl;
  const langParam = url.searchParams.get("lang");

  if (langParam) {
    const locale = normalizeLocale(langParam);
    url.searchParams.delete("lang");
    const redirect = NextResponse.redirect(url);
    redirect.cookies.set("lang", locale, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
    return redirect;
  }

  if (!currentLocale) {
    response.cookies.set("lang", DEFAULT_LOCALE, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico|manifest.json|sw.js).*)"],
};
