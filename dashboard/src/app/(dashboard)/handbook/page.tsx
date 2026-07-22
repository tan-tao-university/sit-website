"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BookMarked, FileText, Pencil, Plus, Trash2 } from "lucide-react";
import { api, type Handbook } from "@/lib/api";
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

export default function HandbookPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [items, setItems] = useState<Handbook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setItems(await api.handbook.findAll(true));
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Không thể tải danh sách sổ tay" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete() {
    if (!deleteId) return;
    try {
      setIsDeleting(true);
      await api.handbook.remove(deleteId);
      toast({ title: "Đã xóa sổ tay" });
      await load();
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Không thể xóa sổ tay" });
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Sổ tay sinh viên</h2>
        <Button
          onClick={() => router.push("/handbook/create")}
          className="cursor-pointer"
        >
          <Plus className="mr-2 h-4 w-4" /> Tạo mới
        </Button>
      </div>
      <Card className="border-0 shadow-none">
        <CardHeader>
          <CardTitle>Các bản theo năm học</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-12 w-full" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground">
              Chưa có sổ tay nào
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Năm học</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>PDF gốc</TableHead>
                  <TableHead>Cập nhật</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow
                    key={item.id}
                    className="cursor-pointer"
                    onClick={() => router.push(`/handbook/${item.id}`)}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <BookMarked className="h-4 w-4 shrink-0 text-primary" />
                        {item.schoolYear}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          item.status === "published" ? "default" : "secondary"
                        }
                      >
                        {item.status === "published" ? "Đã xuất bản" : "Bản nháp"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      <span className="flex items-center gap-2">
                        {item.pdfUrlVi && (
                          <FileText className="h-4 w-4" aria-label="VI" />
                        )}
                        {[item.pdfUrlVi && "VI", item.pdfUrlEn && "EN"]
                          .filter(Boolean)
                          .join(" · ") || "—"}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Intl.DateTimeFormat("vi-VN", {
                        dateStyle: "medium",
                      }).format(new Date(item.updatedAt))}
                    </TableCell>
                    <TableCell
                      className="text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => router.push(`/handbook/${item.id}`)}
                          className="cursor-pointer"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => setDeleteId(item.id)}
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
            <AlertDialogTitle>Xóa sổ tay?</AlertDialogTitle>
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
