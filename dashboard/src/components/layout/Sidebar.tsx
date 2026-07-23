"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Layers,
  FileText,
  GraduationCap,
  Trophy,
  UserCog,
  CalendarDays,
  PanelTopOpen,
  BookMarked,
  BriefcaseBusiness,
  IdCard,
} from "lucide-react";

import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();

  const routes = [
    {
      label: "Bảng điều khiển", // Dashboard
      icon: LayoutDashboard,
      href: "/dashboard",
    },
    {
      label: "Người dùng", // Users
      icon: Users,
      href: "/users",
    },
    {
      label: "Giảng viên", // Faculty
      icon: UserCog,
      href: "/faculty",
    },
    {
      label: "Chương trình", // Programs
      icon: BookOpen,
      href: "/programs",
    },
    {
      label: "Khung chương trình", // Curriculums
      icon: Layers,
      href: "/curriculums",
    },
    {
      label: "Khoá học", // Courses
      icon: FileText,
      href: "/courses",
    },
    {
      label: "Tin tức", // News
      icon: FileText,
      href: "/news",
    },
    {
      label: "Sự kiện",
      icon: CalendarDays,
      href: "/events",
    },
    {
      label: "Sổ tay sinh viên", // Student handbook
      icon: BookMarked,
      href: "/handbook",
    },
    {
      label: "Việc làm & thực tập",
      icon: BriefcaseBusiness,
      href: "/career-opportunities",
    },
    {
      label: "Banner popup",
      icon: PanelTopOpen,
      href: "/popup-banners",
    },
    {
      label: "Nghiên cứu", // Research
      icon: GraduationCap,
      href: "/research",
    },
    {
      label: "Thành tích", // Achievements
      icon: Trophy,
      href: "/achievements",
    },
    {
      label: "Cựu sinh viên", // Alumni
      icon: Users,
      href: "/alumni",
    },
    {
      label: "Portfolio sinh viên", // Student portfolio
      icon: IdCard,
      href: "/student-portfolio",
    },
  ];

  return (
    <div className="flex h-full flex-col border-r border-sidebar-border bg-sidebar py-4 text-sidebar-foreground">
      <div className="flex-1 px-3 py-2">
        <Link href={"/dashboard"} className="flex items-center gap-2 mb-10">
          <img src="/assets/logo.png" alt="SIT" className="h-12 w-12" />
          <div className="flex flex-col gap-y-0.5">
            <span className="text-base font-semibold uppercase tracking-[0.2em] text-[#ba4911]">
              ĐẠI HỌC TÂN TẠO
            </span>
            <span className="h-[1px] w-full bg-[#ba4911]" />
            <span className="text-base font-bold text-[#ba4911]">
              Khoa Công Nghệ Thông Tin
            </span>
          </div>
        </Link>
        <div className="space-y-1">
          <h2 className="mb-3 px-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Quản lý
          </h2>
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "group relative flex w-full cursor-pointer items-center justify-start rounded-xl px-3 py-2.5 text-[13px] font-medium transition-colors duration-200 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                pathname === route.href
                  ? "bg-sidebar-accent text-sidebar-accent-foreground before:absolute before:-left-3 before:h-6 before:w-[3px] before:rounded-r-full before:bg-primary"
                  : "text-stone-600",
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon
                  className={cn(
                    "mr-3 h-[18px] w-[18px] stroke-[1.7] transition-colors",
                    pathname === route.href
                      ? "text-primary"
                      : "text-stone-500 group-hover:text-primary",
                  )}
                />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
