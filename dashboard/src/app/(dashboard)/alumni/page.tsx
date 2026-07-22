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
import { api, Alumni } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { TableRowsSkeleton } from "@/components/shared/LoadingStates";

export default function AlumniPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [alumniList, setAlumniList] = useState<Alumni[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedAlumniId, setSelectedAlumniId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const fetchAlumni = async () => {
    try {
      const data = await api.alumni.findAll();
      setAlumniList(data);
    } catch (error) {
      console.error("Failed to fetch alumni:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAlumni();
  }, []);

  const handleDelete = async () => {
    if (!selectedAlumniId) return;

    const { id, update } = toast({
      title: "Đang xóa...",
      description: "Vui lòng chờ trong giây lát.",
      duration: Infinity,
    });

    try {
      await api.alumni.remove(selectedAlumniId);
      update({
        id,
        title: "Thành công",
        description: "Đã xóa hồ sơ cựu sinh viên thành công.",
        variant: "default",
        duration: 3000,
      });
      setDeleteDialogOpen(false); // Close dialog immediately on success
      fetchAlumni();
    } catch (error) {
      console.error("Failed to delete alumni:", error);
      update({
        id,
        title: "Lỗi",
        description: "Không thể xóa hồ sơ cựu sinh viên.",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cựu sinh viên</h1>
          <p className="text-muted-foreground">
            Quản lý hồ sơ cựu sinh viên tiêu biểu.
          </p>
        </div>
        <Button onClick={() => router.push("/alumni/create")}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm mới
        </Button>
      </div>

      <div className="flex items-center gap-4 bg-card p-4 rounded-lg border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm cựu sinh viên..."
            className="pl-9 w-full md:w-[300px] bg-background"
          />
        </div>
      </div>

      <div className="rounded-md border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Họ và tên</TableHead>
              <TableHead>Chương trình</TableHead>
              <TableHead>Năm tốt nghiệp</TableHead>
              <TableHead>Học vị</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRowsSkeleton columns={5} />
            ) : alumniList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  Không có hồ sơ nào.
                </TableCell>
              </TableRow>
            ) : (
              alumniList.map((alumni) => (
                <TableRow key={alumni.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      {alumni.avatarUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={alumni.avatarUrl}
                          alt={alumni.fullName}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      )}
                      {alumni.fullName}
                    </div>
                  </TableCell>
                  <TableCell>{alumni.program}</TableCell>
                  <TableCell>{alumni.graduationYear}</TableCell>
                  <TableCell>{alumni.degree}</TableCell>
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
                          onClick={() => router.push(`/alumni/${alumni.id}`)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Sửa
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600"
                          onClick={() => {
                            setSelectedAlumniId(alumni.id);
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
        description="Bạn có chắc chắn muốn xóa hồ sơ cựu sinh viên này không? Hành động này không thể hoàn tác."
        variant="destructive"
        confirmText="Xóa"
      />
    </div>
  );
}
