"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, FileText, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { api, Research, ResearchType } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { ActionLoadingLabel } from "@/components/shared/LoadingStates";
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

export default function ResearchPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [research, setResearch] = useState<Research[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadResearch();
  }, [typeFilter]);

  async function loadResearch() {
    try {
      setIsLoading(true);
      const data = await api.research.findAll(
        typeFilter === "all" ? undefined : typeFilter
      );
      setResearch(data);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể tải danh sách nghiên cứu",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      setIsDeleting(true);
      await api.research.remove(id);
      toast({
        title: "Thành công",
        description: "Đã xóa nghiên cứu",
      });
      loadResearch();
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể xóa nghiên cứu",
      });
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  }

  const getTypeLabel = (type: ResearchType) => {
    return type === "PROJECT" ? "Đề tài" : "Bài báo";
  };

  const getTypeIcon = (type: ResearchType) => {
    return type === "PROJECT" ? (
      <FileText className="h-4 w-4" />
    ) : (
      <BookOpen className="h-4 w-4" />
    );
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">
          Nghiên cứu khoa học
        </h2>
        <Button
          onClick={() => router.push("/research/create")}
          className="cursor-pointer"
        >
          <Plus className="mr-2 h-4 w-4" />
          Tạo mới
        </Button>
      </div>

      <Card className="shadow-none border-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Danh sách nghiên cứu</CardTitle>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[200px] shadow-none">
                <SelectValue placeholder="Lọc theo loại" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="PROJECT">Đề tài</SelectItem>
                <SelectItem value="PUBLICATION">Bài báo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3 py-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-12 w-full rounded-xl" />
              ))}
            </div>
          ) : research.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Chưa có nghiên cứu nào
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Loại</TableHead>
                  <TableHead>Tiêu đề</TableHead>
                  <TableHead>Đơn vị</TableHead>
                  <TableHead>Lĩnh vực</TableHead>
                  <TableHead>Năm</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {research.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTypeIcon(item.type)}
                        <span>{getTypeLabel(item.type)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium max-w-md truncate">
                      {item.title}
                    </TableCell>
                    <TableCell>{item.unit || "-"}</TableCell>
                    <TableCell>{item.researchField || "-"}</TableCell>
                    <TableCell>
                      {item.type === "PROJECT"
                        ? item.startYear
                          ? `${item.startYear}${
                              item.endYear ? ` - ${item.endYear}` : ""
                            }`
                          : "-"
                        : item.publicationYear || "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => router.push(`/research/${item.id}`)}
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
        open={!!deleteId}
        onOpenChange={() => !isDeleting && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa nghiên cứu này? Hành động này không thể
              hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <ActionLoadingLabel label="Đang xóa" />
              ) : (
                "Xóa"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
