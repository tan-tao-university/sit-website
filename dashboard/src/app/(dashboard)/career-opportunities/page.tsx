"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BriefcaseBusiness, Pencil, Plus, Trash2 } from "lucide-react";
import {
  api,
  type CareerOpportunity,
  type CareerOpportunityStatus,
  type CareerOpportunityType,
} from "@/lib/api";
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

const statusLabel: Record<CareerOpportunityStatus, string> = {
  draft: "Bản nháp",
  published: "Đang hiển thị",
  closed: "Đã đóng",
};

function isVisibleOnWebsite(item: CareerOpportunity) {
  if (item.status !== "published") return false;
  if (!item.applicationDeadline) return true;
  return new Date(item.applicationDeadline) >= new Date();
}

const typeLabel: Record<CareerOpportunityType, string> = {
  internship: "Thực tập",
  full_time: "Toàn thời gian",
  part_time: "Bán thời gian",
  contract: "Hợp đồng",
};

export default function CareerOpportunitiesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [items, setItems] = useState<CareerOpportunity[]>([]);
  const [status, setStatus] = useState<"all" | CareerOpportunityStatus>("all");
  const [type, setType] = useState<"all" | CareerOpportunityType>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const loadItems = useCallback(async () => {
    try {
      setIsLoading(true);
      setItems(
        await api.careerOpportunities.findAll({
          status: status === "all" ? undefined : status,
          type: type === "all" ? undefined : type,
        }),
      );
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Không thể tải danh sách việc làm & thực tập",
      });
    } finally {
      setIsLoading(false);
    }
  }, [status, toast, type]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  async function handleDelete() {
    if (!deleteId) return;
    try {
      setIsDeleting(true);
      await api.careerOpportunities.remove(deleteId);
      toast({ title: "Đã xóa cơ hội nghề nghiệp" });
      await loadItems();
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Không thể xóa cơ hội" });
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Việc làm & thực tập
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Quản lý các cơ hội đang hiển thị trên website Khoa CNTT.
          </p>
        </div>
        <Button
          onClick={() => router.push("/career-opportunities/create")}
          className="cursor-pointer"
        >
          <Plus className="mr-2 h-4 w-4" /> Tạo cơ hội
        </Button>
      </div>

      <Card className="border-0 shadow-none">
        <CardHeader className="flex-row items-center justify-between gap-4">
          <CardTitle>Danh sách cơ hội</CardTitle>
          <div className="flex gap-3">
            <Select
              value={type}
              onValueChange={(value) =>
                setType(value as "all" | CareerOpportunityType)
              }
            >
              <SelectTrigger className="w-44 shadow-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả loại hình</SelectItem>
                <SelectItem value="internship">Thực tập</SelectItem>
                <SelectItem value="full_time">Toàn thời gian</SelectItem>
                <SelectItem value="part_time">Bán thời gian</SelectItem>
                <SelectItem value="contract">Hợp đồng</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={status}
              onValueChange={(value) =>
                setStatus(value as "all" | CareerOpportunityStatus)
              }
            >
              <SelectTrigger className="w-40 shadow-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="draft">Bản nháp</SelectItem>
                <SelectItem value="published">Đang hiển thị</SelectItem>
                <SelectItem value="closed">Đã đóng</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-14 w-full" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              Chưa có cơ hội phù hợp với bộ lọc.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vị trí</TableHead>
                  <TableHead>Loại hình</TableHead>
                  <TableHead>Địa điểm</TableHead>
                  <TableHead>Hạn ứng tuyển</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow
                    key={item.id}
                    className="cursor-pointer"
                    onClick={() =>
                      router.push(`/career-opportunities/${item.id}`)
                    }
                  >
                    <TableCell className="max-w-sm font-medium">
                      <div className="flex items-center gap-3">
                        <BriefcaseBusiness className="h-4 w-4 shrink-0 text-primary" />
                        <div className="min-w-0">
                          <div className="truncate">{item.titleVi}</div>
                          <div className="truncate text-xs font-normal text-muted-foreground">
                            {item.companyName}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{typeLabel[item.type]}</TableCell>
                    <TableCell className="max-w-48 truncate">
                      {item.locationVi}
                    </TableCell>
                    <TableCell>
                      {item.applicationDeadline
                        ? new Intl.DateTimeFormat("vi-VN", {
                            dateStyle: "medium",
                          }).format(new Date(item.applicationDeadline))
                        : "Không giới hạn"}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        <Badge
                          variant={
                            item.status === "published"
                              ? "default"
                              : item.status === "closed"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {statusLabel[item.status]}
                        </Badge>
                        {item.status === "published" &&
                          !isVisibleOnWebsite(item) && (
                            <Badge variant="outline">
                              Ẩn trên website (hết hạn)
                            </Badge>
                          )}
                      </div>
                    </TableCell>
                    <TableCell
                      className="text-right"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="cursor-pointer"
                          onClick={() =>
                            router.push(`/career-opportunities/${item.id}`)
                          }
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          className="cursor-pointer"
                          onClick={() => setDeleteId(item.id)}
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
            <AlertDialogTitle>Xóa cơ hội này?</AlertDialogTitle>
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
