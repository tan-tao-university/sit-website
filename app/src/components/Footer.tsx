"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Facebook01Icon,
  Mail01Icon,
  Call02Icon,
  Location01Icon,
  ArrowRight02Icon,
} from "@hugeicons/core-free-icons";
import { motion } from "framer-motion";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { api, Program } from "@/lib/api";

import { ArrowIcon } from "@/components/icons/ArrowIcon";

const Footer = () => {
  const t = useTranslations("header");
  const tFooter = useTranslations("footer");
  const pathname = usePathname();
  const currentLocale = pathname.split("/")[1] || "vi";

  const [programs, setPrograms] = useState<Program[]>([]);

  useEffect(() => {
    api.programs
      .findAll({ status: "active" })
      .then(setPrograms)
      .catch((error) => console.error("Failed to fetch footer data", error));
  }, []);

  const quickLinkHrefs: Record<number, { vi: string; en: string }> = {
    0: { vi: `/${currentLocale}/gioi-thieu-chung`, en: `/${currentLocale}/about-us` },
    1: { vi: `/${currentLocale}/chuong-trinh-dao-tao`, en: `/${currentLocale}/programs` },
    2: { vi: `/${currentLocale}/sinh-vien`, en: `/${currentLocale}/students` },
    3: { vi: `/${currentLocale}/nghien-cuu`, en: `/${currentLocale}/research` },
    4: { vi: `/${currentLocale}/sinh-vien`, en: `/${currentLocale}/students` },
    5: { vi: `/${currentLocale}/lien-he`, en: `/${currentLocale}/contact` },
    6: { vi: `/${currentLocale}/hoi-dap`, en: `/${currentLocale}/faq` },
  };

  const programHref = (program: Program) =>
    currentLocale === "vi"
      ? `/${currentLocale}/chuong-trinh-dao-tao/${
          program.level === "undergraduate" ? "dai-hoc" : "sau-dai-hoc"
        }/${program.slugVi}`
      : `/${currentLocale}/programs/${program.level}/${program.slugEn}`;

  // Reusable minimal link — hover slides an arrow in, no per-item icon (modern, uncluttered)
  const FooterLink = ({ href, label }: { href: string; label: string }) => (
    <li>
      <Link
        href={href}
        className="group inline-flex items-center gap-1.5 text-[13px] text-gray-500 transition-colors hover:text-[#BA4811]"
      >
        <span
          aria-hidden
          className="w-0 overflow-hidden text-[#BA4811] opacity-0 transition-all duration-300 group-hover:w-3 group-hover:opacity-100"
        >
          <ArrowIcon direction="right" size={16} />
        </span>
        {label}
      </Link>
    </li>
  );

  return (
    <footer className="relative overflow-hidden border-t border-[#ececec] bg-white">
      <div className="mx-auto max-w-7xl px-5 pt-14 sm:px-8">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-12 lg:gap-x-8">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="col-span-2 flex flex-col gap-5 lg:col-span-4"
          >
            <Link
              href={`/${currentLocale}`}
              className="group flex items-center gap-3"
            >
              <img
                src="/assets/logo.png"
                alt="SIT"
                className="h-14 w-14 shrink-0 object-contain transition-transform duration-300 group-hover:scale-105"
              />
              <div className="flex flex-col">
                <span className="text-[13px] font-bold uppercase tracking-wider text-[#BA4811]">
                  {t("university")}
                </span>
                <span className="my-1 h-px w-full bg-[#BA4811]/40" />
                <span className="text-[15px] font-bold uppercase tracking-wide text-[#BA4811]">
                  {t("faculty")}
                </span>
              </div>
            </Link>

            <p className="max-w-xs text-[13px] leading-relaxed text-gray-500">
              {t("slogan")}, {tFooter("mission")}
            </p>

            <div className="flex gap-3">
              <Link
                href="https://www.facebook.com/sit.ttu.edu.vn"
                target="_blank"
                aria-label="Facebook"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#ececec] text-gray-500 transition-colors hover:border-[#BA4811] hover:bg-[#BA4811] hover:text-white"
              >
                <HugeiconsIcon icon={Facebook01Icon} size={17} />
              </Link>
              <Link
                href="https://mail.google.com/mail/?view=cm&fs=1&to=sit@ttu.edu.vn"
                target="_blank"
                aria-label="Email"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#ececec] text-gray-500 transition-colors hover:border-[#BA4811] hover:bg-[#BA4811] hover:text-white"
              >
                <HugeiconsIcon icon={Mail01Icon} size={17} />
              </Link>
            </div>
          </motion.div>

          {/* Quick links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="col-span-1 lg:col-span-2"
          >
            <h4 className="mb-5 text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-900">
              {tFooter("quickLinks")}
            </h4>
            <ul className="space-y-3">
              {tFooter.raw("links").map((name: string, index: number) => (
                <FooterLink
                  key={index}
                  href={quickLinkHrefs[index]?.[currentLocale as "vi" | "en"] || "#"}
                  label={name}
                />
              ))}
            </ul>
          </motion.div>

          {/* Programs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="col-span-1 lg:col-span-3"
          >
            <h4 className="mb-5 text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-900">
              {tFooter("academicPrograms")}
            </h4>
            <ul className="space-y-3">
              {programs.map((program) => (
                <FooterLink
                  key={program.programId}
                  href={programHref(program)}
                  label={
                    currentLocale === "vi"
                      ? program.nameVi
                      : program.nameEn || program.nameVi
                  }
                />
              ))}
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="col-span-2 lg:col-span-3"
          >
            <h4 className="mb-5 text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-900">
              {tFooter("contact")}
            </h4>
            <div className="space-y-3.5">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(tFooter("address"))}`}
                target="_blank"
                className="group flex items-start gap-3 text-[13px] leading-relaxed text-gray-500 transition-colors hover:text-[#BA4811]"
              >
                <HugeiconsIcon
                  icon={Location01Icon}
                  size={17}
                  className="mt-0.5 shrink-0 text-[#BA4811]"
                />
                {tFooter("address")}
              </a>
              <a
                href={`tel:${tFooter("phone")}`}
                className="group flex items-center gap-3 text-[13px] text-gray-500 transition-colors hover:text-[#BA4811]"
              >
                <HugeiconsIcon
                  icon={Call02Icon}
                  size={17}
                  className="shrink-0 text-[#BA4811]"
                />
                {tFooter("phone")}
              </a>
              <a
                href={`mailto:${tFooter("email")}`}
                className="group flex items-center gap-3 text-[13px] text-gray-500 transition-colors hover:text-[#BA4811]"
              >
                <HugeiconsIcon
                  icon={Mail01Icon}
                  size={17}
                  className="shrink-0 text-[#BA4811]"
                />
                {tFooter("email")}
              </a>
            </div>
          </motion.div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-[#ececec] py-6 sm:flex-row">
          <p className="text-[12px] text-gray-400">{tFooter("copyright")}</p>
          <Link
            href={
              currentLocale === "vi"
                ? `/${currentLocale}/chuong-trinh-dao-tao`
                : `/${currentLocale}/programs`
            }
            className="group inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#BA4811]"
          >
            {tFooter("academicPrograms")}
            <HugeiconsIcon
              icon={ArrowRight02Icon}
              size={14}
              className="transition-transform duration-300 group-hover:translate-x-0.5"
            />
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
