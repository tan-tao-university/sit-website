import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  api,
  type StudentPortfolio,
  type StudentPortfolioContact,
} from "@/lib/api";
import { buildPageMetadata } from "@/lib/seo";

type PageProps = { params: Promise<{ slug: string }> };

const byOrder = <T extends { displayOrder?: number }>(a: T, b: T) =>
  (a.displayOrder ?? 0) - (b.displayOrder ?? 0);

const contactLabels: Record<string, string> = {
  email: "Email",
  github: "GitHub",
  linkedin: "LinkedIn",
  website: "Website",
  facebook: "Facebook",
};

function getContactHref(contact: StudentPortfolioContact) {
  const value = contact.value.trim();
  if (contact.type === "email") {
    return value.startsWith("mailto:") ? value : `mailto:${value}`;
  }
  return /^https?:\/\//.test(value) ? value : `https://${value}`;
}

function formatPeriod(start?: string, end?: string) {
  if (!start && !end) return "";
  return `${start || "—"} – ${end || "Hiện tại"}`;
}

function formatYearRange(start?: number, end?: number) {
  if (!start && !end) return "";
  if (start && !end) return `${start} — nay`;
  if (!start && end) return String(end);
  return start === end ? String(start) : `${start} — ${end}`;
}

function getInitials(fullName: string) {
  return fullName
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
}

function SectionHeading({
  index,
  eyebrow,
  title,
  description,
}: {
  index: string;
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,0.8fr)_minmax(18rem,0.36fr)] lg:items-end lg:gap-14">
      <div>
        <p className="inline-flex rounded-full border border-[#d8d8d4] px-3 py-1.5 font-roboto-mono text-[0.62rem] uppercase tracking-[0.12em] text-[#5d605b]">
          {index} · {eyebrow}
        </p>
        <h2 className="mt-5 max-w-[18ch] text-[clamp(2rem,4vw,3.65rem)] font-medium leading-[1.02] tracking-[-0.05em] text-[#111318] text-balance">
          {title}
        </h2>
      </div>
      <p className="max-w-md text-sm leading-7 text-[#70736d] lg:pb-1">
        {description}
      </p>
    </div>
  );
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const portfolio = await api.studentPortfolio
    .findBySlug(slug)
    .catch(() => null);

  if (!portfolio) {
    return { title: "Portfolio sinh viên | SIT - Đại học Tân Tạo" };
  }

  const description =
    portfolio.shortBio?.trim() ||
    portfolio.about?.trim() ||
    `Portfolio của ${portfolio.fullName}, sinh viên Khoa Công nghệ Thông tin - Đại học Tân Tạo.`;

  return buildPageMetadata({
    locale: "vi",
    title: `${portfolio.fullName} | Portfolio sinh viên SIT`,
    description,
    path: `/${portfolio.slug}`,
    image: portfolio.avatarUrl,
  });
}

export default async function StudentPortfolioPage({ params }: PageProps) {
  const { slug } = await params;
  const portfolio = await api.studentPortfolio
    .findBySlug(slug)
    .catch(() => null);
  if (!portfolio) notFound();

  const p: StudentPortfolio = portfolio;
  const skills = [...(p.skills || [])].sort(byOrder);
  const skillGroups = skills.reduce<Record<string, typeof skills>>(
    (acc, skill) => {
      const key = skill.category || "Kỹ năng";
      (acc[key] ||= []).push(skill);
      return acc;
    },
    {},
  );
  const projects = [...(p.projects || [])].sort(
    (a, b) => Number(b.isFeatured) - Number(a.isFeatured) || byOrder(a, b),
  );
  const experiences = [...(p.experiences || [])].sort(byOrder);
  const education = [...(p.education || [])].sort(byOrder);
  const achievements = [...(p.achievements || [])].sort(byOrder);
  const contacts = [...(p.contacts || [])].sort(byOrder);
  const email = contacts.find((contact) => contact.type === "email");
  const heroContacts = contacts.filter((contact) =>
    ["github", "linkedin", "email", "website"].includes(contact.type),
  );
  const profileMeta = [
    p.program,
    p.studentYear && `Khóa ${p.studentYear}`,
    p.location,
  ].filter(Boolean);
  const stats = [
    { value: projects.length, label: "Dự án" },
    { value: skills.length, label: "Kỹ năng" },
    { value: experiences.length + education.length, label: "Dấu mốc" },
    { value: achievements.length, label: "Thành tích" },
  ];
  const hasStats = stats.some((item) => item.value > 0);
  const heroDescription =
    p.shortBio ||
    p.about ||
    "Mình học hỏi qua những sản phẩm thực tế, tập trung vào trải nghiệm người dùng và chất lượng kỹ thuật.";
  const heroTags = (
    skills.length > 0
      ? skills.slice(0, 8).map((skill) => skill.name)
      : profileMeta
  ).filter(Boolean) as string[];

  return (
    <main className="overflow-x-clip bg-white text-[#111318]">
      <section className="border-b border-[#e2e2de]">
        <div className="mx-auto max-w-7xl px-5 pb-8 pt-10 sm:px-8 sm:pb-10 sm:pt-14">
          <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-8">
            <div className="min-w-0 lg:col-span-8 lg:pt-5">
              <p className="inline-flex rounded-full border border-[#d8d8d4] px-3 py-1.5 font-roboto-mono text-[0.62rem] uppercase tracking-[0.12em] text-[#5d605b]">
                Portfolio · {p.fullName}
              </p>
              <h1
                aria-label={
                  p.fullName +
                  " — " +
                  (p.title || "Sinh viên") +
                  ", " +
                  (p.program || "Công nghệ Thông tin")
                }
                className="mt-8 text-[clamp(3.55rem,7.5vw,7rem)] font-medium leading-[0.84] tracking-[-0.075em] text-[#0d0f14]"
              >
                <span className="block">{p.title || "Sinh viên"}</span>
                <span className="block text-[#ba4811]">
                  {p.program || "Công nghệ Thông tin"}
                </span>
              </h1>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                {projects.length > 0 && (
                  <a
                    href="#du-an"
                    className="inline-flex min-h-11 items-center rounded-full bg-[#111318] px-5 text-xs font-semibold text-white transition-colors hover:bg-[#ba4811] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ba4811]"
                  >
                    Xem dự án
                  </a>
                )}
                {email && (
                  <a
                    href={getContactHref(email)}
                    className="inline-flex min-h-11 items-center rounded-full border border-[#cacac5] px-5 text-xs font-semibold text-[#2d302c] transition-colors hover:border-[#ba4811] hover:text-[#ba4811] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ba4811]"
                  >
                    Kết nối với tôi
                  </a>
                )}
              </div>
            </div>
            <aside className="grid gap-5 sm:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] sm:items-end lg:col-span-4 lg:grid-cols-1 lg:justify-items-end">
              <div className="aspect-[4/5] w-full max-w-[15rem] overflow-hidden rounded-[1.35rem] bg-[#efefec]">
                {p.avatarUrl ? (
                  <img
                    src={p.avatarUrl}
                    alt={"Chân dung " + p.fullName}
                    className="h-full w-full object-cover object-top"
                  />
                ) : (
                  <div className="flex h-full items-end p-7">
                    <span className="text-6xl font-medium tracking-[-0.07em] text-[#ba4811]">
                      {getInitials(p.fullName)}
                    </span>
                  </div>
                )}
              </div>
              <div className="max-w-[18rem] sm:pb-1 lg:text-right">
                <p className="text-sm font-semibold text-[#111318]">
                  Xin chào, mình là {p.fullName}.
                </p>
                <p className="mt-2 text-xs leading-6 text-[#6d706a]">
                  {heroDescription}
                </p>
                {heroContacts.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 lg:justify-end">
                    {heroContacts.map((contact) => (
                      <a
                        key={contact.id}
                        href={getContactHref(contact)}
                        target={contact.type === "email" ? undefined : "_blank"}
                        rel={
                          contact.type === "email"
                            ? undefined
                            : "noopener noreferrer"
                        }
                        className="text-[0.7rem] font-semibold text-[#4e514c] underline decoration-[#c8c8c3] underline-offset-4 transition-colors hover:text-[#ba4811] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ba4811]"
                      >
                        {contactLabels[contact.type] || contact.type}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </aside>
          </div>
          {heroTags.length > 0 && (
            <div className="mt-10 flex gap-3 overflow-x-auto border-t border-[#e2e2de] pt-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {heroTags.map((tag, index) => (
                <span
                  key={tag}
                  className={
                    index === 0
                      ? "shrink-0 rounded-full bg-[#111318] px-5 py-3 font-roboto-mono text-[0.62rem] uppercase tracking-[0.1em] text-white"
                      : "shrink-0 rounded-full border border-[#deded9] bg-[#f7f7f5] px-5 py-3 font-roboto-mono text-[0.62rem] uppercase tracking-[0.1em] text-[#555852]"
                  }
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {(p.about || hasStats) && (
        <section
          id="gioi-thieu"
          className="mx-auto max-w-7xl scroll-mt-28 px-5 py-16 sm:px-8 sm:py-24"
        >
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-7">
              <p className="inline-flex rounded-full border border-[#d8d8d4] px-3 py-1.5 font-roboto-mono text-[0.62rem] uppercase tracking-[0.12em] text-[#5d605b]">
                Về tôi
              </p>
              <h2 className="mt-5 max-w-[20ch] text-[clamp(2.15rem,4.4vw,4.2rem)] font-medium leading-[1.02] tracking-[-0.055em]">
                Học bằng cách làm, trưởng thành qua từng sản phẩm.
              </h2>
            </div>
            <div className="lg:col-span-4 lg:col-start-9 lg:pt-12">
              <p className="whitespace-pre-line text-sm leading-7 text-[#676a64]">
                {p.about || heroDescription}
              </p>
            </div>
          </div>
          {hasStats && (
            <dl className="mt-12 grid border-y border-[#deded9] sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((item, index) => (
                <div
                  key={item.label}
                  className={[
                    "py-7",
                    index > 0 ? "sm:border-l sm:border-[#deded9] sm:pl-7" : "",
                    index > 1 ? "border-t border-[#deded9] lg:border-t-0" : "",
                    index % 2 === 0
                      ? "sm:border-l-0 sm:pl-0 lg:border-l lg:pl-7"
                      : "",
                    index === 0 ? "lg:border-l-0 lg:pl-0" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <dd className="text-4xl font-medium tracking-[-0.05em]">
                    {String(item.value).padStart(2, "0")}
                  </dd>
                  <dt className="mt-2 text-xs text-[#747771]">{item.label}</dt>
                </div>
              ))}
            </dl>
          )}
        </section>
      )}

      {skills.length > 0 && (
        <section
          id="ky-nang"
          className="mx-auto max-w-7xl scroll-mt-28 px-5 py-16 sm:px-8 sm:py-24"
        >
          <SectionHeading
            index="02"
            eyebrow="Năng lực"
            title="Một hệ kỹ năng đủ gọn để tập trung, đủ rộng để tạo ra sản phẩm."
            description="Từ ý tưởng, thiết kế đến triển khai, mỗi nhóm năng lực đều phục vụ một mục tiêu: làm ra trải nghiệm rõ ràng và hữu ích."
          />
          <div className="mt-10 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(skillGroups).map(([category, items], index) => (
              <article
                key={category}
                className={
                  index === 0
                    ? "flex min-h-64 flex-col rounded-[1.35rem] bg-[#111318] p-7 text-white md:row-span-2 md:min-h-full"
                    : "flex min-h-64 flex-col rounded-[1.35rem] border border-[#deded9] bg-[#fafaf8] p-7 transition-colors hover:border-[#ba4811]"
                }
              >
                <p
                  className={
                    index === 0
                      ? "font-roboto-mono text-[0.62rem] uppercase tracking-[0.14em] text-white/55"
                      : "font-roboto-mono text-[0.62rem] uppercase tracking-[0.14em] text-[#8a8d87]"
                  }
                >
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-auto pt-12 text-2xl font-medium tracking-[-0.04em]">
                  {category}
                </h3>
                <p
                  className={
                    index === 0
                      ? "mt-4 text-sm leading-7 text-white/65"
                      : "mt-4 text-sm leading-7 text-[#696c66]"
                  }
                >
                  {items.map((skill) => skill.name).join(" · ")}
                </p>
              </article>
            ))}
          </div>
        </section>
      )}

      {(experiences.length > 0 || education.length > 0) && (
        <section
          id="hanh-trinh"
          className="scroll-mt-28 border-y border-[#e2e2de] bg-[#fafaf8]"
        >
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
            <SectionHeading
              index="03"
              eyebrow="Hành trình"
              title="Kinh nghiệm được kể bằng công việc thật và những cột mốc rõ ràng."
              description="Một lát cắt ngắn về nơi tôi đã học, vai trò tôi từng đảm nhiệm và cách năng lực được bồi đắp theo thời gian."
            />
            <div className="mt-10 border-t border-[#bebfba]">
              {experiences.map((exp, index) => (
                <article
                  key={exp.id}
                  className={
                    index === 1
                      ? "grid gap-4 border-b border-[#d6d7d2] bg-[#e9e9e5] px-5 py-7 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end"
                      : "grid gap-4 border-b border-[#d6d7d2] px-1 py-7 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end"
                  }
                >
                  <div>
                    <p className="text-base font-semibold">
                      {exp.role} · {exp.organization}
                    </p>
                    {exp.description && (
                      <p className="mt-2 max-w-2xl text-xs leading-6 text-[#6e716b]">
                        {exp.description}
                      </p>
                    )}
                  </div>
                  <p className="text-2xl font-medium tracking-[-0.04em] sm:text-3xl">
                    {formatPeriod(exp.startDate, exp.endDate)}
                  </p>
                </article>
              ))}
              {education.map((edu, index) => (
                <article
                  key={edu.id}
                  className={[
                    "grid gap-4 border-b border-[#d6d7d2] py-7 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end",
                    experiences.length === 0 && index === 1
                      ? "bg-[#e9e9e5] px-5"
                      : "px-1",
                  ].join(" ")}
                >
                  <div>
                    <p className="text-base font-semibold">
                      {[edu.degree, edu.field].filter(Boolean).join(" · ") ||
                        edu.school}
                    </p>
                    <p className="mt-2 text-xs leading-6 text-[#6e716b]">
                      {edu.school}
                    </p>
                  </div>
                  <p className="text-2xl font-medium tracking-[-0.04em] sm:text-3xl">
                    {formatYearRange(edu.startYear, edu.endYear)}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {projects.length > 0 && (
        <section
          id="du-an"
          className="mx-auto max-w-7xl scroll-mt-28 px-5 py-16 sm:px-8 sm:py-24"
        >
          <SectionHeading
            index="04"
            eyebrow="Portfolio"
            title="Những sản phẩm đại diện cho cách tôi suy nghĩ và thực thi."
            description="Mỗi dự án là một bài toán khác nhau, nhưng đều bắt đầu từ nhu cầu thật và được hoàn thiện bằng những quyết định có chủ đích."
          />
          <div className="mt-10 grid gap-x-4 gap-y-9 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, index) => (
              <article
                key={project.id}
                className={project.isFeatured ? "group md:col-span-2" : "group"}
              >
                <a
                  href={
                    project.demoUrl ||
                    project.repoUrl ||
                    project.imageUrl ||
                    "#du-an"
                  }
                  target={
                    project.demoUrl || project.repoUrl || project.imageUrl
                      ? "_blank"
                      : undefined
                  }
                  rel={
                    project.demoUrl || project.repoUrl || project.imageUrl
                      ? "noopener noreferrer"
                      : undefined
                  }
                  className={
                    project.imageUrl
                      ? "block overflow-hidden rounded-[1.25rem] bg-[#efefec] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ba4811]"
                      : "flex aspect-[4/3] flex-col justify-end rounded-[1.25rem] bg-[#111318] p-7 text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ba4811]"
                  }
                >
                  {project.imageUrl ? (
                    <img
                      src={project.imageUrl}
                      alt={"Giao diện dự án " + project.title}
                      className="aspect-[4/3] h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.025]"
                    />
                  ) : (
                    <>
                      <p className="font-roboto-mono text-[0.62rem] uppercase tracking-[0.14em] text-white/50">
                        Dự án {String(index + 1).padStart(2, "0")}
                      </p>
                      <p className="mt-4 text-3xl font-medium tracking-[-0.05em]">
                        {project.title}
                      </p>
                    </>
                  )}
                </a>
                <div className="mt-4 flex items-start justify-between gap-5">
                  <div>
                    <h3 className="text-lg font-semibold tracking-[-0.025em]">
                      {project.title}
                    </h3>
                    {project.description && (
                      <p className="mt-2 max-w-xl text-xs leading-6 text-[#747771]">
                        {project.description}
                      </p>
                    )}
                  </div>
                  <p className="shrink-0 font-roboto-mono text-[0.62rem] uppercase tracking-[0.1em] text-[#878a84]">
                    {project.role ||
                      (project.isFeatured ? "Tiêu biểu" : "Dự án")}
                  </p>
                </div>
                {project.techStack && project.techStack.length > 0 && (
                  <p className="mt-3 font-roboto-mono text-[0.6rem] uppercase leading-5 tracking-[0.1em] text-[#92958f]">
                    {project.techStack.join(" · ")}
                  </p>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      {achievements.length > 0 && (
        <section
          id="thanh-tich"
          className="mx-auto max-w-7xl scroll-mt-28 px-5 py-16 sm:px-8 sm:py-24"
        >
          <SectionHeading
            index="05"
            eyebrow="Ghi nhận"
            title="Những thành tích nhỏ tạo nên một hành trình lớn."
            description="Các cột mốc học tập và nghề nghiệp cho thấy sự tiến bộ qua từng giai đoạn, thay vì chỉ là những con số đứng riêng lẻ."
          />
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {achievements.map((item, index) => (
              <article
                key={item.id}
                className={
                  index === 0
                    ? "min-h-64 rounded-[1.25rem] bg-[#ba4811] p-6 text-white"
                    : "min-h-64 rounded-[1.25rem] border border-[#deded9] bg-[#fafaf8] p-6"
                }
              >
                <p
                  className={
                    index === 0
                      ? "font-roboto-mono text-xs text-white/65"
                      : "font-roboto-mono text-xs text-[#ba4811]"
                  }
                >
                  {item.year || "—"}
                </p>
                <h3 className="mt-12 text-lg font-semibold leading-6">
                  {item.link ? (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline decoration-current/30 underline-offset-4 hover:decoration-current focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current"
                    >
                      {item.title}
                    </a>
                  ) : (
                    item.title
                  )}
                </h3>
                {item.description && (
                  <p
                    className={
                      index === 0
                        ? "mt-4 text-sm leading-6 text-white/70"
                        : "mt-4 text-sm leading-6 text-[#6c6f69]"
                    }
                  >
                    {item.description}
                  </p>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      {contacts.length > 0 && (
        <section id="lien-he" className="scroll-mt-28 bg-[#111318] text-white">
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.42fr)] lg:items-end">
              <div>
                <p className="inline-flex rounded-full border border-white/20 px-3 py-1.5 font-roboto-mono text-[0.62rem] uppercase tracking-[0.12em] text-white/60">
                  06 · Liên hệ
                </p>
                <h2 className="mt-6 max-w-[14ch] text-[clamp(2.8rem,6vw,5.8rem)] font-medium leading-[0.92] tracking-[-0.065em]">
                  Cùng tạo nên điều đáng nhớ.
                </h2>
              </div>
              <div>
                <p className="max-w-sm text-sm leading-7 text-white/60">
                  Tôi luôn sẵn sàng cho cơ hội mới, dự án có ý nghĩa và những
                  cuộc trò chuyện thú vị.
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  {contacts.map((contact) => (
                    <a
                      key={contact.id}
                      href={getContactHref(contact)}
                      target={contact.type === "email" ? undefined : "_blank"}
                      rel={
                        contact.type === "email"
                          ? undefined
                          : "noopener noreferrer"
                      }
                      className="rounded-full border border-white/25 px-4 py-2.5 text-xs font-semibold transition-colors hover:border-[#ba4811] hover:bg-[#ba4811] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                    >
                      {contactLabels[contact.type] || contact.type}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
