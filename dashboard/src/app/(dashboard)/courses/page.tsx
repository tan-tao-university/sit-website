"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Search, MoreHorizontal, Edit, Trash2 } from "lucide-react";

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
import { api, Course } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { TableRowsSkeleton } from "@/components/shared/LoadingStates";

export default function CoursesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null);

  async function fetchCourses() {
    try {
      const data = await api.courses.findAll();
      setCourses(data);
    } catch (error) {
      console.error("Failed to fetch courses:", error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể tải danh sách khoá học",
      });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleDelete = (id: string) => {
    setCourseToDelete(id);
  };

  const confirmDelete = async () => {
    if (!courseToDelete) return;
    try {
      await api.courses.remove(courseToDelete);
      toast({
        title: "Thành công",
        description: "Xóa khoá học thành công",
      });
      fetchCourses();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể xóa khoá học",
      });
    } finally {
      setCourseToDelete(null);
    }
  };

  const filteredCourses = courses.filter(
    (course) =>
      course.nameVi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Khoá học</h1>
          <p className="text-muted-foreground">
            Quản lý các khoá học riêng lẻ.
          </p>
        </div>
        <Button asChild>
          <Link href="/courses/create">
            <Plus className="mr-2 h-4 w-4" />
            Thêm khoá học
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-4 bg-card p-4 rounded-lg border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm khoá học theo tên hoặc mã..."
            className="pl-9 w-full md:w-[300px] bg-background"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã</TableHead>
              <TableHead>Tên khoá học</TableHead>
              <TableHead>Tín chỉ</TableHead>
              <TableHead>LT / TH</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRowsSkeleton columns={5} />
            ) : filteredCourses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  Chưa có khoá học nào.
                </TableCell>
              </TableRow>
            ) : (
              filteredCourses.map((course) => (
                <TableRow key={course.courseId}>
                  <TableCell className="font-medium">{course.code}</TableCell>
                  <TableCell>{course.nameVi}</TableCell>
                  <TableCell>{course.credits}</TableCell>
                  <TableCell>
                    {course.lectureHours || 0} / {course.practiceHours || 0}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link href={`/courses/${course.courseId}`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Chỉnh sửa
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600"
                          onClick={() => handleDelete(course.courseId)}
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
        open={!!courseToDelete}
        onOpenChange={(open) => !open && setCourseToDelete(null)}
        onConfirm={confirmDelete}
        title="Xóa khoá học"
        description="Bạn có chắc chắn muốn xóa khoá học này không? Hành động này không thể hoàn tác."
        variant="destructive"
        confirmText="Xóa bỏ"
      />
    </div>
  );
}
