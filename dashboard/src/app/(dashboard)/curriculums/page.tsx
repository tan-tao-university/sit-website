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
  Plus,
  Search,
  MoreHorizontal,
  ArrowRight,
  Trash2,
  Eye,
} from "lucide-react";
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
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, Curriculum, Program } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  ActionLoadingLabel,
  TableRowsSkeleton,
} from "@/components/shared/LoadingStates";

export default function CurriculumsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [curriculums, setCurriculums] = useState<Curriculum[]>([]);
  const [programs, setPrograms] = useState<Record<string, Program>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [curriculumToDelete, setCurriculumToDelete] = useState<Curriculum | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [curriculumsData, programsData] = await Promise.all([
          api.curriculums.findAll(),
          api.programs.findAll(),
        ]);

        setCurriculums(curriculumsData);

        const programsMap = programsData.reduce(
          (acc, program) => {
            acc[program.programId] = program;
            return acc;
          },
          {} as Record<string, Program>,
        );
        setPrograms(programsMap);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: "Không thể tải danh sách khung chương trình",
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only fetch on mount

  const filteredCurriculums = curriculums.filter((curr) => {
    const programName = programs[curr.programId]?.nameVi || "";
    const searchLower = searchTerm.toLowerCase();
    return (
      curr.nameVi.toLowerCase().includes(searchLower) ||
      (curr.nameEn && curr.nameEn.toLowerCase().includes(searchLower)) ||
      programName.toLowerCase().includes(searchLower)
    );
  });

  const handleDeleteClick = (curriculum: Curriculum) => {
    setCurriculumToDelete(curriculum);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!curriculumToDelete) return;

    setIsDeleting(true);
    try {
      await api.curriculums.remove(curriculumToDelete.curriculumId);
      setCurriculums((prev) =>
        prev.filter((c) => c.curriculumId !== curriculumToDelete.curriculumId)
      );
      toast({
        title: "Thành công",
        description: "Đã xóa khung chương trình thành công",
      });
    } catch (error) {
      console.error("Failed to delete curriculum:", error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể xóa khung chương trình",
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setCurriculumToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Khung chương trình
          </h1>
          <p className="text-muted-foreground">
            Quản lý kế hoạch học tập và cấu trúc chương trình.
          </p>
        </div>
        <Button
          className="cursor-pointer"
          onClick={() => router.push("/curriculums/create")}
        >
          <Plus className="mr-2 h-4 w-4" />
          Tạo khung chương trình
        </Button>
      </div>

      <div className="flex items-center gap-4 bg-card p-4 rounded-lg border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm khung chương trình..."
            className="pl-9 w-full md:w-[300px] bg-background"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên Khung chương trình</TableHead>
              <TableHead>Chương trình</TableHead>
              <TableHead>Năm</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRowsSkeleton columns={6} />
            ) : filteredCurriculums.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Không tìm thấy khung chương trình nào.
                </TableCell>
              </TableRow>
            ) : (
              filteredCurriculums.map((curr) => (
                <TableRow key={curr.curriculumId}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <Link
                        href={`/curriculums/${curr.curriculumId}`}
                        className="hover:underline flex items-center gap-2 font-semibold"
                      >
                        {curr.nameVi}
                        <ArrowRight size={14} className="opacity-50" />
                      </Link>
                      {curr.isCurrent && (
                        <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded w-fit mt-1">
                          Hiện tại
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {programs[curr.programId]?.nameVi || "N/A"}
                  </TableCell>
                  <TableCell>{curr.year}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                        curr.isCurrent
                          ? "bg-green-50 text-green-700 ring-green-600/20"
                          : "bg-gray-50 text-gray-600 ring-gray-500/10"
                      }`}
                    >
                      {curr.isCurrent ? "Đang áp dụng" : "Lưu trữ"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => router.push(`/curriculums/${curr.curriculumId}`)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Xem chi tiết
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleDeleteClick(curr)}
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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa khung chương trình &quot;{curriculumToDelete?.nameVi}&quot;?
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
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
