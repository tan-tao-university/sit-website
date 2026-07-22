"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Trophy, Star, Eye, EyeOff } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { api, Achievement, AchievementType } from "@/lib/api";
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

const typeLabels: Record<AchievementType, string> = {
  HACKATHON: "Hackathon",
  AWARD: "Giải thưởng",
  SCHOLARSHIP: "Học bổng",
  RESEARCH: "Nghiên cứu",
  COMPETITION: "Cuộc thi",
  OTHER: "Khác",
};

const levelLabels: Record<string, string> = {
  UNIVERSITY: "Cấp trường",
  NATIONAL: "Cấp quốc gia",
  INTERNATIONAL: "Quốc tế",
};

export default function AchievementsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadAchievements();
  }, [typeFilter]);

  async function loadAchievements() {
    try {
      setIsLoading(true);
      const data = await api.achievements.findAll(
        typeFilter === "all" ? undefined : { type: typeFilter }
      );
      setAchievements(data);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể tải danh sách thành tích",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      setIsDeleting(true);
      await api.achievements.remove(id);
      toast({
        title: "Thành công",
        description: "Đã xóa thành tích",
      });
      loadAchievements();
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể xóa thành tích",
      });
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Thành tích sinh viên</h2>
        <Button
          onClick={() => router.push("/achievements/create")}
          className="cursor-pointer"
        >
          <Plus className="mr-2 h-4 w-4" />
          Tạo mới
        </Button>
      </div>

      <Card className="shadow-none border-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Danh sách thành tích</CardTitle>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[200px] shadow-none">
                <SelectValue placeholder="Lọc theo loại" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="HACKATHON">Hackathon</SelectItem>
                <SelectItem value="AWARD">Giải thưởng</SelectItem>
                <SelectItem value="SCHOLARSHIP">Học bổng</SelectItem>
                <SelectItem value="RESEARCH">Nghiên cứu</SelectItem>
                <SelectItem value="COMPETITION">Cuộc thi</SelectItem>
                <SelectItem value="OTHER">Khác</SelectItem>
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
          ) : achievements.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Chưa có thành tích nào
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tiêu đề</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Cấp độ</TableHead>
                  <TableHead>Sinh viên</TableHead>
                  <TableHead>Năm</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {achievements.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium max-w-xs">
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                        <span className="truncate">{item.title}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {typeLabels[item.type] || item.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {item.level ? (
                        <Badge
                          variant={
                            item.level === "INTERNATIONAL"
                              ? "default"
                              : item.level === "NATIONAL"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {levelLabels[item.level] || item.level}
                        </Badge>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {item.studentNames
                        ? item.studentNames.split(";").slice(0, 2).join(", ") +
                          (item.studentNames.split(";").length > 2 ? "..." : "")
                        : "-"}
                    </TableCell>
                    <TableCell>{item.achievedYear || "-"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {item.isHighlight && (
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        )}
                        {item.visibility === "PUBLIC" ? (
                          <Eye className="h-4 w-4 text-green-500" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => router.push(`/achievements/${item.id}`)}
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
              Bạn có chắc chắn muốn xóa thành tích này? Hành động này không thể
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
