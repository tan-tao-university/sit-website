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
import { Plus, Search, MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { api, News } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { TableRowsSkeleton } from "@/components/shared/LoadingStates";

export default function NewsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [newsList, setNewsList] = useState<News[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedNewsId, setSelectedNewsId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const fetchNews = async () => {
    try {
      const data = await api.news.findAll();
      setNewsList(data);
    } catch (error) {
      console.error("Failed to fetch news:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleDelete = async () => {
    if (!selectedNewsId) return;

    try {
      await api.news.remove(selectedNewsId);
      toast({
        title: "Thành công",
        description: "Đã xóa tin tức thành công.",
      });
      fetchNews();
    } catch (error) {
      console.error("Failed to delete news:", error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể xóa tin tức.",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Tin tức & Sự kiện
          </h1>
          <p className="text-muted-foreground">
            Quản lý các bài viết tin tức và sự kiện.
          </p>
        </div>
        <Button
          className="cursor-pointer"
          onClick={() => router.push("/news/create")}
        >
          <Plus className="mr-2 h-4 w-4" />
          Thêm tin tức
        </Button>
      </div>

      <div className="flex items-center gap-4 bg-card p-4 rounded-lg border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm tin tức..."
            className="pl-9 w-full md:w-[300px] bg-background"
          />
        </div>
      </div>

      <div className="rounded-md border bg-card shadow-sm">
        <Table className="table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead>Tiêu đề</TableHead>
              <TableHead className="w-32 whitespace-nowrap px-4">
                Ngày đăng
              </TableHead>
              <TableHead className="w-32 whitespace-nowrap px-4">
                Trạng thái
              </TableHead>
              <TableHead className="w-24 whitespace-nowrap px-4 text-right">
                Hành động
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRowsSkeleton columns={4} />
            ) : newsList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  Không có tin tức nào.
                </TableCell>
              </TableRow>
            ) : (
              newsList.map((news) => (
                <TableRow
                  key={news.id}
                  className="cursor-pointer"
                  onClick={() => router.push(`/news/${news.id}/view`)}
                >
                  <TableCell className="font-medium">
                    <div className="flex min-w-0 items-center gap-3">
                      {news.coverImage && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={news.coverImage}
                          alt={news.title}
                          className="h-10 w-10 shrink-0 rounded-md object-cover"
                        />
                      )}
                      <span className="min-w-0 flex-1 truncate" title={news.title}>
                        {news.title}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap px-4">
                    {news.publishedAt
                      ? format(new Date(news.publishedAt), "dd/MM/yyyy")
                      : "-"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap px-4">
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                        news.status === "published"
                          ? "bg-green-50 text-green-700 ring-green-600/20"
                          : news.status === "draft"
                          ? "bg-yellow-50 text-yellow-800 ring-yellow-600/20"
                          : "bg-gray-50 text-gray-600 ring-gray-600/20"
                      }`}
                    >
                      {news.status === "published"
                        ? "Công khai"
                        : news.status === "draft"
                        ? "Bản nháp"
                        : "Lưu trữ"}
                    </span>
                  </TableCell>
                  <TableCell
                    className="px-4 text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
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
                          onClick={() => router.push(`/news/${news.id}/view`)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Xem
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => router.push(`/news/${news.id}`)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Sửa
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600"
                          onClick={() => {
                            setSelectedNewsId(news.id);
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
        description="Bạn có chắc chắn muốn xóa tin tức này không? Hành động này không thể hoàn tác."
        variant="destructive"
        confirmText="Xóa"
      />
    </div>
  );
}
