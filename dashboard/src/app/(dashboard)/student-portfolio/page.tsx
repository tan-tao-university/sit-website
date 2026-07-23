"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Plus, MoreHorizontal, Edit, Trash2, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import { api, StudentPortfolio } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { TableRowsSkeleton } from "@/components/shared/LoadingStates";

export default function StudentPortfolioPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [portfolios, setPortfolios] = useState<StudentPortfolio[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const fetchPortfolios = async () => {
    try {
      const data = await api.studentPortfolio.findAll();
      setPortfolios(data);
    } catch (error) {
      console.error("Failed to fetch student portfolios:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolios();
  }, []);

  const handleDelete = async () => {
    if (!selectedId) return;

    const { id, update } = toast({
      title: "Đang xóa...",
      description: "Vui lòng chờ trong giây lát.",
      duration: Infinity,
    });

    try {
      await api.studentPortfolio.remove(selectedId);
      update({
        id,
        title: "Thành công",
        description: "Đã xóa portfolio sinh viên thành công.",
        variant: "default",
        duration: 3000,
      });
      setDeleteDialogOpen(false);
      fetchPortfolios();
    } catch (error) {
      console.error("Failed to delete student portfolio:", error);
      update({
        id,
        title: "Lỗi",
        description: "Không thể xóa portfolio sinh viên.",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Portfolio sinh viên
          </h1>
          <p className="text-muted-foreground">
            Quản lý trang portfolio cá nhân của sinh viên tại /[slug].
          </p>
        </div>
        <Button onClick={() => router.push("/student-portfolio/create")}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm mới
        </Button>
      </div>

      <div className="rounded-md border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Họ và tên</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Chương trình</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRowsSkeleton columns={5} />
            ) : portfolios.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  Chưa có portfolio nào.
                </TableCell>
              </TableRow>
            ) : (
              portfolios.map((portfolio) => (
                <TableRow key={portfolio.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      {portfolio.avatarUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={portfolio.avatarUrl}
                          alt={portfolio.fullName}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      )}
                      {portfolio.fullName}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    /{portfolio.slug}
                  </TableCell>
                  <TableCell>{portfolio.program || "—"}</TableCell>
                  <TableCell>
                    <Badge variant={portfolio.isPublished ? "default" : "secondary"}>
                      {portfolio.isPublished ? "Đã công khai" : "Bản nháp"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                        {portfolio.isPublished && (
                          <DropdownMenuItem asChild>
                            <a
                              href={`https://sit.ttu.edu.vn/${portfolio.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Xem trang công khai
                            </a>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(`/student-portfolio/${portfolio.id}`)
                          }
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Sửa
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600"
                          onClick={() => {
                            setSelectedId(portfolio.id);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Xóa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        title="Xác nhận xóa"
        description="Bạn có chắc chắn muốn xóa portfolio sinh viên này không? Hành động này không thể hoàn tác."
        variant="destructive"
        confirmText="Xóa"
      />
    </div>
  );
}
