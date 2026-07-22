import { getRequestConfig } from "next-intl/server";

// Can be imported from a shared config
const locales = ["vi", "en"];

export default getRequestConfig(async ({ locale }) => {
  // Ensure locale is defined and valid, default to 'vi' if not
  const validLocale = locale && locales.includes(locale) ? locale : "vi";

  return {
    locale: validLocale,
    messages: (await import(`./messages/${validLocale}.json`)).default,
  };
});
