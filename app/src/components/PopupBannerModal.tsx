"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { api, type PopupBanner } from "@/lib/api";

const DISMISSED_BANNER_KEY = "sit-dismissed-popup-banner";
// ponytail: sessionStorage so a closed banner stays closed only for the current tab session

export default function PopupBannerModal() {
  const pathname = usePathname();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [banner, setBanner] = useState<PopupBanner | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    let active = true;

    api.popupBanners
      .findActive()
      .then((result) => {
        if (!active || !result) return;

        try {
          if (sessionStorage.getItem(DISMISSED_BANNER_KEY) === result.id) {
            return;
          }
        } catch {
          // Continue showing the banner when browser storage is unavailable.
        }

        setBanner(result);
        setIsOpen(true);
      })
      .catch((error) => {
        console.error("Unable to load popup banner", error);
      });

    return () => {
      active = false;
    };
  }, []);

  const dismissBanner = useCallback(() => {
    if (banner) {
      try {
        sessionStorage.setItem(DISMISSED_BANNER_KEY, banner.id);
      } catch {
        // Closing the modal must still work when browser storage is unavailable.
      }
    }

    setIsOpen(false);
  }, [banner]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismissBanner();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [dismissBanner, isOpen]);

  if (!banner || !isOpen) return null;

  const isEnglish = pathname.startsWith("/en");
  const title = (isEnglish ? banner.titleEn : banner.titleVi) || banner.titleVi;
  const imageAlt = (isEnglish ? banner.imageAltEn : banner.imageAltVi) || title;
  const openInNewTab = banner.openInNewTab;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#171b25]/55 px-4 py-6 backdrop-blur-[2px] sm:px-8"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) dismissBanner();
      }}
    >
      <div className="relative w-full max-w-3xl shadow-[0_22px_70px_rgba(15,23,42,0.3)]">
        <button
          ref={closeButtonRef}
          type="button"
          onClick={dismissBanner}
          className="absolute right-2 top-2 z-10 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-[#171b25]/90 text-white shadow-[0_8px_24px_rgba(15,23,42,0.28)] backdrop-blur-md transition-all duration-200 hover:scale-105 hover:bg-[#ba4811] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#171b25] sm:-right-4 sm:-top-4"
          aria-label={isEnglish ? "Close banner" : "Đóng banner"}
        >
          <X className="h-5 w-5" strokeWidth={2} />
        </button>

        <a
          href={banner.linkUrl}
          target={openInNewTab ? "_blank" : undefined}
          rel={openInNewTab ? "noopener noreferrer" : undefined}
          onClick={dismissBanner}
          className="group block cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#c84b12]"
          aria-label={`${title}. ${
            openInNewTab
              ? isEnglish
                ? "Opens in a new tab"
                : "Mở trong tab mới"
              : isEnglish
                ? "View details"
                : "Xem chi tiết"
          }`}
        >
          <img
            src={banner.imageUrl}
            alt={imageAlt}
            className="block h-auto max-h-[68dvh] w-full object-contain transition-opacity duration-200 group-hover:opacity-95"
          />
        </a>
      </div>
    </div>
  );
}
