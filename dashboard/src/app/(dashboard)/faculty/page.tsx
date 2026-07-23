"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, MoreHorizontal, Pencil, Trash2, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { api, Faculty } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { ActionLoadingLabel } from "@/components/shared/LoadingStates";

export default function FacultyPage() {
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const fetchFaculty = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await api.faculty.findAll();
      setFaculty(data);
    } catch (error) {
      console.error("Failed to fetch faculty:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách giảng viên",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchFaculty();
  }, [fetchFaculty]);

  async function handleDelete(id: string) {
    try {
      setIsDeleting(true);
      await api.faculty.remove(id);
      setFaculty(faculty.filter((f) => f.id !== id));
      toast({
        title: "Thành công",
        description: "Đã xóa giảng viên thành công",
      });
    } catch (error) {
      console.error("Failed to delete faculty:", error);
      toast({
        title: "Lỗi",
        description: "Không thể xóa giảng viên",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  }

  const filteredFaculty = faculty.filter(
    (f) =>
      f.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.position?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.department?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Giảng viên</h2>
        <Link href="/faculty/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Thêm giảng viên
          </Button>
        </Link>
      </div>

      <Card className="shadow-none border-0">
        <CardHeader>
          <CardTitle>Danh sách giảng viên</CardTitle>
          <CardDescription>
            Quản lý thông tin giảng viên của khoa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm giảng viên..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-3 py-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-12 w-full rounded-xl" />
              ))}
            </div>
          ) : filteredFaculty.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery
                ? "Không tìm thấy giảng viên phù hợp"
                : "Chưa có giảng viên nào"}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Họ và tên</TableHead>
                  <TableHead>Học hàm/Học vị</TableHead>
                  <TableHead>Chức vụ</TableHead>
                  <TableHead>Khoa/Bộ môn</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFaculty.map((f) => (
                  <TableRow key={f.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {f.avatarUrl && (
                          <img
                            src={f.avatarUrl}
                            alt={f.fullName}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        )}
                        <div>
                          <div className="font-medium">{f.fullName}</div>
                          <div className="text-sm text-muted-foreground">
                            {f.slug}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{f.academicTitle || "-"}</TableCell>
                    <TableCell>{f.position || "-"}</TableCell>
                    <TableCell>{f.department || "-"}</TableCell>
                    <TableCell>
                      <Badge
                        variant={f.isActive !== false ? "default" : "secondary"}
                      >
                        {f.isActive !== false ? "Hoạt động" : "Ngừng hoạt động"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <Link href={`/faculty/${f.id}`}>
                            <DropdownMenuItem>
                              <Pencil className="mr-2 h-4 w-4" />
                              Chỉnh sửa
                            </DropdownMenuItem>
                          </Link>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setDeleteId(f.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Xóa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
              Bạn có chắc chắn muốn xóa giảng viên này? Hành động này không thể
              hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteId && handleDelete(deleteId)}
              disabled={isDeleting}
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
