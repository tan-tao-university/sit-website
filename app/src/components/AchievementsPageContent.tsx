import type { Achievement } from "@/lib/api";
import type { SiteLocale } from "@/lib/program-pages";

const copyByLocale = {
  vi: {
    eyebrow: "Thành tích SIT",
    title: "Những cột mốc được tạo nên từ nỗ lực thật.",
    description:
      "Ghi nhận thành tích học thuật, nghiên cứu và các cuộc thi của sinh viên, giảng viên Khoa Công nghệ Thông tin.",
    count: "thành tích được công bố",
    archive: "Danh sách thành tích",
    empty: "Chưa có thành tích công khai.",
    students: "Sinh viên",
    project: "Dự án",
    organization: "Đơn vị tổ chức",
    reward: "Giải thưởng",
    highlight: "Nổi bật",
    types: {
      HACKATHON: "Hackathon",
      AWARD: "Giải thưởng",
      SCHOLARSHIP: "Học bổng",
      RESEARCH: "Nghiên cứu",
      COMPETITION: "Cuộc thi",
      OTHER: "Thành tích khác",
    },
    levels: {
      UNIVERSITY: "Cấp trường",
      NATIONAL: "Quốc gia",
      INTERNATIONAL: "Quốc tế",
    },
  },
  en: {
    eyebrow: "SIT achievements",
    title: "Milestones shaped by meaningful work.",
    description:
      "Recognising academic, research and competition achievements by students and faculty of the School of Information Technology.",
    count: "published achievements",
    archive: "Achievement archive",
    empty: "No public achievements are available yet.",
    students: "Students",
    project: "Project",
    organization: "Organisation",
    reward: "Recognition",
    highlight: "Featured",
    types: {
      HACKATHON: "Hackathon",
      AWARD: "Award",
      SCHOLARSHIP: "Scholarship",
      RESEARCH: "Research",
      COMPETITION: "Competition",
      OTHER: "Other achievement",
    },
    levels: {
      UNIVERSITY: "University",
      NATIONAL: "National",
      INTERNATIONAL: "International",
    },
  },
} as const;

export default function AchievementsPageContent({
  locale,
  items,
}: {
  locale: SiteLocale;
  items: Achievement[];
}) {
  const copy = copyByLocale[locale];
  const sortedItems = [...items].sort((a, b) => {
    if (Boolean(a.isHighlight) !== Boolean(b.isHighlight)) {
      return b.isHighlight ? 1 : -1;
    }

    const yearDifference = (b.achievedYear ?? 0) - (a.achievedYear ?? 0);
    if (yearDifference !== 0) return yearDifference;

    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <main className="min-h-screen overflow-hidden bg-white text-[#171b25]">
      <section className="border-b border-[#171b25]/15 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 pb-14 pt-10 sm:px-8 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-end lg:gap-20 lg:pb-20 lg:pt-16">
          <div>
            <div className="flex items-center gap-4 font-mono text-[0.64rem] font-semibold uppercase tracking-[0.2em] text-[#BA4811]">
              <span className="h-px w-12 bg-current" />
              {copy.eyebrow}
            </div>
            <h1 className="mt-7 max-w-[15ch] text-[2.75rem] font-bold leading-[1.04] tracking-[-0.045em] text-balance sm:text-[3.6rem] lg:text-[4rem]">
              {copy.title}
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-8 text-[#626661] sm:text-lg">
              {copy.description}
            </p>
          </div>

          <div className="border-l-2 border-[#BA4811] pl-6 lg:mb-1">
            <p className="font-mono text-[2.5rem] font-medium leading-none tracking-[-0.06em] text-[#BA4811]">
              {String(sortedItems.length).padStart(2, "0")}
            </p>
            <p className="mt-3 text-sm leading-6 text-[#676b66]">{copy.count}</p>
          </div>
        </div>
      </section>

      <section className="bg-white py-14 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mb-10 flex items-end justify-between gap-6 border-b-2 border-[#171b25] pb-5">
            <h2 className="text-2xl font-bold tracking-[-0.035em] sm:text-3xl">
              {copy.archive}
            </h2>
            <span className="font-mono text-[0.58rem] uppercase tracking-[0.14em] text-[#898c87]">
              SIT · TTU
            </span>
          </div>

          {sortedItems.length === 0 ? (
            <div className="border-l-2 border-[#BA4811] bg-[#f7f4f1] px-6 py-10 text-sm text-[#626661]">
              {copy.empty}
            </div>
          ) : (
            <div className="grid gap-x-6 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
              {sortedItems.map((item) => {
                const typeLabel = copy.types[item.type];
                const levelLabel = item.level ? copy.levels[item.level] : null;

                return (
                  <article
                    key={item.id}
                    className="group flex flex-col border-t-2 border-[#171b25] pt-4"
                  >
                    <figure className="relative aspect-[16/10] overflow-hidden bg-[#eee5de]">
                      {item.coverImage ? (
                        <img
                          src={item.coverImage}
                          alt={item.title}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035]"
                        />
                      ) : (
                        <div className="relative flex h-full flex-col justify-between overflow-hidden p-6">
                          <span className="relative z-10 font-mono text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-[#9c3c0e]">
                            {typeLabel}
                          </span>
                          <span className="relative z-10 font-mono text-[3.5rem] font-medium leading-none tracking-[-0.08em] text-[#BA4811]">
                            {item.achievedYear ?? "SIT"}
                          </span>
                          <span className="absolute -bottom-14 -right-8 h-52 w-52 rounded-full border border-[#BA4811]/20" />
                          <span className="absolute -bottom-5 right-12 h-28 w-28 rounded-full border border-[#BA4811]/25" />
                        </div>
                      )}

                      {item.isHighlight && (
                        <span className="absolute right-4 top-4 bg-[#BA4811] px-3 py-1.5 font-mono text-[0.53rem] font-semibold uppercase tracking-[0.13em] text-white">
                          {copy.highlight}
                        </span>
                      )}
                    </figure>

                    <div className="flex flex-1 flex-col py-5">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[0.55rem] uppercase tracking-[0.12em] text-[#8a8d88]">
                        <span className="text-[#BA4811]">{typeLabel}</span>
                        {levelLabel && (
                          <>
                            <span aria-hidden>·</span>
                            <span>{levelLabel}</span>
                          </>
                        )}
                        {item.achievedYear && (
                          <>
                            <span aria-hidden>·</span>
                            <span>{item.achievedYear}</span>
                          </>
                        )}
                      </div>

                      <h3 className="mt-4 text-xl font-bold leading-[1.3] tracking-[-0.025em] text-balance">
                        {item.title}
                      </h3>
                      {item.description && (
                        <p className="mt-4 text-[0.82rem] leading-6 text-[#626661]">
                          {item.description}
                        </p>
                      )}

                      <dl className="mt-6 border-t border-[#d8d3ce] text-[0.72rem] leading-5">
                        {[
                          [copy.students, item.studentNames],
                          [copy.project, item.projectName],
                          [copy.organization, item.organization],
                          [copy.reward, [item.rank, item.reward].filter(Boolean).join(" · ")],
                        ]
                          .filter((entry): entry is [string, string] => Boolean(entry[1]))
                          .map(([label, value]) => (
                            <div key={label} className="grid grid-cols-[6.5rem_1fr] gap-4 border-b border-[#e6e1dc] py-3 last:border-b-0">
                              <dt className="font-mono text-[0.52rem] uppercase tracking-[0.1em] text-[#92958f]">
                                {label}
                              </dt>
                              <dd className="font-medium text-[#4f534f]">{value}</dd>
                            </div>
                          ))}
                      </dl>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
