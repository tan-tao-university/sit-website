"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Search, X } from "lucide-react";
import { motion } from "framer-motion";
import { api, type Faculty } from "@/lib/api";

function getInitials(fullName: string) {
  return fullName
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
}

function normalizeText(value?: string) {
  return (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export default function FacultyPage() {
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    api.faculty
      .findAll()
      .then((data) => {
        if (active) setFaculty(data);
      })
      .catch((fetchError) => {
        console.error("Failed to fetch faculty:", fetchError);
        if (active) {
          setError("Không thể tải danh sách giảng viên lúc này.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const activeFaculty = useMemo(
    () => faculty.filter((member) => member.isActive !== false),
    [faculty],
  );

  const filteredFaculty = useMemo(() => {
    const normalizedQuery = normalizeText(query.trim());
    if (!normalizedQuery) return activeFaculty;

    return activeFaculty.filter((member) =>
      normalizeText(
        [
          member.fullName,
          member.academicTitle,
          member.position,
          member.department,
          member.bioShort,
          ...(member.researchAreas || []).map((area) => area.title),
        ]
          .filter(Boolean)
          .join(" "),
      ).includes(normalizedQuery),
    );
  }, [activeFaculty, query]);

  if (loading) {
    return (
      <main className="min-h-screen bg-white">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:py-20">
          <div className="animate-pulse">
            <div className="h-4 w-48 bg-[#ece9e4]" />
            <div className="mt-7 h-14 max-w-3xl bg-[#e5e1dc]" />
            <div className="mt-4 h-14 max-w-2xl bg-[#e5e1dc]" />
            <div className="mt-16 h-16 w-full border-y border-[#ece9e4] bg-[#f8f6f3]" />
            <div className="mt-16 grid gap-x-12 gap-y-16 lg:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="grid grid-cols-[0.42fr_0.58fr] gap-6 border-t border-[#ded9d2] pt-5"
                >
                  <div className="aspect-[3/4] bg-[#f0ede8]" />
                  <div>
                    <div className="h-3 w-24 bg-[#ece9e4]" />
                    <div className="mt-5 h-8 w-full bg-[#e5e1dc]" />
                    <div className="mt-3 h-8 w-4/5 bg-[#e5e1dc]" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-[65vh] items-center bg-white px-5 sm:px-8">
        <div className="mx-auto w-full max-w-7xl border-t border-[#d8d3cc] pt-10">
          <p className="font-roboto-mono text-xs uppercase tracking-[0.18em] text-[#ba4811]">
            Danh sách giảng viên
          </p>
          <h1 className="mt-5 max-w-xl text-3xl font-bold leading-tight tracking-[-0.03em] text-[#151823] sm:text-5xl">
            {error}
          </h1>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-9 cursor-pointer border-b border-[#ba4811] pb-1 text-sm font-semibold text-[#ba4811]"
          >
            Thử tải lại trang
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-[#151823]">
      <section className="border-b border-[#d8d3cc]">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 pb-14 pt-12 sm:px-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-end lg:gap-20 lg:pb-20 lg:pt-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-4 font-roboto-mono text-xs uppercase tracking-[0.18em] text-[#ba4811]">
              <span className="h-px w-12 bg-[#ba4811]" />
              Đội ngũ học thuật
            </div>
            <h1 className="mt-7 max-w-[17ch] text-[clamp(2.55rem,5vw,4.9rem)] font-bold leading-[1.08] tracking-[-0.04em] text-balance">
              Những người dẫn dắt việc học và nghiên cứu tại SIT
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="border-t border-[#1c1f1b] pt-5 lg:mb-1"
          >
            <div className="flex items-start justify-between gap-8">
              <p className="max-w-[29rem] text-sm leading-7 text-[#666963] sm:text-base">
                Khám phá chuyên môn, quá trình đào tạo và các công bố khoa học
                của đội ngũ giảng viên Khoa Công nghệ Thông tin.
              </p>
              <span className="shrink-0 font-roboto-mono text-2xl font-semibold tabular-nums text-[#ba4811]">
                {String(activeFaculty.length).padStart(2, "0")}
              </span>
            </div>
            <p className="mt-3 text-right font-roboto-mono text-[0.65rem] uppercase tracking-[0.13em] text-[#92958f]">
              Hồ sơ đang hoạt động
            </p>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:py-16">
        <label className="mx-auto grid h-16 max-w-4xl grid-cols-[4rem_minmax(0,1fr)_auto] border border-[#d8d3cc] bg-white transition-colors duration-200 focus-within:border-[#ba4811]">
          <span className="sr-only">Tìm kiếm giảng viên</span>
          <span className="flex h-full items-center justify-center border-r border-[#d8d3cc] bg-[#f7f4ef] text-[#ba4811]">
            <Search className="h-5 w-5" strokeWidth={1.8} />
          </span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm theo tên, chức danh hoặc lĩnh vực nghiên cứu"
            className="min-w-0 appearance-none border-0 bg-transparent px-4 text-base font-medium text-[#20231f] outline-none placeholder:font-normal placeholder:text-[#92958f] sm:px-6 sm:text-lg [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="flex h-full w-16 shrink-0 cursor-pointer items-center justify-center border-l border-[#d8d3cc] text-[#777a74] transition-colors hover:bg-[#ba4811] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#ba4811]"
              aria-label="Xóa nội dung tìm kiếm"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </label>

        {filteredFaculty.length === 0 ? (
          <div className="border-b border-[#d8d3cc] py-20 text-center">
            <p className="text-2xl font-semibold tracking-[-0.02em]">
              Không tìm thấy giảng viên phù hợp
            </p>
            <p className="mt-3 text-sm text-[#777a74]">
              Thử tìm bằng tên hoặc một từ khóa ngắn hơn.
            </p>
            <button
              type="button"
              onClick={() => setQuery("")}
              className="mt-7 cursor-pointer border-b border-[#ba4811] pb-1 text-sm font-semibold text-[#ba4811]"
            >
              Hiển thị toàn bộ giảng viên
            </button>
          </div>
        ) : (
          <div className="mt-14 grid gap-x-12 gap-y-16 lg:grid-cols-2 lg:gap-y-20">
            {filteredFaculty.map((member, index) => {
              const detailHref = `/vi/giang-vien/${member.slug}`;
              const profileStats = [
                {
                  value: member.publications?.length || 0,
                  label: "Công bố",
                },
                {
                  value: member.academicTimeline?.length || 0,
                  label: "Học vấn",
                },
                {
                  value: member.researchAreas?.length || 0,
                  label: "Nghiên cứu",
                },
              ].filter((item) => item.value > 0);

              return (
                <motion.article
                  key={member.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.45,
                    delay: Math.min(index * 0.06, 0.3),
                  }}
                  className="group border-t border-[#1c1f1b] pt-5"
                >
                  <div className="grid gap-6 sm:grid-cols-[minmax(10rem,0.42fr)_minmax(0,0.58fr)] sm:gap-7">
                    <Link
                      href={detailHref}
                      className="relative block cursor-pointer overflow-hidden bg-[#f2efea]"
                      aria-label={`Xem hồ sơ ${member.fullName}`}
                    >
                      <div className="aspect-[3/4] overflow-hidden">
                        {member.avatarUrl ? (
                          <img
                            src={member.avatarUrl}
                            alt={`Chân dung ${member.fullName}`}
                            className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.025]"
                          />
                        ) : (
                          <div className="flex h-full items-end bg-[linear-gradient(145deg,#f4f1ec_0%,#e5ded5_100%)] p-6">
                            <span className="text-5xl font-bold tracking-[-0.07em] text-[#ba4811]">
                              {getInitials(member.fullName)}
                            </span>
                          </div>
                        )}
                      </div>
                      <span className="absolute bottom-0 left-0 h-1.5 w-20 bg-[#ba4811] transition-[width] duration-300 group-hover:w-full" />
                    </Link>

                    <div className="flex min-w-0 flex-col sm:py-1">
                      <p className="font-roboto-mono text-[0.68rem] uppercase leading-5 tracking-[0.13em] text-[#ba4811]">
                        {member.position?.split(/\s+[–—-]\s+/)[0] ||
                          "Giảng viên"}
                      </p>
                      <Link href={detailHref} className="cursor-pointer">
                        <h2 className="mt-3 text-[1.65rem] font-bold leading-[1.16] tracking-[-0.035em] text-[#1c1f1b] transition-colors group-hover:text-[#ba4811] sm:text-[1.85rem]">
                          {member.academicTitle &&
                            `${member.academicTitle.replace(/\.+$/, "")}. `}
                          {member.fullName}
                        </h2>
                      </Link>
                      <p className="mt-5 line-clamp-4 text-sm leading-7 text-[#666963]">
                        {member.bioShort ||
                          member.quote ||
                          "Thông tin chuyên môn và hoạt động học thuật của giảng viên Khoa Công nghệ Thông tin."}
                      </p>

                      <div className="mt-auto pt-7">
                        {profileStats.length > 0 && (
                          <dl className="mb-6 flex flex-wrap gap-x-5 gap-y-2 border-t border-[#d8d3cc] pt-4">
                            {profileStats.map((item) => (
                              <div
                                key={item.label}
                                className="flex items-baseline gap-1.5"
                              >
                                <dd className="font-roboto-mono text-sm font-semibold tabular-nums text-[#252824]">
                                  {item.value}
                                </dd>
                                <dt className="text-[0.68rem] text-[#858882]">
                                  {item.label}
                                </dt>
                              </div>
                            ))}
                          </dl>
                        )}

                        <Link
                          href={detailHref}
                          className="inline-flex cursor-pointer items-center gap-2 border-b border-[#ba4811] pb-1 text-sm font-semibold text-[#ba4811]"
                        >
                          Xem hồ sơ
                          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
