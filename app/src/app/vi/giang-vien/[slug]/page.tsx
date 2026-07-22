"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import {
  api,
  type Faculty,
  type FacultyContact,
  type FacultyPublication,
} from "@/lib/api";

const contactLabels: Record<string, string> = {
  email: "Email",
  phone: "Điện thoại",
  website: "Website",
  scholar: "Google Scholar",
  linkedin: "LinkedIn",
  researchgate: "ResearchGate",
  orcid: "ORCID",
  office: "Văn phòng",
};

function getInitials(fullName: string) {
  return fullName
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
}

function getContactHref(contact: FacultyContact) {
  const value = contact.value?.trim();
  if (!value) return undefined;
  if (contact.type === "email") {
    return value.startsWith("mailto:") ? value : `mailto:${value}`;
  }
  if (contact.type === "phone") {
    return value.startsWith("tel:") ? value : `tel:${value.replace(/\s/g, "")}`;
  }
  if (/^https?:\/\//.test(value)) return value;
  return undefined;
}

function getContactDisplay(contact: FacultyContact) {
  return (contact.value || "")
    .replace(/^mailto:/, "")
    .replace(/^https?:\/\//, "");
}

function getPublicationHref(publication: FacultyPublication) {
  if (publication.publisherUrl) return publication.publisherUrl;
  if (!publication.doi) return undefined;
  return publication.doi.startsWith("http")
    ? publication.doi
    : `https://doi.org/${publication.doi}`;
}

function formatPeriod(startYear?: number, endYear?: number) {
  if (!startYear && !endYear) return "";
  if (startYear && !endYear) return `${startYear} — nay`;
  if (!startYear && endYear) return String(endYear);
  return startYear === endYear
    ? String(startYear)
    : `${startYear} — ${endYear}`;
}

export default function FacultyDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [faculty, setFaculty] = useState<Faculty | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllPublications, setShowAllPublications] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    setShowAllPublications(false);

    api.faculty
      .findBySlug(slug)
      .then((data) => {
        if (active) setFaculty(data);
      })
      .catch((fetchError) => {
        console.error("Failed to fetch faculty:", fetchError);
        if (active) setError("Không tìm thấy thông tin giảng viên.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [slug]);

  const publicContacts = useMemo(
    () =>
      (faculty?.contacts || []).filter(
        (contact) => contact.value && contact.visibility !== "internal",
      ),
    [faculty],
  );

  const sortedTimeline = useMemo(
    () =>
      [...(faculty?.academicTimeline || [])].sort(
        (a, b) =>
          (a.displayOrder ?? Number.MAX_SAFE_INTEGER) -
            (b.displayOrder ?? Number.MAX_SAFE_INTEGER) ||
          (b.endYear || b.startYear || 0) - (a.endYear || a.startYear || 0),
      ),
    [faculty],
  );

  const sortedPublications = useMemo(
    () =>
      [...(faculty?.publications || [])]
        .filter((publication) => publication.title)
        .sort(
          (a, b) =>
            (b.year || 0) - (a.year || 0) ||
            (a.displayOrder ?? Number.MAX_SAFE_INTEGER) -
              (b.displayOrder ?? Number.MAX_SAFE_INTEGER),
        ),
    [faculty],
  );

  const visiblePublications = showAllPublications
    ? sortedPublications
    : sortedPublications.slice(0, 8);

  if (loading) {
    return (
      <main className="min-h-screen bg-white">
        <div className="mx-auto max-w-7xl animate-pulse px-5 py-14 sm:px-8 lg:py-20">
          <div className="mb-10 h-5 w-40 bg-[#ece9e4]" />
          <div className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:gap-20">
            <div className="aspect-[4/5] bg-[#f1efeb]" />
            <div className="flex flex-col justify-center">
              <div className="mb-8 h-4 w-56 bg-[#ece9e4]" />
              <div className="mb-4 h-16 w-11/12 bg-[#e5e1dc]" />
              <div className="mb-10 h-16 w-2/3 bg-[#e5e1dc]" />
              <div className="h-24 w-full bg-[#f1efeb]" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !faculty) {
    return (
      <main className="flex min-h-[65vh] items-center bg-white px-5 sm:px-8">
        <div className="mx-auto w-full max-w-7xl border-t border-[#d8d3cc] pt-10">
          <p className="font-roboto-mono text-xs uppercase tracking-[0.18em] text-[#ba4811]">
            Hồ sơ không khả dụng
          </p>
          <h1 className="mt-5 max-w-xl text-3xl font-bold tracking-[-0.03em] text-[#151823] sm:text-5xl">
            {error || "Không tìm thấy giảng viên"}
          </h1>
          <Link
            href="/vi/giang-vien"
            className="mt-10 inline-flex cursor-pointer items-center gap-3 border-b border-[#ba4811] pb-1 text-sm font-semibold text-[#ba4811]"
          >
            <ArrowLeft className="h-4 w-4" /> Quay lại danh sách giảng viên
          </Link>
        </div>
      </main>
    );
  }

  const sections = [
    faculty.bioShort && { id: "gioi-thieu", label: "Giới thiệu" },
    faculty.researchAreas?.length && {
      id: "nghien-cuu",
      label: "Lĩnh vực nghiên cứu",
    },
    sortedTimeline.length && { id: "dao-tao", label: "Quá trình đào tạo" },
    sortedPublications.length && {
      id: "cong-bo",
      label: "Công bố khoa học",
    },
    faculty.courses?.some((item) => item.course) && {
      id: "giang-day",
      label: "Giảng dạy",
    },
  ].filter(Boolean) as Array<{ id: string; label: string }>;

  const profileCounts = [
    {
      value: faculty.researchAreas?.length || 0,
      label: "Lĩnh vực nghiên cứu",
    },
    { value: sortedPublications.length, label: "Công bố khoa học" },
    {
      value: faculty.courses?.filter((item) => item.course).length || 0,
      label: "Học phần giảng dạy",
    },
  ].filter((item) => item.value > 0);

  const updatedAt = faculty.meta?.lastUpdatedAt || faculty.updatedAt;

  return (
    <main className="min-h-screen bg-white text-[#151823]">
      <section className="border-b border-[#d8d3cc]">
        <div className="mx-auto max-w-7xl px-5 pb-14 pt-10 sm:px-8 lg:pb-20 lg:pt-14">
          <Link
            href="/vi/giang-vien"
            className="group mb-10 inline-flex cursor-pointer items-center gap-3 font-roboto-mono text-xs uppercase tracking-[0.16em] text-[#686b67] transition-colors hover:text-[#ba4811] lg:mb-14"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Danh sách giảng viên
          </Link>

          <div className="grid items-start gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:gap-20 xl:gap-28">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
              className="relative mx-auto w-full max-w-[31rem] lg:mx-0"
            >
              <div className="aspect-[4/5] overflow-hidden bg-[#f2efea]">
                {faculty.avatarUrl ? (
                  <img
                    src={faculty.avatarUrl}
                    alt={`Chân dung ${faculty.fullName}`}
                    className="h-full w-full object-cover object-top"
                  />
                ) : (
                  <div className="flex h-full items-end bg-[linear-gradient(145deg,#f4f1ec_0%,#e5ded5_100%)] p-8 sm:p-10">
                    <span className="text-[5rem] font-bold leading-none tracking-[-0.08em] text-[#ba4811] sm:text-[7rem]">
                      {getInitials(faculty.fullName)}
                    </span>
                  </div>
                )}
              </div>
              <div className="absolute -bottom-2 left-0 h-2 w-28 bg-[#ba4811]" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.08 }}
              className="min-w-0 lg:pt-4"
            >
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 font-roboto-mono text-xs uppercase tracking-[0.16em] text-[#ba4811]">
                {faculty.academicTitle && <span>{faculty.academicTitle}</span>}
                {faculty.academicTitle && faculty.position && (
                  <span className="text-[#b7b1a9]">/</span>
                )}
                <span>{faculty.position || "Giảng viên"}</span>
              </div>

              <h1 className="mt-6 max-w-[15ch] text-[clamp(2.55rem,5vw,4.8rem)] font-bold leading-[1.1] tracking-[-0.035em] text-balance">
                {faculty.fullName}
              </h1>

              <p className="mt-6 max-w-[40rem] text-base leading-8 text-[#666963] sm:text-lg">
                {faculty.department || "Khoa Công nghệ Thông tin"}
              </p>

              {faculty.quote && (
                <blockquote className="mt-9 max-w-[42rem] border-l-2 border-[#ba4811] pl-5 text-lg leading-8 text-[#363934] sm:pl-6 sm:text-xl">
                  “{faculty.quote}”
                </blockquote>
              )}

              {publicContacts.length > 0 && (
                <div className="mt-10 border-y border-[#d8d3cc]">
                  {publicContacts.map((contact) => {
                    const href = getContactHref(contact);
                    const content = (
                      <>
                        <span className="font-roboto-mono text-[0.68rem] uppercase tracking-[0.14em] text-[#8a8d87]">
                          {contactLabels[contact.type || ""] ||
                            contact.type ||
                            "Liên hệ"}
                        </span>
                        <span className="min-w-0 break-all text-right text-sm font-medium text-[#292c27] sm:text-base">
                          {getContactDisplay(contact)}
                        </span>
                      </>
                    );

                    return href ? (
                      <a
                        key={contact.id}
                        href={href}
                        target={href.startsWith("http") ? "_blank" : undefined}
                        rel={
                          href.startsWith("http")
                            ? "noopener noreferrer"
                            : undefined
                        }
                        className="group flex cursor-pointer items-center justify-between gap-6 border-b border-[#e7e3de] py-3.5 last:border-b-0 hover:text-[#ba4811]"
                      >
                        {content}
                      </a>
                    ) : (
                      <div
                        key={contact.id}
                        className="flex items-center justify-between gap-6 border-b border-[#e7e3de] py-3.5 last:border-b-0"
                      >
                        {content}
                      </div>
                    );
                  })}
                </div>
              )}

              {profileCounts.length > 0 && (
                <dl className="mt-10 grid grid-flow-col auto-cols-fr border-t border-[#d8d3cc]">
                  {profileCounts.map((item) => (
                    <div
                      key={item.label}
                      className="border-r border-[#d8d3cc] px-4 py-5 first:pl-0 last:border-r-0"
                    >
                      <dd className="font-roboto-mono text-2xl font-semibold tabular-nums text-[#ba4811]">
                        {String(item.value).padStart(2, "0")}
                      </dd>
                      <dt className="mt-1 text-xs leading-5 text-[#757872]">
                        {item.label}
                      </dt>
                    </div>
                  ))}
                </dl>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-20 lg:py-24">
        <aside className="lg:self-stretch">
          <div className="top-28 lg:sticky">
            <p className="font-roboto-mono text-xs uppercase tracking-[0.16em] text-[#ba4811]">
              Trong hồ sơ
            </p>
            <nav
              aria-label="Mục lục hồ sơ giảng viên"
              className="mt-5 flex gap-x-6 gap-y-2 overflow-x-auto border-t border-[#1c1f1b] py-4 lg:block lg:space-y-1 lg:overflow-visible"
            >
              {sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="block shrink-0 cursor-pointer py-2 text-sm font-medium text-[#686b67] transition-colors hover:text-[#ba4811]"
                >
                  {section.label}
                </a>
              ))}
            </nav>
            {updatedAt && (
              <p className="mt-7 hidden border-t border-[#d8d3cc] pt-5 font-roboto-mono text-[0.65rem] uppercase leading-5 tracking-[0.12em] text-[#92958f] lg:block">
                Cập nhật gần nhất
                <br />
                {new Intl.DateTimeFormat("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                }).format(new Date(updatedAt))}
              </p>
            )}
          </div>
        </aside>

        <div className="min-w-0 max-w-[58rem]">
          {faculty.bioShort && (
            <section
              id="gioi-thieu"
              className="scroll-mt-28 border-t-2 border-[#1c1f1b] pt-9"
            >
              <p className="font-roboto-mono text-xs uppercase tracking-[0.16em] text-[#ba4811]">
                Hồ sơ học thuật
              </p>
              <h2 className="mt-4 text-3xl font-bold tracking-[-0.035em] sm:text-4xl">
                Giới thiệu
              </h2>
              <p className="mt-7 max-w-[68ch] whitespace-pre-line text-base leading-8 text-[#555953] sm:text-lg sm:leading-9">
                {faculty.bioShort}
              </p>
            </section>
          )}

          {faculty.researchAreas && faculty.researchAreas.length > 0 && (
            <section
              id="nghien-cuu"
              className="mt-16 scroll-mt-28 border-t border-[#d8d3cc] pt-10 first:mt-0 sm:mt-20"
            >
              <p className="font-roboto-mono text-xs uppercase tracking-[0.16em] text-[#ba4811]">
                Chuyên môn
              </p>
              <h2 className="mt-4 text-3xl font-bold tracking-[-0.035em] sm:text-4xl">
                Lĩnh vực nghiên cứu
              </h2>
              <div className="mt-9 border-t border-[#1c1f1b]">
                {faculty.researchAreas.map((area) => (
                  <article
                    key={area.id}
                    className="grid gap-3 border-b border-[#d8d3cc] py-6 sm:grid-cols-[minmax(12rem,0.42fr)_1fr] sm:gap-10"
                  >
                    <h3 className="text-lg font-semibold leading-7 text-[#20231f]">
                      {area.title || "Lĩnh vực nghiên cứu"}
                    </h3>
                    {area.description && (
                      <p className="text-sm leading-7 text-[#696c67] sm:text-base">
                        {area.description}
                      </p>
                    )}
                  </article>
                ))}
              </div>
            </section>
          )}

          {sortedTimeline.length > 0 && (
            <section
              id="dao-tao"
              className="mt-16 scroll-mt-28 border-t border-[#d8d3cc] pt-10 first:mt-0 sm:mt-20"
            >
              <p className="font-roboto-mono text-xs uppercase tracking-[0.16em] text-[#ba4811]">
                Học vấn
              </p>
              <h2 className="mt-4 text-3xl font-bold tracking-[-0.035em] sm:text-4xl">
                Quá trình đào tạo
              </h2>
              <div className="mt-9 border-t border-[#1c1f1b]">
                {sortedTimeline.map((item) => (
                  <article
                    key={item.id}
                    className="grid gap-3 border-b border-[#d8d3cc] py-6 sm:grid-cols-[8rem_1fr] sm:gap-8"
                  >
                    <p className="font-roboto-mono text-sm text-[#ba4811]">
                      {formatPeriod(item.startYear, item.endYear)}
                    </p>
                    <div>
                      <h3 className="text-lg font-semibold leading-7 text-[#20231f]">
                        {[item.degree, item.field]
                          .filter(Boolean)
                          .join(" · ") || "Đào tạo chuyên môn"}
                      </h3>
                      {(item.institution || item.country) && (
                        <p className="mt-2 text-sm font-medium text-[#666963] sm:text-base">
                          {[item.institution, item.country]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      )}
                      {item.description && (
                        <p className="mt-3 max-w-[65ch] text-sm leading-7 text-[#747771]">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {sortedPublications.length > 0 && (
            <section
              id="cong-bo"
              className="mt-16 scroll-mt-28 border-t border-[#d8d3cc] pt-10 first:mt-0 sm:mt-20"
            >
              <p className="font-roboto-mono text-xs uppercase tracking-[0.16em] text-[#ba4811]">
                Nghiên cứu đã xuất bản
              </p>
              <h2 className="mt-4 text-3xl font-bold tracking-[-0.035em] sm:text-4xl">
                Công bố khoa học
              </h2>
              <div className="mt-9 border-t border-[#1c1f1b]">
                {visiblePublications.map((publication) => {
                  const href = getPublicationHref(publication);
                  return (
                    <article
                      key={publication.id}
                      className="grid gap-3 border-b border-[#d8d3cc] py-6 sm:grid-cols-[5rem_1fr] sm:gap-8"
                    >
                      <p className="font-roboto-mono text-sm text-[#ba4811]">
                        {publication.year || "—"}
                      </p>
                      <div>
                        <h3 className="text-base font-semibold leading-7 text-[#20231f] sm:text-lg">
                          {href ? (
                            <a
                              href={href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group inline cursor-pointer transition-colors hover:text-[#ba4811]"
                            >
                              {publication.title}
                              <ArrowUpRight className="ml-2 inline h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                            </a>
                          ) : (
                            publication.title
                          )}
                        </h3>
                        <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 font-roboto-mono text-[0.68rem] uppercase tracking-[0.1em] text-[#81847e]">
                          {publication.publicationType && (
                            <span>{publication.publicationType}</span>
                          )}
                          {publication.venue && (
                            <span>{publication.venue}</span>
                          )}
                          {publication.doi && (
                            <span>DOI {publication.doi}</span>
                          )}
                        </p>
                      </div>
                    </article>
                  );
                })}
              </div>
              {sortedPublications.length > 8 && (
                <button
                  type="button"
                  onClick={() => setShowAllPublications((current) => !current)}
                  aria-expanded={showAllPublications}
                  className="mt-7 cursor-pointer border-b border-[#ba4811] pb-1 text-sm font-semibold text-[#ba4811] transition-colors hover:text-[#8f350d]"
                >
                  {showAllPublications
                    ? "Thu gọn danh sách"
                    : `Xem toàn bộ ${sortedPublications.length} công bố`}
                </button>
              )}
            </section>
          )}

          {faculty.courses?.some((item) => item.course) && (
            <section
              id="giang-day"
              className="mt-16 scroll-mt-28 border-t border-[#d8d3cc] pt-10 first:mt-0 sm:mt-20"
            >
              <p className="font-roboto-mono text-xs uppercase tracking-[0.16em] text-[#ba4811]">
                Học phần phụ trách
              </p>
              <h2 className="mt-4 text-3xl font-bold tracking-[-0.035em] sm:text-4xl">
                Giảng dạy
              </h2>
              <div className="mt-9 grid border-t border-[#1c1f1b] sm:grid-cols-2">
                {faculty.courses
                  .filter((item) => item.course)
                  .map((item) => (
                    <article
                      key={item.id}
                      className="border-b border-[#d8d3cc] py-6 sm:odd:pr-8 sm:even:border-l sm:even:pl-8"
                    >
                      <p className="font-roboto-mono text-xs uppercase tracking-[0.12em] text-[#ba4811]">
                        {item.course?.code}
                      </p>
                      <h3 className="mt-2 text-base font-semibold leading-7 text-[#20231f] sm:text-lg">
                        {item.course?.nameVi}
                      </h3>
                      {item.course?.credits !== undefined && (
                        <p className="mt-2 text-sm text-[#777a74]">
                          {item.course.credits} tín chỉ
                        </p>
                      )}
                    </article>
                  ))}
              </div>
            </section>
          )}

          <div className="mt-20 border-t border-[#1c1f1b] pt-8">
            <Link
              href="/vi/giang-vien"
              className="group inline-flex cursor-pointer items-center gap-3 text-sm font-semibold text-[#ba4811]"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Xem toàn bộ đội ngũ giảng viên
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
