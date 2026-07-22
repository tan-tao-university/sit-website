"use client";

import * as React from "react";
import { Command } from "cmdk";
import { Loader2, Search, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { api, Program, Curriculum, News, Research } from "@/lib/api";

import { ArrowIcon } from "@/components/icons/ArrowIcon";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

interface ModalSearchGlobalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ModalSearchGlobal({
  open,
  onOpenChange,
}: ModalSearchGlobalProps) {
  const t = useTranslations("header");
  const locale = useLocale();
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const debouncedQuery = useDebounce(query, 300);
  const [loading, setLoading] = React.useState(false);
  const [results, setResults] = React.useState<{
    programs: Program[];
    curriculums: Curriculum[];
    news: News[];
    research: Research[];
  }>({ programs: [], curriculums: [], news: [], research: [] });

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [onOpenChange, open]);

  React.useEffect(() => {
    if (!debouncedQuery) {
      setResults({ programs: [], curriculums: [], news: [], research: [] });
      return;
    }

    const search = async () => {
      setLoading(true);
      try {
        const data = await api.search.query(debouncedQuery);
        setResults(data);
      } catch (error) {
        console.error("Search failed", error);
        setResults({ programs: [], curriculums: [], news: [], research: [] });
      } finally {
        setLoading(false);
      }
    };

    search();
  }, [debouncedQuery]);

  const runCommand = React.useCallback(
    (command: () => unknown) => {
      setQuery(""); // Clear search input
      onOpenChange(false);
      command();
    },
    [onOpenChange],
  );

  const hasResults =
    results.programs.length > 0 ||
    results.curriculums.length > 0 ||
    results.news.length > 0 ||
    results.research.length > 0;

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          setQuery(""); // Clear search when closing modal
        }
        onOpenChange(isOpen);
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="!top-[12vh] !translate-y-0 w-full max-w-[calc(100%-1rem)] gap-0 overflow-hidden rounded-none border border-[#d8d3ce] border-t-2 border-t-[#BA4811] bg-white p-0 shadow-[0_24px_70px_rgba(28,24,20,0.22)] sm:max-w-xl md:max-w-2xl"
      >
        <DialogTitle className="sr-only">{t("search")}</DialogTitle>
        <Command className="flex max-h-[76dvh] flex-col bg-white text-[#171b25] [&_[cmdk-group-heading]]:mb-1.5 [&_[cmdk-group-heading]]:mt-3 [&_[cmdk-group-heading]]:px-3 sm:[&_[cmdk-group-heading]]:px-4 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[9px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.15em] [&_[cmdk-group-heading]]:text-[#858b96] [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:border-t [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:border-[#ece8e4] [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-2 [&_[cmdk-group]]:px-2 [&_[cmdk-item]]:rounded-none [&_[cmdk-item]]:text-sm [&_[cmdk-item]_svg]:h-4 [&_[cmdk-item]_svg]:w-4">
          <div
            className="flex h-16 shrink-0 items-center border-b border-[#e5e1dd] bg-white px-4 sm:px-5"
            cmdk-input-wrapper=""
          >
            <Search className="mr-3 h-[18px] w-[18px] shrink-0 text-[#BA4811]" />
            <Command.Input
              className="h-full min-w-0 flex-1 rounded-none bg-transparent text-[15px] font-medium tracking-tight text-[#171b25] outline-none placeholder:font-normal placeholder:text-[#a0a5ae] disabled:cursor-not-allowed disabled:opacity-50 sm:text-base"
              placeholder={t("searchPlaceholder") || "Search anything..."}
              value={query}
              onValueChange={setQuery}
            />
            {loading && (
              <Loader2 className="mr-3 h-4 w-4 animate-spin text-[#BA4811]" />
            )}
            <kbd className="mr-3 hidden h-7 items-center border border-[#dedad5] bg-[#faf9f8] px-2 font-mono text-[9px] font-semibold text-[#7b8290] sm:inline-flex">
              ⌘ K
            </kbd>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex h-8 w-8 shrink-0 items-center justify-center border border-transparent text-[#858b96] transition-colors hover:border-[#dedad5] hover:bg-[#f7f4f1] hover:text-[#BA4811] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#BA4811]"
              aria-label={t("footerClose")}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <Command.List
            className={`overflow-y-auto overflow-x-hidden bg-white py-2 scrollbar-thin scrollbar-thumb-[#cfc7c0] scrollbar-track-transparent ${
              query ? "min-h-52 max-h-[52dvh]" : "max-h-72"
            }`}
          >
            {loading && (
              <div className="px-2 sm:px-3 py-2 space-y-3 sm:space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-3 sm:h-4 w-20 sm:w-24 bg-slate-100" />
                  <Skeleton className="h-10 sm:h-12 w-full rounded-none bg-[#f1eeeb]" />
                  <Skeleton className="h-10 sm:h-12 w-full rounded-none bg-[#f1eeeb]" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 sm:h-4 w-16 sm:w-20 bg-slate-100" />
                  <Skeleton className="h-10 sm:h-12 w-full rounded-none bg-[#f1eeeb]" />
                </div>
              </div>
            )}

            {!loading && query && !hasResults && (
              <Command.Empty className="py-4 sm:py-6 text-center text-xs sm:text-sm text-slate-500 px-4">
                {t("noResults")}
              </Command.Empty>
            )}

            {!query && (
              <>
                <div className="px-4 pb-2 pt-3 sm:px-5">
                  <p className="max-w-lg text-[12px] leading-5 text-[#7b8290]">
                    {locale === "vi"
                      ? "Tìm kiếm chương trình đào tạo, tin tức và các hoạt động nghiên cứu của SIT."
                      : "Search SIT programs, news and research activities."}
                  </p>
                </div>
                <Command.Group heading={t("quickActions")}>
                  <Command.Item
                    onSelect={() =>
                      runCommand(() =>
                        router.push(
                          locale === "vi"
                            ? `/${locale}/tin-tuc`
                            : `/${locale}/news`,
                        ),
                      )
                    }
                    className="group relative flex cursor-pointer select-none items-center border-l-2 border-transparent px-3 py-3 outline-none transition-colors aria-selected:border-[#BA4811] aria-selected:bg-[#f7f0eb] aria-selected:text-[#BA4811] data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 sm:px-4"
                  >
                    <div className="mr-3 text-slate-400 group-aria-selected:text-[#ba4911]">
                      <Search className="h-4 w-4" />
                    </div>
                    <span className="font-medium text-slate-700 group-aria-selected:text-[#ba4911]">
                      {t("searchPosts")}
                    </span>
                    <span className="ml-auto font-mono text-[11px] text-[#a0a5ae] group-aria-selected:text-[#BA4811]">
                      <ArrowIcon direction="right" size={16} />
                    </span>
                  </Command.Item>
                </Command.Group>
              </>
            )}

            {hasResults && (
              <>
                {results.programs.length > 0 && (
                  <Command.Group heading={t("academicPrograms")}>
                    {results.programs.map((program) => (
                      <Command.Item
                        key={program.programId}
                        onSelect={() =>
                          runCommand(() => {
                            if (locale === "vi" && program.slugVi) {
                              router.push(
                                `/${locale}/chuong-trinh-dao-tao/${
                                  program.level === "undergraduate"
                                    ? "dai-hoc"
                                    : "sau-dai-hoc"
                                }/${program.slugVi}`,
                              );
                            } else if (program.slugEn) {
                              router.push(
                                `/${locale}/programs/${program.level}/${program.slugEn}`,
                              );
                            }
                          })
                        }
                        value={program.nameVi + program.nameEn}
                        className="group relative flex cursor-pointer select-none items-center border-l-2 border-transparent px-3 py-3 outline-none transition-colors aria-selected:border-[#7b2d0d] aria-selected:bg-[#BA4811] aria-selected:text-white data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 sm:px-4"
                      >
                        <div className="mr-3 text-slate-500 group-aria-selected:text-white">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-graduation-cap h-5 w-5"
                          >
                            <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                            <path d="M6 12v5c3 3 9 3 12 0v-5" />
                          </svg>
                        </div>
                        <span className="font-semibold text-slate-900 group-aria-selected:text-white">
                          {locale === "vi" ? program.nameVi : program.nameEn}
                        </span>
                      </Command.Item>
                    ))}
                  </Command.Group>
                )}
                {results.curriculums.length > 0 && (
                  <Command.Group heading={t("curriculums")}>
                    {results.curriculums.map((curriculum) => (
                      <Command.Item
                        key={curriculum.curriculumId}
                        onSelect={() => runCommand(() => {})}
                        value={curriculum.nameVi + curriculum.nameEn}
                        className="group relative flex cursor-pointer select-none items-center border-l-2 border-transparent px-3 py-3 outline-none transition-colors aria-selected:border-[#7b2d0d] aria-selected:bg-[#BA4811] aria-selected:text-white data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 sm:px-4"
                      >
                        <div className="mr-3 text-slate-500 group-aria-selected:text-white">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-book-open h-5 w-5"
                          >
                            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                          </svg>
                        </div>
                        <span className="font-semibold text-slate-900 group-aria-selected:text-white">
                          {locale === "vi"
                            ? curriculum.nameVi
                            : curriculum.nameEn}
                        </span>
                      </Command.Item>
                    ))}
                  </Command.Group>
                )}
                {results.news.length > 0 && (
                  <Command.Group heading={t("news") || "News"}>
                    {results.news.map((newsItem) => (
                      <Command.Item
                        key={newsItem.id}
                        onSelect={() =>
                          runCommand(() => {
                            router.push(
                              locale === "vi"
                                ? `/${locale}/tin-tuc/${newsItem.slug}`
                                : `/${locale}/news/${newsItem.slug}`,
                            );
                          })
                        }
                        value={newsItem.title + (newsItem.summary || "")}
                        className="group relative flex cursor-pointer select-none items-start border-l-2 border-transparent px-3 py-3 outline-none transition-colors aria-selected:border-[#7b2d0d] aria-selected:bg-[#BA4811] aria-selected:text-white data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 sm:px-4"
                      >
                        <div className="mr-3 text-slate-500 group-aria-selected:text-white">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-newspaper h-5 w-5"
                          >
                            <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
                            <path d="M18 14h-8" />
                            <path d="M15 18h-5" />
                            <path d="M10 6h8v4h-8V6Z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-slate-900 group-aria-selected:text-white">
                            {newsItem.title}
                          </div>
                          {newsItem.summary && (
                            <div className="mt-1 text-xs text-slate-500 group-aria-selected:text-white/80 line-clamp-1">
                              {newsItem.summary}
                            </div>
                          )}
                        </div>
                      </Command.Item>
                    ))}
                  </Command.Group>
                )}
                {results.research.length > 0 && (
                  <Command.Group heading={t("research") || "Research"}>
                    {results.research.map((researchItem) => (
                      <Command.Item
                        key={researchItem.id}
                        onSelect={() =>
                          runCommand(() => {
                            router.push(
                              locale === "vi"
                                ? `/${locale}/nghien-cuu`
                                : `/${locale}/research`,
                            );
                          })
                        }
                        value={
                          researchItem.title +
                          (researchItem.abstract || "") +
                          (researchItem.authors || "")
                        }
                        className="group relative flex cursor-pointer select-none items-start border-l-2 border-transparent px-3 py-3 outline-none transition-colors aria-selected:border-[#7b2d0d] aria-selected:bg-[#BA4811] aria-selected:text-white data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 sm:px-4"
                      >
                        <div className="mr-3 text-slate-500 group-aria-selected:text-white">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-microscope h-5 w-5"
                          >
                            <path d="M6 18h8" />
                            <path d="M3 22h18" />
                            <path d="M14 22a7 7 0 1 0 0-14h-1" />
                            <path d="M9 14h2" />
                            <path d="M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z" />
                            <path d="M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-slate-900 group-aria-selected:text-white">
                            {researchItem.title}
                          </div>
                          {researchItem.authors && (
                            <div className="mt-1 text-xs text-slate-500 group-aria-selected:text-white/80">
                              {researchItem.authors}
                            </div>
                          )}
                          <div className="mt-1 inline-block border border-[#dedad5] bg-[#f7f4f1] px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-600 group-aria-selected:border-white/30 group-aria-selected:bg-white/10 group-aria-selected:text-white">
                            {researchItem.type === "PROJECT"
                              ? "Project"
                              : "Publication"}
                          </div>
                        </div>
                      </Command.Item>
                    ))}
                  </Command.Group>
                )}
              </>
            )}
          </Command.List>

          <div className="flex min-h-11 shrink-0 items-center justify-between gap-4 border-t border-[#dedad5] bg-[#f7f4f1] px-3 py-2 sm:px-4">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#7b8290] sm:gap-4">
              <div className="flex items-center gap-1 sm:gap-1.5">
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 border border-[#cfc7c0] bg-white px-1.5 font-mono text-[9px] font-semibold text-[#7b8290] opacity-100">
                  <span className="text-[9px] sm:text-xs"><ArrowIcon direction="up" size={10} /></span>
                </kbd>
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 border border-[#cfc7c0] bg-white px-1.5 font-mono text-[9px] font-semibold text-[#7b8290] opacity-100">
                  <span className="text-[9px] sm:text-xs"><ArrowIcon direction="down" size={10} /></span>
                </kbd>
                <span className="text-[9px] sm:text-[10px] uppercase tracking-wider font-semibold hidden sm:inline">
                  {t("footerNavigate")}
                </span>
              </div>
              <div className="flex items-center gap-1 sm:gap-1.5">
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 border border-[#cfc7c0] bg-white px-1.5 font-mono text-[9px] font-semibold text-[#7b8290] opacity-100">
                  &crarr;
                </kbd>
                <span className="text-[9px] sm:text-[10px] uppercase tracking-wider font-semibold hidden sm:inline">
                  {t("footerSelect")}
                </span>
              </div>
              <div className="flex items-center gap-1 sm:gap-1.5">
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 border border-[#cfc7c0] bg-white px-1.5 font-mono text-[9px] font-semibold text-[#7b8290] opacity-100">
                  esc
                </kbd>
                <span className="text-[9px] sm:text-[10px] uppercase tracking-wider font-semibold hidden sm:inline">
                  {t("footerClose")}
                </span>
              </div>
            </div>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
