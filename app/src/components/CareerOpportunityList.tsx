"use client";

import { useMemo, useState } from "react";
import type { CareerOpportunity } from "@/lib/api";
import type { SiteLocale } from "@/lib/program-pages";
import { ArrowIcon } from "@/components/icons/ArrowIcon";

type OpportunityFilter = "all" | "internship" | "jobs";

const copyByLocale = {
  vi: {
    filters: {
      all: "Tất cả cơ hội",
      internship: "Thực tập",
      jobs: "Việc làm",
    },
    type: {
      internship: "Thực tập",
      full_time: "Toàn thời gian",
      part_time: "Bán thời gian",
      contract: "Hợp đồng",
    },
    workMode: {
      onsite: "Tại văn phòng",
      hybrid: "Kết hợp",
      remote: "Từ xa",
    },
    deadline: "Hạn ứng tuyển",
    openDeadline: "Không giới hạn",
    action: "Xem cơ hội",
    filterEmpty:
      "Không có vị trí nào trong nhóm lọc này. Hãy thử chọn bộ lọc khác.",
  },
  en: {
    filters: {
      all: "All opportunities",
      internship: "Internships",
      jobs: "Jobs",
    },
    type: {
      internship: "Internship",
      full_time: "Full-time",
      part_time: "Part-time",
      contract: "Contract",
    },
    workMode: {
      onsite: "On-site",
      hybrid: "Hybrid",
      remote: "Remote",
    },
    deadline: "Apply by",
    openDeadline: "Open deadline",
    action: "View opportunity",
    filterEmpty:
      "No positions match this filter. Try selecting a different category.",
  },
} as const;

export default function CareerOpportunityList({
  opportunities,
  locale,
}: {
  opportunities: CareerOpportunity[];
  locale: SiteLocale;
}) {
  const copy = copyByLocale[locale];
  const [filter, setFilter] = useState<OpportunityFilter>("all");

  const filteredItems = useMemo(() => {
    if (filter === "internship") {
      return opportunities.filter((item) => item.type === "internship");
    }
    if (filter === "jobs") {
      return opportunities.filter((item) => item.type !== "internship");
    }
    return opportunities;
  }, [filter, opportunities]);

  return (
    <div>
      <div
        className="flex flex-wrap gap-x-7 gap-y-2 border-b border-[#d8d3ce] py-4"
        aria-label={locale === "vi" ? "Lọc cơ hội" : "Filter opportunities"}
      >
        {(Object.keys(copy.filters) as OpportunityFilter[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={`cursor-pointer border-b py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#BA4811] ${
              filter === key
                ? "border-[#BA4811] text-[#BA4811]"
                : "border-transparent text-[#686c67] hover:text-[#171b25]"
            }`}
          >
            {copy.filters[key]}
          </button>
        ))}
      </div>

      {filteredItems.length === 0 ? (
        <p className="py-10 text-sm leading-7 text-[#666a65] sm:py-12">
          {copy.filterEmpty}
        </p>
      ) : (
        <div>
          {filteredItems.map((item) => {
            const title =
              locale === "en" ? item.titleEn || item.titleVi : item.titleVi;
            const summary =
              locale === "en"
                ? item.summaryEn || item.summaryVi
                : item.summaryVi;
            const location =
              locale === "en"
                ? item.locationEn || item.locationVi
                : item.locationVi;
            const href =
              item.applicationUrl ||
              (item.contactEmail ? `mailto:${item.contactEmail}` : null) ||
              "https://www.facebook.com/sit.ttu.edu.vn";
            const skills = (item.skills || "")
              .split(",")
              .map((skill) => skill.trim())
              .filter(Boolean)
              .slice(0, 5);

            return (
              <article
                key={item.id}
                className="group border-b border-[#d8d3ce] py-7 sm:py-9"
              >
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_15rem] lg:gap-12">
                  <div className="flex min-w-0 gap-4 sm:gap-6">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-[#d8d3ce] bg-[#f7f4f1] text-base font-bold uppercase text-[#BA4811] sm:h-14 sm:w-14">
                      {item.companyLogoUrl ? (
                        <img
                          src={item.companyLogoUrl}
                          alt=""
                          className="h-full w-full object-contain p-2"
                        />
                      ) : (
                        item.companyName.slice(0, 1)
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap gap-x-3 gap-y-1 font-mono text-[0.58rem] font-semibold uppercase tracking-[0.15em] text-[#BA4811]">
                        <span>{copy.type[item.type]}</span>
                        <span aria-hidden="true" className="text-[#aaa7a2]">·</span>
                        <span className="text-[#777b76]">
                          {copy.workMode[item.workMode]}
                        </span>
                        {item.isFeatured && (
                          <>
                            <span aria-hidden="true" className="text-[#aaa7a2]">·</span>
                            <span>{locale === "vi" ? "Nổi bật" : "Featured"}</span>
                          </>
                        )}
                      </div>
                      <h3 className="mt-3 text-xl font-bold leading-snug tracking-[-0.03em] sm:text-2xl">
                        {title}
                      </h3>
                      <p className="mt-2 text-sm font-semibold text-[#454944]">
                        {item.companyName}
                      </p>
                      {summary && (
                        <p className="mt-4 max-w-3xl text-sm leading-7 text-[#666a65] sm:text-base">
                          {summary}
                        </p>
                      )}
                      {skills.length > 0 && (
                        <div className="mt-5 flex flex-wrap gap-2">
                          {skills.map((skill) => (
                            <span
                              key={skill}
                              className="border border-[#d8d3ce] bg-white px-2.5 py-1 text-xs font-medium text-[#626661]"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col justify-between border-t border-[#d8d3ce] pt-5 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
                    <dl className="space-y-4 text-sm">
                      <div>
                        <dt className="font-mono text-[0.56rem] font-semibold uppercase tracking-[0.14em] text-[#8b8e89]">
                          {locale === "vi" ? "Địa điểm" : "Location"}
                        </dt>
                        <dd className="mt-1.5 font-medium text-[#454944]">
                          {location}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-mono text-[0.56rem] font-semibold uppercase tracking-[0.14em] text-[#8b8e89]">
                          {copy.deadline}
                        </dt>
                        <dd className="mt-1.5 font-medium text-[#454944]">
                          {item.applicationDeadline
                            ? new Intl.DateTimeFormat(
                                locale === "vi" ? "vi-VN" : "en-US",
                                { dateStyle: "medium" },
                              ).format(new Date(item.applicationDeadline))
                            : copy.openDeadline}
                        </dd>
                      </div>
                      {item.salaryText && (
                        <div>
                          <dt className="font-mono text-[0.56rem] font-semibold uppercase tracking-[0.14em] text-[#8b8e89]">
                            {locale === "vi" ? "Lương / trợ cấp" : "Compensation"}
                          </dt>
                          <dd className="mt-1.5 font-medium text-[#454944]">
                            {item.salaryText}
                          </dd>
                        </div>
                      )}
                    </dl>
                    <a
                      href={href}
                      target={href.startsWith("mailto:") ? undefined : "_blank"}
                      rel={href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
                      className="mt-7 inline-flex w-fit items-center text-sm font-semibold text-[#BA4811] underline decoration-[#BA4811]/35 underline-offset-6 transition-colors group-hover:decoration-[#BA4811] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#BA4811]"
                    >
                      {copy.action}
                      <ArrowIcon direction="up-right" className="ml-2" size={16} />
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
