"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Plus, Search, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { api, Program } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { TableRowsSkeleton } from "@/components/shared/LoadingStates";

export default function ProgramsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(
    null
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const fetchPrograms = async () => {
    try {
      const data = await api.programs.findAll();
      setPrograms(data);
    } catch (error) {
      console.error("Failed to fetch programs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  const handleDelete = async () => {
    if (!selectedProgramId) return;

    try {
      await api.programs.remove(selectedProgramId);
      toast({
        title: "Thành công",
        description: "Đã xóa chương trình thành công.",
      });
      fetchPrograms();
    } catch (error) {
      console.error("Failed to delete program:", error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể xóa chương trình.",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Chương trình đào tạo
          </h1>
          <p className="text-muted-foreground">
            Quản lý các chương trình giáo dục.
          </p>
        </div>
        <Button
          className="cursor-pointer"
          onClick={() => router.push("/programs/create")}
        >
          <Plus className="mr-2 h-4 w-4" />
          Thêm chương trình
        </Button>
      </div>

      <div className="flex items-center gap-4 bg-card p-4 rounded-lg border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm chương trình..."
            className="pl-9 w-full md:w-[300px] bg-background"
          />
        </div>
      </div>

      <div className="rounded-md border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên Chương trình</TableHead>
              <TableHead>Mã</TableHead>
              <TableHead>Loại</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRowsSkeleton columns={5} />
            ) : programs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  Không có chương trình nào.
                </TableCell>
              </TableRow>
            ) : (
              programs.map((program) => (
                <TableRow key={program.programId}>
                  <TableCell className="font-medium">
                    {program.nameVi}
                  </TableCell>
                  <TableCell>{program.code}</TableCell>
                  <TableCell>
                    {program.level === "undergraduate"
                      ? "Đại học"
                      : "Sau đại học"}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                        program.status === "active"
                          ? "bg-green-50 text-green-700 ring-green-600/20"
                          : "bg-yellow-50 text-yellow-800 ring-yellow-600/20"
                      }`}
                    >
                      {program.status === "active"
                        ? "Hoạt động"
                        : "Không hoạt động"}
                    </span>
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
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(`/programs/${program.programId}`)
                          }
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Sửa
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600"
                          onClick={() => {
                            setSelectedProgramId(program.programId);
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
        description="Bạn có chắc chắn muốn xóa chương trình này không? Hành động này không thể hoàn tác."
        variant="destructive"
        confirmText="Xóa"
      />
    </div>
  );
}
