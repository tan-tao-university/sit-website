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

function getContactDisplay(contact: StudentPortfolioContact) {
  return contact.value.replace(/^mailto:/, "").replace(/^https?:\/\//, "");
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

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const portfolio = await api.studentPortfolio.findBySlug(slug).catch(() => null);

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
  const portfolio = await api.studentPortfolio.findBySlug(slug).catch(() => null);
  if (!portfolio) notFound();

  const p: StudentPortfolio = portfolio;

  const skills = [...(p.skills || [])].sort(byOrder);
  const skillGroups = skills.reduce<Record<string, typeof skills>>((acc, skill) => {
    const key = skill.category || "Kỹ năng";
    (acc[key] ||= []).push(skill);
    return acc;
  }, {});

  const projects = [...(p.projects || [])].sort(
    (a, b) => Number(b.isFeatured) - Number(a.isFeatured) || byOrder(a, b),
  );
  const experiences = [...(p.experiences || [])].sort(byOrder);
  const education = [...(p.education || [])].sort(byOrder);
  const achievements = [...(p.achievements || [])].sort(byOrder);
  const contacts = [...(p.contacts || [])].sort(byOrder);

  return (
    <main className="mx-auto max-w-4xl px-5 sm:px-8">
      {/* Hero */}
      <section className="flex flex-col items-center py-16 text-center sm:py-24">
        {p.avatarUrl ? (
          <img
            src={p.avatarUrl}
            alt={p.fullName}
            className="h-28 w-28 rounded-full border border-border object-cover sm:h-32 sm:w-32"
          />
        ) : (
          <div className="flex h-28 w-28 items-center justify-center rounded-full bg-muted text-2xl font-bold text-primary sm:h-32 sm:w-32">
            {p.fullName
              .trim()
              .split(/\s+/)
              .slice(-2)
              .map((part) => part.charAt(0))
              .join("")
              .toUpperCase()}
          </div>
        )}

        <h1 className="mt-6 text-3xl font-bold tracking-tight text-balance sm:text-5xl">
          Xin chào, mình là {p.fullName.split(" ").pop()}
        </h1>
        {p.title && (
          <p className="mt-3 text-lg font-medium text-primary sm:text-xl">
            {p.title}
          </p>
        )}
        {p.shortBio && (
          <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground">
            {p.shortBio}
          </p>
        )}
        <p className="mt-3 font-roboto-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
          {[p.program, p.studentYear && `Khóa ${p.studentYear}`, p.location]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </section>

      {/* About */}
      {p.about && (
        <section className="border-t border-border py-14 sm:py-16">
          <p className="font-roboto-mono text-xs uppercase tracking-[0.16em] text-primary">
            Giới thiệu
          </p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
            Về mình
          </h2>
          <p className="mt-6 max-w-[68ch] whitespace-pre-line text-base leading-8 text-muted-foreground">
            {p.about}
          </p>
        </section>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <section className="border-t border-border py-14 sm:py-16">
          <p className="font-roboto-mono text-xs uppercase tracking-[0.16em] text-primary">
            Chuyên môn
          </p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
            Kỹ năng
          </h2>
          <div className="mt-8 space-y-6">
            {Object.entries(skillGroups).map(([category, items]) => (
              <div key={category}>
                <h3 className="text-sm font-semibold text-foreground">
                  {category}
                </h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {items.map((skill) => (
                    <span
                      key={skill.id}
                      className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-card-foreground"
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <section className="border-t border-border py-14 sm:py-16">
          <p className="font-roboto-mono text-xs uppercase tracking-[0.16em] text-primary">
            Sản phẩm
          </p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
            Dự án
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {projects.map((project) => (
              <article
                key={project.id}
                className="overflow-hidden rounded-lg border border-border bg-card"
              >
                {project.imageUrl && (
                  <img
                    src={project.imageUrl}
                    alt={project.title}
                    className="aspect-video w-full object-cover"
                  />
                )}
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-card-foreground">
                    {project.title}
                  </h3>
                  {project.role && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {project.role}
                    </p>
                  )}
                  {project.description && (
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                      {project.description}
                    </p>
                  )}
                  {project.techStack && project.techStack.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {project.techStack.map((tech) => (
                        <span
                          key={tech}
                          className="rounded-md bg-muted px-2 py-0.5 font-roboto-mono text-[0.68rem] uppercase tracking-[0.08em] text-muted-foreground"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                  {(project.demoUrl || project.repoUrl) && (
                    <div className="mt-4 flex gap-4">
                      {project.demoUrl && (
                        <a
                          href={project.demoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-semibold text-primary hover:underline"
                        >
                          Xem demo
                        </a>
                      )}
                      {project.repoUrl && (
                        <a
                          href={project.repoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-semibold text-primary hover:underline"
                        >
                          Mã nguồn
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Experience */}
      {experiences.length > 0 && (
        <section className="border-t border-border py-14 sm:py-16">
          <p className="font-roboto-mono text-xs uppercase tracking-[0.16em] text-primary">
            Thực tế
          </p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
            Kinh nghiệm
          </h2>
          <div className="mt-8 space-y-8">
            {experiences.map((exp) => (
              <div key={exp.id} className="grid gap-1 sm:grid-cols-[10rem_1fr] sm:gap-8">
                <p className="font-roboto-mono text-sm text-primary">
                  {formatPeriod(exp.startDate, exp.endDate)}
                </p>
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    {exp.role} · {exp.organization}
                  </h3>
                  {exp.description && (
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">
                      {exp.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {education.length > 0 && (
        <section className="border-t border-border py-14 sm:py-16">
          <p className="font-roboto-mono text-xs uppercase tracking-[0.16em] text-primary">
            Học vấn
          </p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
            Quá trình học tập
          </h2>
          <div className="mt-8 space-y-8">
            {education.map((edu) => (
              <div key={edu.id} className="grid gap-1 sm:grid-cols-[10rem_1fr] sm:gap-8">
                <p className="font-roboto-mono text-sm text-primary">
                  {formatYearRange(edu.startYear, edu.endYear)}
                </p>
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    {[edu.degree, edu.field].filter(Boolean).join(" · ") ||
                      edu.school}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {edu.school}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Achievements */}
      {achievements.length > 0 && (
        <section className="border-t border-border py-14 sm:py-16">
          <p className="font-roboto-mono text-xs uppercase tracking-[0.16em] text-primary">
            Ghi nhận
          </p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
            Thành tích
          </h2>
          <div className="mt-8 space-y-6">
            {achievements.map((item) => (
              <div key={item.id} className="grid gap-1 sm:grid-cols-[5rem_1fr] sm:gap-8">
                <p className="font-roboto-mono text-sm text-primary">
                  {item.year || "—"}
                </p>
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    {item.link ? (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-primary hover:underline"
                      >
                        {item.title}
                      </a>
                    ) : (
                      item.title
                    )}
                  </h3>
                  {item.description && (
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Contact */}
      {contacts.length > 0 && (
        <section className="border-t border-border py-14 sm:py-20">
          <p className="font-roboto-mono text-xs uppercase tracking-[0.16em] text-primary">
            Kết nối
          </p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
            Liên hệ
          </h2>
          <div className="mt-8 flex flex-wrap gap-3">
            {contacts.map((contact) => (
              <a
                key={contact.id}
                href={getContactHref(contact)}
                target={contact.type === "email" ? undefined : "_blank"}
                rel={contact.type === "email" ? undefined : "noopener noreferrer"}
                className="rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-card-foreground transition-colors hover:border-primary hover:text-primary"
              >
                {contactLabels[contact.type] || contact.type}
                <span className="ml-2 text-muted-foreground">
                  {getContactDisplay(contact)}
                </span>
              </a>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
