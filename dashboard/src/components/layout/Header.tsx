"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bell,
  BookMarked,
  BookOpen,
  ChevronDown,
  FileText,
  GraduationCap,
  Home,
  IdCard,
  LogOut,
  Menu,
  Search,
  Trophy,
  UserCog,
  Users,
  CalendarDays,
  PanelTopOpen,
  BriefcaseBusiness,
} from "lucide-react";
import { api, type User } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { ActionLoadingLabel } from "@/components/shared/LoadingStates";

interface HeaderProps {
  onMenuClick?: () => void;
}

const navGroups = [
  {
    label: "Người dùng",
    icon: Users,
    routes: [
      { label: "Người dùng", href: "/users", icon: Users },
      { label: "Giảng viên", href: "/faculty", icon: UserCog },
      { label: "Cựu sinh viên", href: "/alumni", icon: GraduationCap },
      { label: "Portfolio sinh viên", href: "/student-portfolio", icon: IdCard },
    ],
  },
  {
    label: "Đào tạo",
    icon: BookOpen,
    routes: [
      { label: "Chương trình", href: "/programs", icon: BookOpen },
      { label: "Khung chương trình", href: "/curriculums", icon: FileText },
      { label: "Khoá học", href: "/courses", icon: GraduationCap },
    ],
  },
  {
    label: "Nội dung",
    icon: FileText,
    routes: [
      { label: "Tin tức", href: "/news", icon: FileText },
      { label: "Sự kiện", href: "/events", icon: CalendarDays },
      {
        label: "Việc làm & thực tập",
        href: "/career-opportunities",
        icon: BriefcaseBusiness,
      },
      {
        label: "Banner popup",
        href: "/popup-banners",
        icon: PanelTopOpen,
      },
      { label: "Nghiên cứu", href: "/research", icon: GraduationCap },
      { label: "Thành tích", href: "/achievements", icon: Trophy },
      { label: "Sổ tay sinh viên", href: "/handbook", icon: BookMarked },
    ],
  },
];

export function Header({ onMenuClick }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    let active = true;

    const loadUser = async () => {
      try {
        const userData = await api.auth.getCurrentUser();
        if (active) setUser(userData);
      } catch (error: unknown) {
        console.error("Failed to fetch user:", error);
        if (error instanceof Error && error.message === "UNAUTHORIZED") {
          await api.auth.logout();
          router.push("/login");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadUser();

    return () => {
      active = false;
    };
  }, [router]);

  const handleLogout = async () => {
    const { id, update } = toast({
      variant: "loading",
      title: "Đang đăng xuất",
      description: "Phiên làm việc của bạn đang được kết thúc an toàn.",
    });

    try {
      setIsLoggingOut(true);
      await api.auth.logout();
      update({
        id,
        title: "Đã đăng xuất",
        description: "Hẹn gặp lại bạn trong phiên làm việc tiếp theo.",
      });
      router.push("/login");
    } catch (error) {
      console.error("Logout failed", error);
      update({
        id,
        variant: "destructive",
        title: "Không thể đăng xuất",
        description: "Vui lòng thử lại sau ít phút.",
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const getRoleDisplay = (roles: string[]) => {
    if (roles.length === 0) return "Người dùng";
    const roleMap: Record<string, string> = {
      admin: "Quản trị viên",
      student: "Sinh viên",
      parent: "Phụ huynh",
    };
    return roleMap[roles[0]] || roles[0];
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[#e8e2dc] bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-[88px] w-full max-w-[1800px] items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/dashboard"
          className="flex shrink-0 items-center gap-2 xl:mr-2"
        >
          <img src="/assets/logo.png" alt="SIT" className="h-12 w-12" />
          <div className="hidden flex-col gap-y-0.5 sm:flex">
            <span className="text-base font-semibold uppercase tracking-[0.2em] text-[#ba4911]">
              ĐẠI HỌC TÂN TẠO
            </span>
            <span className="h-[1px] w-full bg-[#ba4911]" />
            <span className="text-base font-bold text-[#ba4911]">
              Khoa Công Nghệ Thông Tin
            </span>
          </div>
        </Link>

        <nav
          aria-label="Điều hướng quản trị"
          className="hidden flex-1 items-center justify-center gap-2 xl:flex"
        >
          <Link
            href="/dashboard"
            className={cn(
              "inline-flex h-10 items-center gap-2 rounded-full border px-4 text-[13px] font-semibold transition-all",
              pathname === "/dashboard"
                ? "border-primary bg-[#fffaf7] text-primary shadow-[0_5px_16px_rgba(186,72,17,0.08)]"
                : "border-[#e8e2dc] bg-white text-stone-600 hover:border-[#d8c8bd] hover:text-primary",
            )}
          >
            <Home className="h-4 w-4" />
            Tổng quan
          </Link>

          {navGroups.map((group) => {
            const isActive = group.routes.some((route) =>
              pathname.startsWith(route.href),
            );

            return (
              <DropdownMenu key={group.label}>
                <DropdownMenuTrigger asChild>
                  <button
                    className={cn(
                      "inline-flex h-10 items-center gap-2 rounded-full border px-4 text-[13px] font-medium outline-none transition-all focus-visible:ring-2 focus-visible:ring-primary/20",
                      isActive
                        ? "border-primary bg-[#fffaf7] text-primary shadow-[0_5px_16px_rgba(186,72,17,0.08)]"
                        : "border-[#e8e2dc] bg-white text-stone-600 hover:border-[#d8c8bd] hover:text-primary",
                    )}
                  >
                    <group.icon className="h-4 w-4 stroke-[1.8]" />
                    {group.label}
                    <ChevronDown className="h-3.5 w-3.5 text-stone-400" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="w-56 space-y-1 rounded-xl border-[#e8e2dc] p-2 shadow-[0_18px_50px_rgba(42,31,23,0.12)]"
                >
                  {group.routes.map((route) => (
                    <DropdownMenuItem key={route.href} asChild>
                      <Link
                        href={route.href}
                        className={cn(
                          "flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-xs",
                          pathname.startsWith(route.href) &&
                            "bg-[#fbf0ea] text-primary",
                        )}
                      >
                        <route.icon className="h-4 w-4" />
                        {route.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <div className="relative hidden w-[250px] min-[1420px]:block">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <Input
              placeholder="Tìm kiếm nội dung..."
              className="h-10 rounded-xl border-[#e8e2dc] bg-[#fdfbf9] pl-10 shadow-none placeholder:text-stone-400 focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/10"
            />
          </div>

          <Button
            variant="ghost"
            size="icon"
            aria-label="Thông báo"
            className="relative rounded-xl border border-[#e8e2dc] bg-white hover:bg-[#fdfbf9]"
          >
            <Bell className="h-[18px] w-[18px]" />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary ring-2 ring-white" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            aria-label="Mở menu"
            className="rounded-xl border border-[#e8e2dc] xl:hidden"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="hidden items-center border-l border-border pl-3 sm:flex">
            {loading ? (
              <>
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="ml-2 hidden space-y-1 lg:block">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-2.5 w-14" />
                </div>
              </>
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2.5 rounded-xl px-1.5 py-1 text-left transition-colors hover:bg-[#fdfbf9] lg:pr-2">
                    <Avatar className="h-9 w-9 border border-[#e8e2dc]">
                      <AvatarImage src={user.avatarUrl || undefined} />
                      <AvatarFallback>{getInitials(user.fullName)}</AvatarFallback>
                    </Avatar>
                    <div className="hidden lg:block">
                      <p className="max-w-[116px] truncate text-xs font-semibold leading-tight text-stone-800">
                        {user.fullName}
                      </p>
                      <p className="mt-0.5 text-[10px] text-muted-foreground">
                        {getRoleDisplay(user.roles)}
                      </p>
                    </div>
                    <ChevronDown className="hidden h-3.5 w-3.5 text-stone-400 lg:block" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-xl">
                  <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    disabled={isLoggingOut}
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    {isLoggingOut ? (
                      <ActionLoadingLabel label="Đang đăng xuất" />
                    ) : (
                      <span>Đăng xuất</span>
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Avatar className="h-9 w-9 border border-[#e8e2dc]">
                <AvatarFallback>?</AvatarFallback>
              </Avatar>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
