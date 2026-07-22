"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { api, type Event, type EventStatus } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const statusLabel: Record<EventStatus, string> = {
  draft: "Bản nháp",
  published: "Đã xuất bản",
  cancelled: "Đã hủy",
};

export default function EventsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [status, setStatus] = useState<"all" | EventStatus>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const loadEvents = useCallback(async () => {
    try {
      setIsLoading(true);
      setEvents(
        await api.events.findAll(status === "all" ? undefined : status),
      );
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Không thể tải danh sách sự kiện",
      });
    } finally {
      setIsLoading(false);
    }
  }, [status, toast]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  async function handleDelete() {
    if (!deleteId) return;
    try {
      setIsDeleting(true);
      await api.events.remove(deleteId);
      toast({ title: "Đã xóa sự kiện" });
      await loadEvents();
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Không thể xóa sự kiện" });
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Sự kiện</h2>
        <Button
          onClick={() => router.push("/events/create")}
          className="cursor-pointer"
        >
          <Plus className="mr-2 h-4 w-4" /> Tạo mới
        </Button>
      </div>
      <Card className="border-0 shadow-none">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Danh sách sự kiện</CardTitle>
          <Select
            value={status}
            onValueChange={(value) => setStatus(value as "all" | EventStatus)}
          >
            <SelectTrigger className="w-44 shadow-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="draft">Bản nháp</SelectItem>
              <SelectItem value="published">Đã xuất bản</SelectItem>
              <SelectItem value="cancelled">Đã hủy</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-12 w-full" />
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground">
              Chưa có sự kiện nào
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sự kiện</TableHead>
                  <TableHead>Thời gian</TableHead>
                  <TableHead>Địa điểm</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => (
                  <TableRow
                    key={event.id}
                    className="cursor-pointer"
                    onClick={() => router.push(`/events/${event.id}/view`)}
                  >
                    <TableCell className="max-w-sm font-medium">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 shrink-0 text-primary" />
                        <span className="truncate">{event.titleVi}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Intl.DateTimeFormat("vi-VN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(new Date(event.startAt))}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {event.locationVi}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          event.status === "published"
                            ? "default"
                            : event.status === "cancelled"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {statusLabel[event.status]}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className="text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => router.push(`/events/${event.id}/view`)}
                          className="cursor-pointer"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => router.push(`/events/${event.id}`)}
                          className="cursor-pointer"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => setDeleteId(event.id)}
                          className="cursor-pointer"
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
            <AlertDialogTitle>Xóa sự kiện?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác.
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
