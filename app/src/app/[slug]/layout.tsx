import Link from "next/link";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
};

export default async function StudentPortfolioLayout({
  children,
  params,
}: LayoutProps) {
  const { slug } = await params;

  const portfolio = await api.studentPortfolio.findBySlug(slug).catch(() => null);
  if (!portfolio) notFound();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-4 sm:px-8">
          <Link
            href="/vi"
            className="font-roboto-mono text-xs uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-primary"
          >
            ← SIT · Đại học Tân Tạo
          </Link>
          <span className="truncate text-sm font-semibold">
            {portfolio.fullName}
          </span>
        </div>
      </header>

      {children}

      <footer className="border-t border-border">
        <div className="mx-auto max-w-4xl px-5 py-8 text-center sm:px-8">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} {portfolio.fullName} · Portfolio sinh
            viên tại{" "}
            <Link href="/vi" className="underline hover:text-primary">
              Khoa Công nghệ Thông tin, Đại học Tân Tạo
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
