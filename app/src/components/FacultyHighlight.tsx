"use client";

import { motion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import { useEffect, useState } from "react";
import { api, type Faculty } from "@/lib/api";
import Link from "next/link";
import SectionTab from "@/components/SectionTab";

import { ArrowIcon } from "@/components/icons/ArrowIcon";

const FacultyHighlight = () => {
  const t = useTranslations("header");
  const locale = useLocale();
  const [faculty, setFaculty] = useState<Faculty[]>([]);

  useEffect(() => {
    async function fetchFaculty() {
      try {
        const data = await api.faculty.findAll();
        setFaculty(
          data
            .filter(
              // ponytail: skip placeholder records — a card needs a face or a quote to be worth showing
              (f) =>
                f.isActive !== false && (f.avatarUrl || f.quote || f.bioShort),
            )
            .slice(0, 6),
        );
      } catch (error) {
        console.error("Failed to fetch faculty", error);
      }
    }
    fetchFaculty();
  }, []);

  // ponytail: no i18n fallback list exists for faculty — hide section when API is empty
  if (faculty.length === 0) return null;

  const facultyHref =
    locale === "vi" ? `/${locale}/giang-vien` : `/${locale}/faculty`;

  return (
    <section className="relative bg-[#f7f4f1] py-14 sm:py-16">
      <SectionTab label={t("navigation.faculty")} />
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        {/* Editorial header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-10 flex items-end justify-between border-b border-[#dedad5] pb-6"
        >
          <h2 className="max-w-xl text-[1.6rem] font-bold leading-tight tracking-tight text-gray-900 sm:text-[1.9rem]">
            {t("navigation.faculty")}
          </h2>
          <Link
            href={facultyHref}
            className="text-[12px] font-semibold text-[#BA4811] underline decoration-[#BA4811]/50 underline-offset-4 transition-colors hover:text-[#9c3c0e]"
          >
            {t("navigation.faculty")} <ArrowIcon direction="right" size={16} />
          </Link>
        </motion.div>

        {/* Stable vertical directory: new faculty members fill the next grid cell. */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {faculty.map((person, index) => (
            <motion.div
              key={person.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: (index % 3) * 0.1 }}
              viewport={{ once: true }}
              className="h-full"
            >
              <Link
                href={`${facultyHref}/${person.slug}`}
                className="group flex h-full flex-col overflow-hidden border border-[#dedad5] bg-white transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[8px_8px_0_#eadfd6]"
              >
                <div className="relative aspect-[4/5] overflow-hidden border-b border-[#dedad5] bg-[#eee8e2]">
                  {person.avatarUrl ? (
                    <img
                      src={person.avatarUrl}
                      alt={person.fullName}
                      loading="lazy"
                      className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-5xl font-bold text-[#BA4811]">
                      {person.fullName.charAt(0)}
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="text-[15px] font-bold leading-snug tracking-tight text-gray-900 transition-colors duration-300 group-hover:text-[#BA4811]">
                        {person.academicTitle
                          ? `${person.academicTitle} ${person.fullName}`
                          : person.fullName}
                      </h3>
                      <div className="mt-1 text-[10px] font-medium uppercase tracking-[0.14em] text-[#BA4811]">
                        {person.position || person.department}
                      </div>
                    </div>
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-[#BA4811]/50 text-[#BA4811] transition-colors group-hover:bg-[#BA4811] group-hover:text-white">
                      <ArrowIcon direction="up-right" size={16} />
                    </span>
                  </div>

                  {(person.quote || person.bioShort) && (
                    <p className="mt-5 line-clamp-2 border-l border-[#BA4811]/35 pl-3 text-[12px] leading-5 text-gray-500">
                      “{(person.quote || person.bioShort || "").slice(0, 120)}
                      {(person.quote || person.bioShort || "").length > 120 &&
                        "..."}
                      ”
                    </p>
                  )}

                  <span className="mt-auto pt-6 text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-400 transition-colors group-hover:text-[#BA4811]">
                    {locale === "vi" ? "Hồ sơ giảng viên" : "Faculty profile"}
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FacultyHighlight;
