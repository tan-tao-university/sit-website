"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Globe, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { translatePath, type Locale } from "@/config/routing.config";

const LanguageSwitcher = () => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("header.language");

  // Extract locale from pathname to ensure it's always correct and updates immediately
  const pathnameLocale = pathname.split("/")[1];
  const currentLocale = ((pathnameLocale === "vi" || pathnameLocale === "en") 
    ? pathnameLocale 
    : (locale || "vi")) as Locale;

  // Close dropdown when pathname changes (language switched)
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const languages = [
    { code: "vi", name: t("vi"), flag: "🇻🇳" },
    { code: "en", name: t("en"), flag: "🇺🇸" },
  ];

  const currentLanguage =
    languages.find((lang) => lang.code === currentLocale) || languages[0];

  const handleLanguageChange = (newLocale: string) => {
    // Translate the current path to the new locale
    const translatedPath = translatePath(
      pathname,
      currentLocale,
      newLocale as Locale,
    );

    router.push(translatedPath);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          variant="ghost"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 hover:bg-primary/10 transition-all duration-300"
        >
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{currentLanguage.flag}</span>
          <span className="hidden md:inline text-sm font-medium">
            {currentLanguage.name}
          </span>
          <ChevronDown
            className={`h-3 w-3 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </Button>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-2 w-48 bg-background/95 backdrop-blur-xl border border-primary/20 rounded-lg shadow-elegant z-50"
          >
            <div className="py-2">
              {languages.map((language) => (
                <motion.button
                  key={language.code}
                  onClick={() => handleLanguageChange(language.code)}
                  className={`w-full px-4 py-3 text-left hover:bg-primary/10 transition-colors duration-200 flex items-center gap-3 ${
                    currentLocale === language.code
                      ? "bg-primary/10 text-primary"
                      : "text-foreground"
                  }`}
                  whileHover={{ x: 4 }}
                >
                  <span className="text-lg">{language.flag}</span>
                  <span className="font-medium">{language.name}</span>
                  {currentLocale === language.code && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="ml-auto w-2 h-2 bg-primary rounded-full"
                    />
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageSwitcher;
