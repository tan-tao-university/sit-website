"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ExternalLink, Pencil, Plus, Trash2 } from "lucide-react";
import { api, type PopupBanner } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ActionLoadingLabel } from "@/components/shared/LoadingStates";

const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
  dateStyle: "medium",
  timeStyle: "short",
});

function getScheduleLabel(banner: PopupBanner) {
  if (banner.startsAt && banner.endsAt) {
    return `${dateFormatter.format(new Date(banner.startsAt))} – ${dateFormatter.format(new Date(banner.endsAt))}`;
  }
  if (banner.startsAt) {
    return `Từ ${dateFormatter.format(new Date(banner.startsAt))}`;
  }
  if (banner.endsAt) {
    return `Đến ${dateFormatter.format(new Date(banner.endsAt))}`;
  }
  return "Không giới hạn";
}

export default function PopupBannersPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [banners, setBanners] = useState<PopupBanner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const loadBanners = useCallback(async () => {
    try {
      setIsLoading(true);
      setBanners(await api.popupBanners.findAll());
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Không thể tải danh sách banner popup",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadBanners();
  }, [loadBanners]);

  async function handleDelete() {
    if (!deleteId) return;
    try {
      setIsDeleting(true);
      await api.popupBanners.remove(deleteId);
      toast({ title: "Đã xóa banner popup" });
      await loadBanners();
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Không thể xóa banner popup" });
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Banner popup</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Quản lý banner xuất hiện khi người dùng truy cập website. Chỉ một
            banner được hoạt động tại một thời điểm.
          </p>
        </div>
        <Button
          onClick={() => router.push("/popup-banners/create")}
          className="cursor-pointer"
        >
          <Plus className="mr-2 h-4 w-4" /> Tạo banner
        </Button>
      </div>

      <Card className="border-0 shadow-none">
        <CardHeader>
          <CardTitle>Danh sách chiến dịch</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-20 w-full" />
              ))}
            </div>
          ) : banners.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              Chưa có banner popup nào
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Banner</TableHead>
                  <TableHead>Liên kết đích</TableHead>
                  <TableHead>Lịch hiển thị</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {banners.map((banner) => (
                  <TableRow key={banner.id}>
                    <TableCell>
                      <div className="flex min-w-64 items-center gap-4">
                        <div className="h-16 w-28 shrink-0 overflow-hidden rounded-md border bg-muted">
                          <Image
                            src={banner.imageUrl}
                            alt={banner.imageAltVi || banner.titleVi}
                            width={112}
                            height={64}
                            unoptimized
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium">{banner.titleVi}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Cập nhật {dateFormatter.format(new Date(banner.updatedAt))}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-72">
                      <a
                        href={banner.linkUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex max-w-full cursor-pointer items-center gap-1.5 text-primary hover:underline"
                      >
                        <span className="truncate">{banner.linkUrl}</span>
                        <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                      </a>
                    </TableCell>
                    <TableCell className="max-w-72 text-sm text-muted-foreground">
                      {getScheduleLabel(banner)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={banner.isActive ? "default" : "secondary"}>
                        {banner.isActive ? "Đang hiển thị" : "Đang ẩn"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            router.push(`/popup-banners/${banner.id}`)
                          }
                          className="cursor-pointer"
                          aria-label={`Sửa ${banner.titleVi}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => setDeleteId(banner.id)}
                          className="cursor-pointer"
                          aria-label={`Xóa ${banner.titleVi}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={Boolean(deleteId)}
        onOpenChange={() => !isDeleting && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa banner popup?</AlertDialogTitle>
            <AlertDialogDescription>
              Banner sẽ bị xóa vĩnh viễn và không còn hiển thị trên website.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? <ActionLoadingLabel label="Đang xóa" /> : "Xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
