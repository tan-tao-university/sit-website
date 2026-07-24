"use client";

import { Menu, Search, X, ChevronRight, ArrowRight } from "lucide-react";
import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { api, Program, Curriculum } from "@/lib/api";
import { ModalSearchGlobal } from "./ModalSearchGlobal";
import { cn } from "@/utils/cn";

const Header = () => {
  const t = useTranslations("header");
  const tPrograms = useTranslations("programs");
  const pathname = usePathname();
  const localeSegments = pathname.split("/").filter(Boolean);
  const localeCandidate = localeSegments[0];
  const locale =
    localeCandidate === "vi" || localeCandidate === "en"
      ? localeCandidate
      : "vi";
  const basePath = `/${locale}`;

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [activeProgramCategory, setActiveProgramCategory] = useState<
    string | null
  >(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const currentPageName = useMemo(() => {
    if (pathname.includes("/gioi-thieu") || pathname.includes("/about"))
      return t("navigation.about");
    if (pathname.includes("/tin-tuc") || pathname.includes("/news"))
      return t("navigation.news");
    if (pathname.includes("/chuong-trinh") || pathname.includes("/programs"))
      return t("navigation.programs");
    if (pathname.includes("/nghien-cuu") || pathname.includes("/research"))
      return t("navigation.research");
    if (pathname.includes("/sinh-vien") || pathname.includes("/students"))
      return t("navigation.students");
    if (pathname.includes("/giang-vien") || pathname.includes("/faculty"))
      return t("navigation.faculty");
    return "";
  }, [pathname, t]);

  const [programs, setPrograms] = useState<Program[]>([]);
  const [curriculums, setCurriculums] = useState<Curriculum[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [programsData, curriculumsData] = await Promise.all([
          api.programs.findAll({ status: "active" }),
          api.curriculums.findAll(),
        ]);
        setPrograms(programsData);
        setCurriculums(curriculumsData);
      } catch (error) {
        console.error("Failed to fetch menu data", error);
      }
    };
    fetchData();
  }, []);

  const resetMenuFlow = useCallback(() => {
    setActiveSection(null);
    setActiveProgramCategory(null);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    resetMenuFlow();
  }, [pathname, resetMenuFlow]);

  // --- Grouping Logic ---
  const programSections = useMemo(() => {
    const levels = [
      { id: "undergraduate", title: tPrograms("undergraduate") },
      { id: "postgraduate", title: tPrograms("graduate") },
    ];

    return levels
      .map((level) => {
        const levelPrograms = programs.filter((p) => p.level === level.id);

        if (levelPrograms.length === 0) return null;

        const groups = levelPrograms.map((program) => {
          const programCurriculums = curriculums.filter(
            (c) => c.programId === program.programId,
          );

          return {
            id: program.programId,
            title:
              locale === "vi"
                ? program.nameVi
                : program.nameEn || program.nameVi,
            href:
              locale === "vi"
                ? `${basePath}/chuong-trinh-dao-tao/${
                    program.level === "undergraduate"
                      ? "dai-hoc"
                      : "sau-dai-hoc"
                  }/${program.slugVi}`
                : `${basePath}/programs/${program.level}/${program.slugEn}`,
            items: programCurriculums.map((curriculum) => ({
              id: curriculum.curriculumId,
              programId: curriculum.programId,
              title:
                locale === "vi"
                  ? curriculum.nameVi
                  : curriculum.nameEn || curriculum.nameVi,
              href:
                locale === "vi"
                  ? `${basePath}/chuong-trinh-dao-tao/${
                      program.level === "undergraduate"
                        ? "dai-hoc"
                        : "sau-dai-hoc"
                    }/${program.slugVi}/${curriculum.slugVi}`
                  : `${basePath}/programs/${program.level}/${program.slugEn}/${curriculum.slugEn}`,
            })),
          };
        });
        return {
          id: level.id,
          title: level.title,
          href:
            locale === "vi"
              ? `${basePath}/chuong-trinh-dao-tao/${
                  level.id === "undergraduate" ? "dai-hoc" : "sau-dai-hoc"
                }`
              : `${basePath}/programs/${level.id}`,
          groups,
        };
      })
      .filter(
        (section): section is NonNullable<typeof section> => section !== null,
      );
  }, [programs, curriculums, locale, basePath, tPrograms]);

  const menuSections = useMemo(
    () => [
      { id: "explore", title: t("exploreSit") },
      { id: "programs", title: t("navigation.programs") },
      { id: "students", title: t("navigation.students") },
      { id: "research", title: t("navigation.research") },
    ],
    [t],
  );

  const toggleMenu = () =>
    setIsMenuOpen((prev) => {
      const next = !prev;
      if (!next) {
        resetMenuFlow();
      }
      return next;
    });

  const closeMenu = () => {
    setIsMenuOpen(false);
    resetMenuFlow();
  };

  const overlayQuickLinks = useMemo(
    () => [
      {
        label: t("navigation.about"),
        href:
          locale === "vi"
            ? `${basePath}/gioi-thieu-chung`
            : `${basePath}/about-us`,
      },
      {
        label: t("navigation.news"),
        href: locale === "vi" ? `${basePath}/tin-tuc` : `${basePath}/news`,
      },
      {
        label: t("navigation.programs"),
        href:
          locale === "vi"
            ? `${basePath}/chuong-trinh-dao-tao`
            : `${basePath}/programs`,
      },
      {
        label: t("navigation.research"),
        href:
          locale === "vi" ? `${basePath}/nghien-cuu` : `${basePath}/research`,
      },
      {
        label: t("navigation.students"),
        href:
          locale === "vi" ? `${basePath}/sinh-vien` : `${basePath}/students`,
      },
      {
        label: t("navigation.faculty"),
        href:
          locale === "vi" ? `${basePath}/giang-vien` : `${basePath}/faculty`,
      },
    ],
    [t, locale, basePath],
  );

  const overlayResearchLinks = useMemo(
    () => [
      {
        label: t("navigation.researchOverview"),
        href:
          locale === "vi" ? `${basePath}/nghien-cuu` : `${basePath}/research`,
      },
      {
        label: t("navigation.scientificProjects"),
        href:
          locale === "vi"
            ? `${basePath}/nghien-cuu/de-tai-khoa-hoc`
            : `${basePath}/research/scientific-projects`,
      },
      {
        label: t("navigation.scientificPublications"),
        href:
          locale === "vi"
            ? `${basePath}/nghien-cuu/bai-bao-khoa-hoc`
            : `${basePath}/research/scientific-publications`,
      },
    ],
    [t, locale, basePath],
  );

  const overlayStudentLinks = useMemo(
    () => [
      {
        label: t("navigation.studentsOverview"),
        href:
          locale === "vi" ? `${basePath}/sinh-vien` : `${basePath}/students`,
      },
      {
        label: t("navigation.studentsAdmissions"),
        href: "https://tuyensinh.ttu.edu.vn/",
        external: true,
      },
      {
        label: t("navigation.studentsHandbook"),
        href:
          locale === "vi"
            ? `${basePath}/sinh-vien/so-tay`
            : `${basePath}/students/handbook`,
      },
      {
        label: t("navigation.studentsActivities"),
        href:
          locale === "vi"
            ? `${basePath}/sinh-vien/hoat-dong`
            : `${basePath}/students/activities`,
      },
      {
        label: t("navigation.studentsInternships"),
        href:
          locale === "vi"
            ? `${basePath}/sinh-vien/viec-lam`
            : `${basePath}/students/jobs`,
      },
      {
        label: t("navigation.studentsAlumni"),
        href:
          locale === "vi"
            ? `${basePath}/sinh-vien/cuu-sinh-vien`
            : `${basePath}/students/alumni`,
      },
    ],
    [t, locale, basePath],
  );

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="sticky top-0 z-50 border-b border-[#b74717]/15 bg-white/95 backdrop-blur-xl"
      >
        <div className="mx-auto grid h-[4.5rem] max-w-7xl grid-cols-[2.25rem_minmax(0,1fr)_2.25rem] items-center gap-2 px-4 sm:flex sm:h-[5.25rem] sm:gap-5 sm:px-8">
          <Link
            href={basePath}
            className="group order-2 flex min-w-0 items-center justify-self-center gap-1.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#b74717] sm:order-none sm:shrink-0 sm:justify-self-auto sm:gap-2"
          >
            <img
              src="/assets/logo.png"
              alt="SIT"
              className="h-10 w-10 shrink-0 object-contain transition-transform duration-300 group-hover:-rotate-2 sm:h-14 sm:w-12"
            />
            <div className="flex min-w-0 flex-col gap-y-0.5 whitespace-nowrap text-left">
              <span className="block text-[0.58rem] font-black uppercase leading-tight tracking-[0.05em] text-[#ba4911] min-[380px]:text-[0.66rem] sm:text-sm sm:tracking-[0.1em] xl:text-base">
                {t("university")}
              </span>
              <span className="h-px w-full bg-[#ba4911]" />
              <span className="block text-[0.56rem] font-black uppercase leading-tight tracking-[-0.01em] text-[#ba4911] min-[380px]:text-[0.62rem] sm:text-sm sm:tracking-normal xl:text-base">
                {t("faculty")}
              </span>
            </div>
          </Link>

          <nav
            aria-label={t("menu")}
            className="mx-auto hidden items-center gap-7 xl:flex"
          >
            {overlayQuickLinks.slice(0, 5).map((link) => {
              const isActive =
                pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative py-2.5 text-sm font-semibold tracking-[-0.01em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#b74717] ${
                    isActive
                      ? "text-[#b74717]"
                      : "text-[#4b4d4b] hover:text-[#b74717]"
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-1 left-1/2 h-0.5 w-10 -translate-x-1/2 bg-[#b74717]" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="contents sm:ml-auto sm:flex sm:shrink-0 sm:items-center sm:gap-2">
            <a
              href="https://tuyensinh.ttu.edu.vn/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden min-h-10 items-center bg-[#ba4911] px-4 text-[0.8rem] font-bold uppercase tracking-[0.11em] text-white transition-[background-color,transform] duration-300 hover:-translate-y-0.5 hover:bg-[#96380d] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ba4911] active:translate-y-0 md:inline-flex"
            >
              {t("navigation.studentsAdmissions")}
            </a>
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="order-3 inline-flex h-9 w-9 cursor-pointer items-center justify-center justify-self-end border border-[#171b25]/15 text-[#424640] transition-colors hover:border-[#b74717] hover:bg-[#b74717] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#b74717] sm:order-none sm:h-10 sm:w-10 sm:justify-self-auto"
              aria-label={t("search")}
            >
              <Search className="h-4 w-4 sm:h-[1.1rem] sm:w-[1.1rem]" />
            </button>
            <button
              type="button"
              onClick={toggleMenu}
              aria-expanded={isMenuOpen}
              aria-label={t("menu")}
              className="order-1 inline-flex h-9 w-9 cursor-pointer items-center justify-center justify-self-start border border-[#ba4911]/25 text-[#8d3816] transition-colors hover:border-[#ba4911] hover:bg-[#ba4911] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ba4911] sm:order-none sm:h-10 sm:w-auto sm:justify-self-auto sm:gap-2 sm:px-3"
            >
              <Menu className="h-4 w-4 sm:h-[1.1rem] sm:w-[1.1rem]" />
              <span className="hidden text-[0.8rem] font-bold uppercase tracking-[0.12em] sm:inline">
                {t("menu")}
              </span>
            </button>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 h-px bg-[#171b25]/5">
          <motion.div
            className="relative h-full origin-left bg-[#b74717]"
            style={{ scaleX }}
          >
            {currentPageName && (
              <span className="sr-only">{currentPageName}</span>
            )}
          </motion.div>
        </div>
      </motion.header>

      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-[45] bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMenu}
            />
            <motion.div
              initial={{ y: "-100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-100%" }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="fixed top-0 left-0 right-0 z-[50] h-screen overflow-hidden bg-white text-[#171b25]"
            >
              <div className="relative flex h-full flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-[#171b25]/10 px-5 py-3.5 sm:px-8">
                  <div className="flex items-center gap-2.5">
                    <img
                      src="/assets/logo.png"
                      alt="SIT"
                      className="h-11 w-11 object-contain md:h-12 md:w-12"
                    />
                    <div className="min-w-0 text-left leading-none">
                      <span className="block text-[0.7rem] font-black uppercase tracking-[0.1em] text-[#ba4911] sm:text-sm xl:text-base">
                        {t("university")}
                      </span>
                      <span className="my-0.5 block h-px w-full bg-[#ba4911]" />
                      <span className="block text-[0.7rem] font-black uppercase text-[#ba4911] sm:text-sm xl:text-base">
                        {t("faculty")}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={closeMenu}
                    className="group flex h-10 cursor-pointer items-center gap-2.5 border border-[#171b25]/15 px-3 text-[#424640] transition-colors hover:border-[#b74717] hover:bg-[#b74717] hover:text-white active:scale-[0.98]"
                    aria-label={t("close")}
                  >
                    <span className="text-xs font-bold uppercase tracking-[0.15em] sm:text-sm">
                      {t("close")}
                    </span>
                    <X className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
                  </button>
                </div>

                {/* Main Content - Responsive Layout */}
                <div className="flex flex-1 flex-col md:grid md:grid-cols-[1fr_1.2fr_1.5fr] gap-x-8 gap-y-8 px-4 md:px-8 py-4 md:py-8 overflow-y-auto">
                  {/* Column 1: Main Menu */}
                  <div className="min-w-0">
                    <div className="space-y-4 md:space-y-6">
                      {menuSections.map((section) => (
                        <motion.button
                          key={section.id}
                          onClick={() => setActiveSection(section.id)}
                          whileHover={{
                            x: 10,
                            backgroundColor: "rgba(186, 73, 17, 0.03)",
                          }}
                          whileTap={{ scale: 0.97 }}
                          className={cn(
                            "relative block w-full cursor-pointer px-4 py-3 text-left text-xl font-semibold transition-all duration-300 md:text-3xl",
                            activeSection === section.id
                              ? "text-[#ba4911] bg-[#ba4911]/5"
                              : "text-slate-800 hover:text-[#ba4911]",
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <span>{section.title}</span>
                            <ChevronRight
                              className={cn(
                                "h-6 w-6 transition-transform duration-300",
                                activeSection === section.id
                                  ? "rotate-90 text-[#ba4911]"
                                  : "text-slate-300 group-hover:text-[#ba4911]",
                              )}
                            />
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Column 2: Sub Menu */}
                  <div className="min-w-0">
                    {activeSection && (
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={activeSection}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.3 }}
                        >
                          {activeSection === "programs" && (
                            <div className="space-y-4 md:space-y-6">
                              <div className="flex items-center gap-2">
                                <h2 className="text-lg md:text-xl font-bold text-[#ba4911]">
                                  {t("navigation.programs")}
                                </h2>
                                <ChevronRight className="h-4 w-4 md:h-5 md:w-5 text-[#ba4911]" />
                              </div>
                              <p className="text-slate-500 text-xs md:text-sm leading-relaxed">
                                {t("programsDescription")}
                              </p>
                              <div className="space-y-2 md:space-y-3">
                                {programSections.map((category) => (
                                  <motion.button
                                    key={category.id}
                                    onClick={() =>
                                      setActiveProgramCategory(category.id)
                                    }
                                    whileHover={{
                                      x: 8,
                                      backgroundColor:
                                        "rgba(186, 73, 17, 0.05)",
                                    }}
                                    whileTap={{ scale: 0.98 }}
                                    className={cn(
                                      "relative block w-full cursor-pointer px-4 py-3 text-left text-lg font-bold transition-all duration-300 whitespace-normal",
                                      activeProgramCategory === category.id
                                        ? "text-[#ba4911] bg-[#ba4911]/10 shadow-sm"
                                        : "text-slate-700 hover:text-[#ba4911]",
                                    )}
                                  >
                                    <div className="flex items-center justify-between">
                                      <span>{category.title}</span>
                                      <div
                                        className={cn(
                                          "flex h-8 w-8 items-center justify-center transition-colors",
                                          activeProgramCategory === category.id
                                            ? "bg-[#ba4911] text-white"
                                            : "bg-slate-100 text-slate-400 group-hover:bg-[#ba4911]/20 group-hover:text-[#ba4911]",
                                        )}
                                      >
                                        <ChevronRight className="h-4 w-4" />
                                      </div>
                                    </div>
                                  </motion.button>
                                ))}
                              </div>
                            </div>
                          )}

                          {activeSection === "students" && (
                            <div className="space-y-4 md:space-y-6">
                              <div className="flex items-center gap-2">
                                <h2 className="text-lg md:text-xl font-bold text-[#ba4911]">
                                  {t("navigation.students")}
                                </h2>
                                <ChevronRight className="h-4 w-4 md:h-5 md:w-5 text-[#ba4911]" />
                              </div>
                              <p className="text-slate-500 text-xs md:text-sm leading-relaxed">
                                {t("studentsDescription")}
                              </p>
                              <div className="space-y-2 md:space-y-3">
                                {overlayStudentLinks.map((link) => (
                                  <div
                                    key={link.href}
                                    className="relative group"
                                  >
                                    {link.external ? (
                                      <a
                                        href={link.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block text-slate-700 hover:text-[#ba4911] transition-colors font-medium pb-1 whitespace-normal break-normal"
                                        onClick={closeMenu}
                                      >
                                        {link.label}
                                        <motion.div
                                          className="absolute bottom-0 left-0 h-0.5 bg-[#ba4911]"
                                          initial={{ width: 0 }}
                                          whileHover={{ width: "100%" }}
                                          transition={{
                                            duration: 0.3,
                                            ease: "easeInOut",
                                          }}
                                        />
                                      </a>
                                    ) : (
                                      <Link
                                        href={link.href}
                                        className="block text-slate-700 hover:text-[#ba4911] transition-colors font-medium pb-1 whitespace-normal break-normal"
                                        onClick={closeMenu}
                                      >
                                        {link.label}
                                        <motion.div
                                          className="absolute bottom-0 left-0 h-0.5 bg-[#ba4911]"
                                          initial={{ width: 0 }}
                                          whileHover={{ width: "100%" }}
                                          transition={{
                                            duration: 0.3,
                                            ease: "easeInOut",
                                          }}
                                        />
                                      </Link>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {activeSection === "research" && (
                            <div className="space-y-4 md:space-y-6">
                              <div className="flex items-center gap-2">
                                <h2 className="text-lg md:text-xl font-bold text-[#ba4911]">
                                  {t("navigation.research")}
                                </h2>
                                <ChevronRight className="h-4 w-4 md:h-5 md:w-5 text-[#ba4911]" />
                              </div>
                              <p className="text-slate-500 text-xs md:text-sm leading-relaxed">
                                {t("researchDescription")}
                              </p>
                              <div className="space-y-2 md:space-y-3">
                                {overlayResearchLinks.map((link) => (
                                  <div
                                    key={link.href}
                                    className="relative group"
                                  >
                                    <Link
                                      href={link.href}
                                      className="block text-slate-800 hover:text-[#ba4911] transition-colors pb-1 whitespace-normal break-normal"
                                      onClick={closeMenu}
                                    >
                                      {link.label}
                                      <motion.div
                                        className="absolute bottom-0 left-0 h-0.5 bg-[#ba4911]"
                                        initial={{ width: 0 }}
                                        whileHover={{ width: "100%" }}
                                        transition={{
                                          duration: 0.3,
                                          ease: "easeInOut",
                                        }}
                                      />
                                    </Link>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {activeSection === "explore" && (
                            <div className="space-y-4 md:space-y-6">
                              <div className="flex items-center gap-2">
                                <h2 className="text-lg md:text-xl font-bold text-[#ba4911]">
                                  {t("exploreSit")}
                                </h2>
                                <ChevronRight className="h-4 w-4 md:h-5 md:w-5 text-[#ba4911]" />
                              </div>
                              <p className="text-slate-500 text-xs md:text-sm leading-relaxed">
                                {t("exploreDescription")}
                              </p>
                              <div className="space-y-2 md:space-y-3">
                                {overlayQuickLinks.map((link) => (
                                  <div
                                    key={link.href}
                                    className="relative group"
                                  >
                                    <Link
                                      href={link.href}
                                      className="block text-slate-800 hover:text-[#ba4911] transition-colors pb-1 whitespace-normal break-normal"
                                      onClick={closeMenu}
                                    >
                                      {link.label}
                                      <motion.div
                                        className="absolute bottom-0 left-0 h-0.5 bg-[#ba4911]"
                                        initial={{ width: 0 }}
                                        whileHover={{ width: "100%" }}
                                        transition={{
                                          duration: 0.3,
                                          ease: "easeInOut",
                                        }}
                                      />
                                    </Link>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </motion.div>
                      </AnimatePresence>
                    )}
                  </div>

                  {/* Column 3: Sub-Sub Menu */}
                  <div className="min-w-0">
                    {activeSection === "programs" && activeProgramCategory && (
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={activeProgramCategory}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.3 }}
                        >
                          {programSections
                            .filter(
                              (category) =>
                                category.id === activeProgramCategory,
                            )
                            .map((category) => (
                              <div
                                key={category.id}
                                className="space-y-4 md:space-y-6"
                              >
                                <h2 className="text-lg md:text-xl font-bold text-[#ba4911]">
                                  {category.title}
                                </h2>
                                <p className="text-slate-500 text-xs md:text-sm leading-relaxed">
                                  {t("programsBrowseDescription")}
                                </p>
                                <div className="space-y-3 md:space-y-4">
                                  {category.groups.map((group) => (
                                    <div key={group.id} className="space-y-2">
                                      <motion.div
                                        whileHover={{
                                          x: 6,
                                          backgroundColor:
                                            "rgba(186, 73, 17, 0.05)",
                                        }}
                                        whileTap={{ scale: 0.98 }}
                                        className="transition-all duration-200"
                                      >
                                        <Link
                                          href={group.href}
                                          className="flex items-center justify-between p-3 text-slate-800 font-bold hover:text-[#ba4911] transition-colors text-base whitespace-normal break-normal"
                                          onClick={closeMenu}
                                        >
                                          <span>{group.title}</span>
                                          <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </Link>
                                      </motion.div>
                                      <ul className="space-y-1">
                                        {group.items.map((item) => (
                                          <li
                                            key={`${group.id}-${item.id}`}
                                            className="relative group"
                                          >
                                            <motion.div
                                              whileHover={{
                                                x: 4,
                                                backgroundColor:
                                                  "rgba(0, 0, 0, 0.02)",
                                              }}
                                              whileTap={{ scale: 0.98 }}
                                            >
                                              <Link
                                                href={item.href}
                                                className="flex items-center gap-3 px-3 py-1.5 text-slate-600 hover:text-[#ba4911] transition-colors text-sm font-medium whitespace-normal break-normal"
                                                onClick={closeMenu}
                                              >
                                                <div className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-[#ba4911] transition-colors" />
                                                {item.title}
                                              </Link>
                                            </motion.div>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                        </motion.div>
                      </AnimatePresence>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t border-slate-200 px-4 md:px-8 py-4 md:py-6 flex-shrink-0">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-900 font-medium text-sm md:text-base">
                        {t("quickLinks")}
                      </span>
                      <ChevronRight className="h-4 w-4 text-slate-900" />
                    </div>
                    <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-2 text-sm">
                      <div className="relative group">
                        <Link
                          href={
                            locale === "vi"
                              ? `${basePath}/gioi-thieu-chung`
                              : `${basePath}/about-us`
                          }
                          className="text-slate-600 hover:text-[#ba4911] transition-colors pb-1 whitespace-normal break-normal"
                        >
                          {t("about")}
                          <motion.div
                            className="absolute bottom-0 left-0 h-0.5 bg-[#ba4911]"
                            initial={{ width: 0 }}
                            whileHover={{ width: "100%" }}
                            transition={{
                              duration: 0.3,
                              ease: "easeInOut",
                            }}
                          />
                        </Link>
                      </div>
                      <div className="relative group">
                        <Link
                          href={
                            locale === "vi"
                              ? `${basePath}/tin-tuc`
                              : `${basePath}/news`
                          }
                          className="text-slate-600 hover:text-[#ba4911] transition-colors pb-1 whitespace-normal break-normal"
                        >
                          {t("news")}
                          <motion.div
                            className="absolute bottom-0 left-0 h-0.5 bg-[#ba4911]"
                            initial={{ width: 0 }}
                            whileHover={{ width: "100%" }}
                            transition={{
                              duration: 0.3,
                              ease: "easeInOut",
                            }}
                          />
                        </Link>
                      </div>
                      <div className="relative group">
                        <Link
                          href={
                            locale === "vi"
                              ? `${basePath}/nghien-cuu`
                              : `${basePath}/research`
                          }
                          className="text-slate-600 hover:text-[#ba4911] transition-colors pb-1 whitespace-normal break-normal"
                        >
                          {t("research")}
                          <motion.div
                            className="absolute bottom-0 left-0 h-0.5 bg-[#ba4911]"
                            initial={{ width: 0 }}
                            whileHover={{ width: "100%" }}
                            transition={{
                              duration: 0.3,
                              ease: "easeInOut",
                            }}
                          />
                        </Link>
                      </div>
                      <div className="relative group">
                        <Link
                          href={
                            locale === "vi"
                              ? `${basePath}/sinh-vien`
                              : `${basePath}/students`
                          }
                          className="text-slate-600 hover:text-[#ba4911] transition-colors pb-1 whitespace-normal break-normal"
                        >
                          {t("students")}
                          <motion.div
                            className="absolute bottom-0 left-0 h-0.5 bg-[#ba4911]"
                            initial={{ width: 0 }}
                            whileHover={{ width: "100%" }}
                            transition={{
                              duration: 0.3,
                              ease: "easeInOut",
                            }}
                          />
                        </Link>
                      </div>
                      <div className="relative group">
                        <Link
                          href={
                            locale === "vi"
                              ? `${basePath}/lien-he`
                              : `${basePath}/contact`
                          }
                          className="text-slate-600 hover:text-[#ba4911] transition-colors pb-1 whitespace-normal break-normal"
                        >
                          {t("contactLink")}
                          <motion.div
                            className="absolute bottom-0 left-0 h-0.5 bg-[#ba4911]"
                            initial={{ width: 0 }}
                            whileHover={{ width: "100%" }}
                            transition={{
                              duration: 0.3,
                              ease: "easeInOut",
                            }}
                          />
                        </Link>
                      </div>
                      <div className="relative group">
                        <Link
                          href={
                            locale === "vi"
                              ? `${basePath}/hoi-dap`
                              : `${basePath}/faq`
                          }
                          className="text-slate-600 hover:text-[#ba4911] transition-colors pb-1 whitespace-normal break-normal"
                        >
                          {t("faqLink")}
                          <motion.div
                            className="absolute bottom-0 left-0 h-0.5 bg-[#ba4911]"
                            initial={{ width: 0 }}
                            whileHover={{ width: "100%" }}
                            transition={{
                              duration: 0.3,
                              ease: "easeInOut",
                            }}
                          />
                        </Link>
                      </div>
                      <div className="relative group">
                        <button
                          onClick={() =>
                            window.open(
                              "https://www.facebook.com/sit.ttu.edu.vn",
                              "_blank",
                              "noopener,noreferrer",
                            )
                          }
                          className="text-slate-600 hover:text-[#ba4911] transition-colors pb-1 whitespace-normal break-normal"
                        >
                          {t("messengerLink")}
                          <motion.div
                            className="absolute bottom-0 left-0 h-0.5 bg-[#ba4911]"
                            initial={{ width: 0 }}
                            whileHover={{ width: "100%" }}
                            transition={{
                              duration: 0.3,
                              ease: "easeInOut",
                            }}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ModalSearchGlobal open={isSearchOpen} onOpenChange={setIsSearchOpen} />
    </>
  );
};

export default Header;
