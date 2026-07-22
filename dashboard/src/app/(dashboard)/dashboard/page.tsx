"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  ChevronRight,
  FilePenLine,
  FileText,
  FlaskConical,
  MoreHorizontal,
  Plus,
  Users,
} from "lucide-react";
import {
  api,
  type News,
  type Program,
  type Research,
  type User,
} from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

type DashboardData = {
  users: User[];
  programs: Program[];
  news: News[];
  research: Research[];
};

type RecentItem = {
  id: string;
  title: string;
  type: "Bài viết" | "Chương trình" | "Nghiên cứu";
  status: string;
  updatedAt: string;
  href: string;
};

const emptyData: DashboardData = {
  users: [],
  programs: [],
  news: [],
  research: [],
};

const typeStyles = {
  "Bài viết": {
    icon: FileText,
    className: "bg-[#fbf0ea] text-primary",
  },
  "Chương trình": {
    icon: BookOpen,
    className: "bg-[#f3f6f0] text-[#64805e]",
  },
  "Nghiên cứu": {
    icon: FlaskConical,
    className: "bg-[#f7f4ef] text-[#7c6b5c]",
  },
} as const;

function toValidDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value: string) {
  const date = toValidDate(value);
  if (!date) return "Chưa xác định";

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function formatRelativeTime(value: string) {
  const date = toValidDate(value);
  if (!date) return "Vừa cập nhật";

  const elapsed = Date.now() - date.getTime();
  const hours = Math.max(1, Math.floor(elapsed / 3_600_000));

  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} ngày trước`;

  return formatDate(value);
}

function getStatusLabel(status: string) {
  const statusMap: Record<string, string> = {
    published: "Đã xuất bản",
    draft: "Bản nháp",
    archived: "Lưu trữ",
    active: "Đang hoạt động",
    inactive: "Tạm ẩn",
    ONGOING: "Đang thực hiện",
    COMPLETED: "Hoàn thành",
  };

  return statusMap[status] ?? "Đã cập nhật";
}

function chartPath(values: number[], maxValue: number) {
  const chartWidth = 680;
  const chartHeight = 176;
  const step = chartWidth / Math.max(values.length - 1, 1);

  return values
    .map((value, index) => {
      const x = 8 + index * step;
      const y = 12 + chartHeight - (value / maxValue) * chartHeight;
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData>(emptyData);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadDashboard = async () => {
      const [users, programs, news, research] = await Promise.allSettled([
        api.users.getAll(),
        api.programs.findAll(),
        api.news.findAll(),
        api.research.findAll(),
      ]);

      if (!active) return;

      setData({
        users: users.status === "fulfilled" ? users.value : [],
        programs: programs.status === "fulfilled" ? programs.value : [],
        news: news.status === "fulfilled" ? news.value : [],
        research: research.status === "fulfilled" ? research.value : [],
      });
      setIsLoading(false);
    };

    loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  const recentItems = useMemo<RecentItem[]>(() => {
    const items: RecentItem[] = [
      ...data.news.map((item) => ({
        id: item.id,
        title: item.title,
        type: "Bài viết" as const,
        status: item.status ?? "draft",
        updatedAt: item.updatedAt,
        href: `/news/${item.id}/view`,
      })),
      ...data.programs.map((item) => ({
        id: item.programId,
        title: item.nameVi,
        type: "Chương trình" as const,
        status: item.status ?? "inactive",
        updatedAt: item.updatedAt,
        href: `/programs/${item.programId}`,
      })),
      ...data.research.map((item) => ({
        id: item.id,
        title: item.title,
        type: "Nghiên cứu" as const,
        status: item.status ?? "ONGOING",
        updatedAt: item.updatedAt,
        href: `/research/${item.id}`,
      })),
    ];

    return items
      .sort(
        (first, second) =>
          (toValidDate(second.updatedAt)?.getTime() ?? 0) -
          (toValidDate(first.updatedAt)?.getTime() ?? 0),
      )
      .slice(0, 6);
  }, [data]);

  const chartData = useMemo(() => {
    const now = new Date();
    const months = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);
      return {
        key: `${date.getFullYear()}-${date.getMonth()}`,
        label: `Thg ${date.getMonth() + 1}`,
        published: 0,
        draft: 0,
      };
    });

    data.news.forEach((item) => {
      const date = new Date(item.publishedAt ?? item.createdAt);
      const month = months.find(
        (entry) => entry.key === `${date.getFullYear()}-${date.getMonth()}`,
      );
      if (!month) return;

      if (item.status === "published") month.published += 1;
      else month.draft += 1;
    });

    const maxValue = Math.max(
      4,
      ...months.flatMap((item) => [item.published, item.draft]),
    );

    return { months, maxValue };
  }, [data.news]);

  const kpis = [
    {
      label: "Người dùng",
      value: data.users.length,
      detail: `${data.users.filter((item) => item.isActive).length} đang hoạt động`,
      icon: Users,
    },
    {
      label: "Chương trình đào tạo",
      value: data.programs.length,
      detail: `${data.programs.filter((item) => item.status === "active").length} đang triển khai`,
      icon: BookOpen,
    },
    {
      label: "Tin tức & sự kiện",
      value: data.news.length,
      detail: `${data.news.filter((item) => item.status === "published").length} đã xuất bản`,
      icon: FileText,
    },
    {
      label: "Công trình nghiên cứu",
      value: data.research.length,
      detail: `${data.research.filter((item) => item.status === "ONGOING").length} đang thực hiện`,
      icon: FlaskConical,
    },
  ];

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-5 dashboard-reveal">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
            <span className="h-px w-5 bg-primary" />
            Không gian quản trị
          </div>
          <h1 className="text-[28px] font-semibold tracking-[-0.035em] text-stone-950 sm:text-[32px]">
            Tổng quan nội dung
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Theo dõi và điều phối dữ liệu của Khoa Công nghệ Thông tin.
          </p>
        </div>
        <Link
          href="/news/create"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(186,72,17,0.18)] transition-all hover:-translate-y-0.5 hover:bg-[#a63f0f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
        >
          <Plus className="h-4 w-4" />
          Tạo bài viết mới
        </Link>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi, index) => (
          <article
            key={kpi.label}
            className="group rounded-2xl border border-[#e8e2dc] bg-white p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#d9cec5] hover:shadow-[0_12px_32px_rgba(61,42,30,0.06)]"
            style={{ animationDelay: `${index * 70}ms` }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#fbf0ea] text-primary">
                <kpi.icon className="h-5 w-5 stroke-[1.7]" />
              </div>
              <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#edd8cc] text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                <ArrowRight className="h-3.5 w-3.5 -rotate-45" />
              </span>
            </div>
            <p className="mt-5 text-[13px] font-medium text-stone-600">
              {kpi.label}
            </p>
            <div className="mt-1 flex items-end justify-between gap-3">
              {isLoading ? (
                <Skeleton className="h-9 w-16" />
              ) : (
                <strong className="text-[30px] font-semibold tracking-[-0.04em] text-stone-950">
                  {kpi.value.toLocaleString("vi-VN")}
                </strong>
              )}
              {isLoading ? (
                <Skeleton className="mb-1 h-3 w-24" />
              ) : (
                <span className="mb-1 text-[11px] font-medium text-[#5f7b59]">
                  {kpi.detail}
                </span>
              )}
            </div>
          </article>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_330px]">
        <article className="overflow-hidden rounded-2xl border border-[#e8e2dc] bg-white">
          <div className="flex flex-col justify-between gap-4 border-b border-[#eee9e4] px-5 py-4 sm:flex-row sm:items-center sm:px-6">
            <div>
              <h2 className="text-base font-semibold tracking-[-0.02em] text-stone-950">
                Nhịp xuất bản
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Số lượng bài viết trong 6 tháng gần nhất
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs text-stone-600">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary" /> Đã xuất bản
              </span>
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#e9a17f]" /> Bản nháp
              </span>
              <span className="hidden items-center gap-2 rounded-lg border border-[#e8e2dc] px-2.5 py-1.5 sm:flex">
                <CalendarDays className="h-3.5 w-3.5" /> 6 tháng
              </span>
            </div>
          </div>

          <div className="px-4 pb-3 pt-5 sm:px-6">
            <div className="relative h-[270px] w-full">
              {isLoading && (
                <div className="absolute inset-0 z-10 flex flex-col justify-end gap-5 bg-white pb-8">
                  <Skeleton className="h-3 w-[92%]" />
                  <Skeleton className="h-3 w-[78%]" />
                  <Skeleton className="h-3 w-[86%]" />
                  <Skeleton className="h-3 w-[68%]" />
                </div>
              )}
              <div className="absolute inset-x-0 top-0 flex h-[218px] flex-col justify-between text-[10px] text-stone-400">
                {[chartData.maxValue, Math.ceil(chartData.maxValue / 2), 0].map(
                  (value) => (
                    <div key={value} className="flex items-center gap-3">
                      <span className="w-5 text-right">{value}</span>
                      <span className="h-px flex-1 bg-[#eee9e4]" />
                    </div>
                  ),
                )}
              </div>
              <svg
                aria-label="Biểu đồ số bài viết đã xuất bản và bản nháp"
                className="absolute left-8 right-2 top-1 h-[210px] w-[calc(100%_-_2.5rem)] overflow-visible"
                viewBox="0 0 700 210"
                preserveAspectRatio="none"
                role="img"
              >
                <path
                  d={`${chartPath(
                    chartData.months.map((item) => item.published),
                    chartData.maxValue,
                  )} L 688 200 L 8 200 Z`}
                  fill="rgba(186,72,17,0.06)"
                  stroke="none"
                />
                <path
                  d={chartPath(
                    chartData.months.map((item) => item.published),
                    chartData.maxValue,
                  )}
                  fill="none"
                  stroke="#BA4811"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3"
                  vectorEffect="non-scaling-stroke"
                />
                <path
                  d={chartPath(
                    chartData.months.map((item) => item.draft),
                    chartData.maxValue,
                  )}
                  fill="none"
                  stroke="#E9A17F"
                  strokeDasharray="6 7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
              <div className="absolute bottom-1 left-8 right-2 grid grid-cols-6 text-center text-[11px] text-stone-500">
                {chartData.months.map((item) => (
                  <span key={item.key}>{item.label}</span>
                ))}
              </div>
            </div>

            <div className="grid gap-3 border-t border-[#eee9e4] py-4 sm:grid-cols-3">
              <div>
                <p className="text-[11px] text-muted-foreground">Tổng bài viết</p>
                {isLoading ? (
                  <Skeleton className="mt-2 h-6 w-10" />
                ) : (
                  <p className="mt-1 text-lg font-semibold text-stone-900">
                    {data.news.length}
                  </p>
                )}
              </div>
              <div className="border-[#eee9e4] sm:border-l sm:pl-5">
                <p className="text-[11px] text-muted-foreground">Đã xuất bản</p>
                {isLoading ? (
                  <Skeleton className="mt-2 h-6 w-10" />
                ) : (
                  <p className="mt-1 text-lg font-semibold text-stone-900">
                    {
                      data.news.filter((item) => item.status === "published")
                        .length
                    }
                  </p>
                )}
              </div>
              <div className="border-[#eee9e4] sm:border-l sm:pl-5">
                <p className="text-[11px] text-muted-foreground">Bản nháp</p>
                {isLoading ? (
                  <Skeleton className="mt-2 h-6 w-10" />
                ) : (
                  <p className="mt-1 text-lg font-semibold text-stone-900">
                    {data.news.filter((item) => item.status === "draft").length}
                  </p>
                )}
              </div>
            </div>
          </div>
        </article>

        <aside className="rounded-2xl border border-[#e8e2dc] bg-white">
          <div className="flex items-center justify-between border-b border-[#eee9e4] px-5 py-[18px]">
            <div>
              <h2 className="text-base font-semibold tracking-[-0.02em] text-stone-950">
                Hoạt động gần đây
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Cập nhật mới nhất trong hệ thống
              </p>
            </div>
            <MoreHorizontal className="h-5 w-5 text-stone-400" />
          </div>
          <div className="divide-y divide-[#eee9e4] px-5">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex gap-3 py-4">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <Skeleton className="mt-1 h-10 flex-1 rounded-lg" />
                </div>
              ))
            ) : recentItems.length > 0 ? (
              recentItems.slice(0, 5).map((item) => {
                const style = typeStyles[item.type];
                const ItemIcon = style.icon;
                return (
                  <Link
                    key={`${item.type}-${item.id}`}
                    href={item.href}
                    className="group flex gap-3 py-4"
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${style.className}`}
                    >
                      <ItemIcon className="h-4 w-4 stroke-[1.8]" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="line-clamp-2 text-xs font-medium leading-5 text-stone-800 group-hover:text-primary">
                        {item.title}
                      </span>
                      <span className="mt-1 block text-[10px] text-stone-400">
                        {formatRelativeTime(item.updatedAt)}
                      </span>
                    </span>
                    <ChevronRight className="mt-2 h-4 w-4 shrink-0 text-stone-300 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                  </Link>
                );
              })
            ) : (
              <div className="py-12 text-center">
                <FilePenLine className="mx-auto h-7 w-7 text-stone-300" />
                <p className="mt-3 text-xs text-muted-foreground">
                  Chưa có hoạt động mới.
                </p>
              </div>
            )}
          </div>
        </aside>
      </section>

      <section className="overflow-hidden rounded-2xl border border-[#e8e2dc] bg-white">
        <div className="flex items-center justify-between border-b border-[#eee9e4] px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-base font-semibold tracking-[-0.02em] text-stone-950">
              Nội dung cập nhật mới nhất
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Theo dõi trạng thái nội dung trong một danh sách tập trung
            </p>
          </div>
          <Link
            href="/news"
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            Xem tất cả <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left">
            <thead>
              <tr className="border-b border-[#eee9e4] bg-[#fdfbf9] text-[10px] uppercase tracking-[0.12em] text-stone-500">
                <th className="px-6 py-3 font-medium">Nội dung</th>
                <th className="px-4 py-3 font-medium">Loại</th>
                <th className="px-4 py-3 font-medium">Trạng thái</th>
                <th className="px-4 py-3 font-medium">Cập nhật</th>
                <th className="w-16 px-4 py-3 font-medium">Mở</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0ece8]">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4" colSpan={5}>
                      <Skeleton className="h-5 w-full" />
                    </td>
                  </tr>
                ))
              ) : recentItems.length > 0 ? (
                recentItems.map((item) => {
                  const style = typeStyles[item.type];
                  const ItemIcon = style.icon;
                  const statusLabel = getStatusLabel(item.status);
                  const isPositive = [
                    "published",
                    "active",
                    "COMPLETED",
                  ].includes(item.status);

                  return (
                    <tr
                      key={`${item.type}-${item.id}`}
                      className="group text-xs transition-colors hover:bg-[#fdfbf9]"
                    >
                      <td className="max-w-[440px] px-6 py-3.5">
                        <Link
                          href={item.href}
                          className="line-clamp-1 font-medium text-stone-800 group-hover:text-primary"
                        >
                          {item.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center gap-2 text-stone-600">
                          <span
                            className={`flex h-7 w-7 items-center justify-center rounded-lg ${style.className}`}
                          >
                            <ItemIcon className="h-3.5 w-3.5" />
                          </span>
                          {item.type}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold ${
                            isPositive
                              ? "border-[#cfe2cb] bg-[#f2f8f0] text-[#53724d]"
                              : "border-[#ead8cd] bg-[#fbf5f1] text-[#8f4c2b]"
                          }`}
                        >
                          {statusLabel}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-stone-500">
                        {formatDate(item.updatedAt)}
                      </td>
                      <td className="px-4 py-3.5">
                        <Link
                          aria-label={`Mở ${item.title}`}
                          href={item.href}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e8e2dc] text-stone-500 transition-colors hover:border-primary hover:text-primary"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-xs text-muted-foreground">
                    Chưa có nội dung để hiển thị.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
