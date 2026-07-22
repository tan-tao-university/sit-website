import createMiddleware from "next-intl/middleware";

export default createMiddleware({
  // A list of all locales that are supported
  locales: ["vi", "en"],

  // Used when no locale matches
  defaultLocale: "vi",

  // Keep Vietnamese as the public default regardless of browser language.
  // English remains available only through an explicit /en URL.
  localeDetection: false,
});

export const config = {
  // Match only internationalized pathnames
  matcher: ["/", "/(vi|en)/:path*"],
};
