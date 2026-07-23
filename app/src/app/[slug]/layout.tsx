import Link from "next/link";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
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

export default async function StudentPortfolioLayout({
  children,
  params,
}: LayoutProps) {
  const { slug } = await params;
  const portfolio = await api.studentPortfolio
    .findBySlug(slug)
    .catch(() => null);
  if (!portfolio) notFound();

  const navItems = [
    portfolio.about && { href: "#gioi-thieu", label: "Về tôi" },
    portfolio.projects?.length && { href: "#du-an", label: "Dự án" },
    portfolio.skills?.length && { href: "#ky-nang", label: "Kỹ năng" },
    (portfolio.experiences?.length || portfolio.education?.length) && {
      href: "#hanh-trinh",
      label: "Hành trình",
    },
    portfolio.achievements?.length && {
      href: "#thanh-tich",
      label: "Thành tích",
    },
    portfolio.contacts?.length && { href: "#lien-he", label: "Liên hệ" },
  ].filter(Boolean) as Array<{ href: string; label: string }>;
  const email = portfolio.contacts?.find((contact) => contact.type === "email");
  const emailHref = email
    ? email.value.startsWith("mailto:")
      ? email.value
      : `mailto:${email.value}`
    : null;

  return (
    <div className="min-h-screen bg-white text-[#171b25]">
      <header className="sticky top-0 z-40 border-b border-[#e2e2de] bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-6 px-5 sm:px-8">
          <a
            href="#top"
            aria-label={`Về đầu portfolio của ${portfolio.fullName}`}
            className="flex items-center gap-3 text-sm font-semibold tracking-[-0.02em] text-[#111318] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ba4811]"
          >
            <span className="flex size-8 items-center justify-center rounded-full bg-[#111318] font-roboto-mono text-[0.62rem] tracking-[0.08em] text-white">
              {getInitials(portfolio.fullName)}
            </span>
            <span className="hidden sm:inline">{portfolio.fullName}</span>
          </a>

          {navItems.length > 0 && (
            <nav
              aria-label="Điều hướng portfolio"
              className="hidden items-center gap-7 md:flex"
            >
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="py-2 text-[0.7rem] font-medium text-[#555852] transition-colors hover:text-[#ba4811] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ba4811]"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          )}

          {emailHref ? (
            <a
              href={emailHref}
              className="rounded-full border border-[#bfc0bb] px-4 py-2.5 text-[0.7rem] font-semibold text-[#2f322e] transition-colors hover:border-[#ba4811] hover:bg-[#ba4811] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ba4811]"
            >
              Liên hệ
            </a>
          ) : (
            <Link
              href="/vi"
              className="rounded-full border border-[#d1d1cc] px-4 py-2.5 font-roboto-mono text-[0.6rem] uppercase tracking-[0.1em] text-[#666963] transition-colors hover:border-[#ba4811] hover:text-[#ba4811] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ba4811]"
            >
              SIT · TTU
            </Link>
          )}
        </div>
      </header>

      <div id="top">{children}</div>
    </div>
  );
}
