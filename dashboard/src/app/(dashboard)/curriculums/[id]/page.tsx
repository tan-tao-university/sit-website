"use client";

import { use, useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ImageUploadOverlay } from "@/components/ui/image-upload-overlay";
import {
  Plus,
  Minus,
  GripVertical,
  Trash2,
  Edit2,
  Loader2,
  FileText,
  X,
  Languages,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  api,
  Curriculum,
  Section,
  UpdateCurriculumDto,
  UpdateSectionDto,
  CreateSectionDto,
} from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useImageUpload } from "@/hooks/use-image-upload";
import { FormLoading } from "@/components/shared/LoadingStates";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { slugify } from "@/lib/utils";

const SECTION_KEYS = [
  { value: "intro", label: "Giới thiệu" },
  { value: "overview", label: "Tổng quan" },
  { value: "vision", label: "Tầm nhìn" },
  { value: "objectives", label: "Mục tiêu đào tạo" },
  { value: "learning_outcomes", label: "Chuẩn đầu ra" },
  { value: "admission_requirements", label: "Điều kiện xét tuyển" },
  { value: "workload", label: "Khối lượng chương trình" },
  { value: "curriculum_structure", label: "Cấu trúc chương trình" },
  { value: "teaching_method", label: "Phương pháp giảng dạy" },
  { value: "assessment", label: "Đánh giá kết quả" },
  { value: "career_opportunities", label: "Cơ hội nghề nghiệp" },
  { value: "graduation_requirements", label: "Điều kiện tốt nghiệp" },
] as const;

function SortableSection({
  section,
  expandedSections,
  toggleSection,
  handleEditSectionClick,
  handleDeleteSection,
}: {
  section: Section;
  expandedSections: Record<string, boolean>;
  toggleSection: (id: string) => void;
  handleEditSectionClick: (section: Section) => void;
  handleDeleteSection: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.sectionId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="mb-6">
      <Card className="rounded-2xl border-[#e8e2dc] p-6 shadow-none min-w-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="cursor-move text-muted-foreground outline-none"
              {...attributes}
              {...listeners}
            >
              <GripVertical size={20} />
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => toggleSection(section.sectionId)}
            >
              {!expandedSections[section.sectionId] ? (
                <Plus size={16} />
              ) : (
                <Minus size={16} />
              )}
            </Button>
            <div>
              <h3 className="text-lg font-semibold">{section.title}</h3>
              <span className="text-xs text-muted-foreground bg-gray-100 px-2 py-0.5 rounded">
                {SECTION_KEYS.find((k) => k.value === section.sectionKey)
                  ?.label || section.sectionKey}
              </span>
            </div>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEditSectionClick(section)}
            >
              <Edit2 size={14} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-500 hover:text-red-600"
              onClick={() => handleDeleteSection(section.sectionId)}
            >
              <Trash2 size={14} />
            </Button>
          </div>
        </div>

        {expandedSections[section.sectionId] && (
          <div className="bg-muted/30 rounded-lg p-4 space-y-1 overflow-x-auto w-full">
            {section.content ? (
              <div
                dangerouslySetInnerHTML={{
                  __html: (section.content || "").replace(/&nbsp;/g, " "),
                }}
                className="prose max-w-none text-sm wrap-break-word [&_img]:max-w-full [&_table]:border-collapse [&_table]:w-full [&_table]:my-2 [&_td]:border [&_td]:border-gray-300 [&_td]:p-2 [&_th]:border [&_th]:border-gray-300 [&_th]:p-2 [&_th]:bg-gray-100"
              />
            ) : (
              <p className="text-sm text-muted-foreground italic">
                Chưa có nội dung
              </p>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}

export default function CurriculumDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { toast } = useToast();
  const [curriculum, setCurriculum] = useState<Curriculum | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Edit Curriculum State
  const [isEditCurriculumOpen, setIsEditCurriculumOpen] = useState(false);
  const [isUpdatingCurriculum, setIsUpdatingCurriculum] = useState(false);
  const [editCurriculumForm, setEditCurriculumForm] =
    useState<UpdateCurriculumDto>({});
  const bannerUpload = useImageUpload({
    folder: "curriculums",
    onUploaded: (url) =>
      setEditCurriculumForm((prev) => ({ ...prev, banner: url })),
  });
  const [isTranslating, setIsTranslating] = useState<Record<string, boolean>>(
    {},
  );

  // Edit/Add Section State
  const [isEditSectionOpen, setIsEditSectionOpen] = useState(false);
  const [isUpdatingSection, setIsUpdatingSection] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [sectionForm, setSectionForm] = useState<Partial<CreateSectionDto>>({
    sectionKey: "intro",
    isVisible: true,
    displayOrder: 0,
  });

  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({});

  // Delete Curriculum State
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const handleTranslate = async (
    sourceField: keyof UpdateCurriculumDto,
    targetField: keyof UpdateCurriculumDto,
  ) => {
    const sourceText = editCurriculumForm[sourceField];
    if (!sourceText || typeof sourceText !== "string") {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Vui lòng nhập nội dung tiếng Việt trước khi dịch.",
      });
      return;
    }

    try {
      setIsTranslating((prev) => ({ ...prev, [targetField as string]: true }));
      toast({
        title: "Đang dịch...",
        description: "Hệ thống đang dịch nội dung sang tiếng Anh.",
      });

      const res = await api.translation.translate(sourceText, "en");
      setEditCurriculumForm({
        ...editCurriculumForm,
        [targetField]: res.translatedText,
      });

      toast({
        title: "Thành công",
        description: "Dịch nội dung thành công.",
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể dịch nội dung. Vui lòng thử lại.",
      });
    } finally {
      setIsTranslating((prev) => ({
        ...prev,
        [targetField as string]: false,
      }));
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id && curriculum?.sections) {
      setCurriculum((prev) => {
        if (!prev || !prev.sections) return prev;

        const oldIndex = prev.sections.findIndex(
          (s) => s.sectionId === active.id,
        );
        const newIndex = prev.sections.findIndex(
          (s) => s.sectionId === over.id,
        );

        const newSections = arrayMove(prev.sections, oldIndex, newIndex);

        // Calculate new display orders
        const updates = newSections.map((section, index) => ({
          sectionId: section.sectionId,
          displayOrder: index + 1,
        }));

        // Trigger API updates in background
        Promise.all(
          updates.map((update) =>
            api.sections.update(update.sectionId, {
              displayOrder: update.displayOrder,
            }),
          ),
        )
          .then(() => {
            toast({
              title: "Thành công",
              description: "Đã cập nhật thứ tự",
            });
          })
          .catch((error) => {
            console.error("Failed to update order:", error);
            toast({
              variant: "destructive",
              title: "Lỗi",
              description: "Không thể lưu thứ tự mới",
            });
            fetchCurriculum(); // Revert on failure
          });

        return {
          ...prev,
          sections: newSections,
        };
      });
    }
  };

  async function fetchCurriculum() {
    try {
      const data = await api.curriculums.findOne(id, true);
      setCurriculum(data);
    } catch (error) {
      console.error("Failed to fetch curriculum:", error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể tải thông tin khung chương trình",
      });
      router.push("/curriculums");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchCurriculum();
  }, [id, router, toast]);

  // Handle Curriculum Update
  const handleEditCurriculumClick = () => {
    if (!curriculum) return;
    setEditCurriculumForm({
      nameVi: curriculum.nameVi,
      nameEn: curriculum.nameEn,
      year: curriculum.year,
      descriptionVi: curriculum.descriptionVi,
      descriptionEn: curriculum.descriptionEn,
      slugVi: curriculum.slugVi,
      slugEn: curriculum.slugEn,
      isCurrent: curriculum.isCurrent,
      banner: curriculum.banner,
      durationYears: curriculum.durationYears,
      totalSemesters: curriculum.totalSemesters,
      totalCredits: curriculum.totalCredits,
      educationType: curriculum.educationType,
      language: curriculum.language,
      degreeAwarded: curriculum.degreeAwarded,
    });
    bannerUpload.setPreview(curriculum.banner || "");
    setIsEditCurriculumOpen(true);
  };

  const handleUpdateCurriculum = async () => {
    const { id: toastId, update } = toast({
      title: "Đang cập nhật...",
      description: "Vui lòng chờ trong giây lát.",
      duration: Infinity,
    });

    try {
      setIsUpdatingCurriculum(true);

      await api.curriculums.update(id, editCurriculumForm);
      update({
        id: toastId,
        title: "Thành công",
        description: "Cập nhật thông tin thành công",
        variant: "default",
        duration: 3000,
      });
      setIsEditCurriculumOpen(false);
      fetchCurriculum();
    } catch (error) {
      update({
        id: toastId,
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể cập nhật thông tin",
        duration: 5000,
      });
    } finally {
      setIsUpdatingCurriculum(false);
    }
  };

  const handleDescriptionViChange = useCallback((value: string) => {
    setEditCurriculumForm((prev) => ({ ...prev, descriptionVi: value }));
  }, []);

  const handleDescriptionEnChange = useCallback((value: string) => {
    setEditCurriculumForm((prev) => ({ ...prev, descriptionEn: value }));
  }, []);

  const handleSectionContentChange = useCallback((value: string) => {
    setSectionForm((prev) => ({ ...prev, content: value }));
  }, []);

  // Handle Section Add/Edit
  const handleAddSectionClick = () => {
    setEditingSectionId(null);
    setSectionForm({
      sectionKey: "intro",
      title: "",
      content: "",
      isVisible: true,
      displayOrder: (curriculum?.sections?.length || 0) + 1,
    });
    setIsEditSectionOpen(true);
  };

  const handleEditSectionClick = (section: Section) => {
    setEditingSectionId(section.sectionId);
    setSectionForm({
      sectionKey: section.sectionKey,
      title: section.title,
      content: section.content,
      isVisible: section.isVisible,
      displayOrder: section.displayOrder,
    });
    setIsEditSectionOpen(true);
  };

  const handleSaveSection = async () => {
    const { id, update } = toast({
      title: "Đang lưu...",
      description: "Vui lòng chờ trong giây lát.",
      duration: Infinity,
    });

    try {
      setIsUpdatingSection(true);
      if (editingSectionId) {
        // Update
        await api.sections.update(
          editingSectionId,
          sectionForm as UpdateSectionDto,
        );
        update({
          id,
          title: "Thành công",
          description: "Cập nhật phần nội dung thành công",
          variant: "default",
          duration: 3000,
        });
      } else {
        // Create
        if (!curriculum) return;
        await api.sections.create({
          ...sectionForm,
          curriculumId: curriculum.curriculumId,
        } as CreateSectionDto);
        update({
          id,
          title: "Thành công",
          description: "Thêm phần nội dung thành công",
          variant: "default",
          duration: 3000,
        });
      }
      setIsEditSectionOpen(false);
      fetchCurriculum();
    } catch (error) {
      console.error(error);
      update({
        id,
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể lưu thông tin",
        duration: 5000,
      });
    } finally {
      setIsUpdatingSection(false);
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa phần này không?")) return;

    const { id, update } = toast({
      title: "Đang xóa...",
      description: "Vui lòng chờ trong giây lát.",
      duration: Infinity,
    });

    try {
      await api.sections.remove(sectionId);
      update({
        id,
        title: "Thành công",
        description: "Xóa phần nội dung thành công",
        variant: "default",
        duration: 3000,
      });
      fetchCurriculum();
    } catch (error) {
      update({
        id,
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể xóa phần nội dung",
        duration: 5000,
      });
    }
  };

  const handleDeleteCurriculum = async () => {
    setIsDeleting(true);
    try {
      await api.curriculums.remove(id);
      toast({
        title: "Thành công",
        description: "Đã xóa khung chương trình thành công",
      });
      router.push("/curriculums");
    } catch (error) {
      console.error("Failed to delete curriculum:", error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể xóa khung chương trình",
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  if (isLoading) {
    return <FormLoading fieldCount={10} />;
  }

  if (!curriculum) {
    return null;
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5 p-8 pt-6 dashboard-reveal">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
            <span className="h-px w-5 bg-primary" />
            <Link href="/curriculums" className="hover:underline">
              Khung chương trình
            </Link>
          </div>
          <h1 className="text-[28px] font-semibold tracking-[-0.035em] text-stone-950 sm:text-[32px]">
            {curriculum.nameVi}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Năm học: {curriculum.year} &bull;{" "}
            {curriculum.isCurrent ? "Đang áp dụng" : "Lưu trữ"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {curriculum.banner && (
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={() => window.open(curriculum.banner, "_blank")}
            >
              <FileText className="mr-2 h-4 w-4" />
              Xem Banner
            </Button>
          )}
          <Button
            variant="outline"
            className="cursor-pointer"
            onClick={handleEditCurriculumClick}
          >
            Chỉnh sửa thông tin
          </Button>
          <Button className="cursor-pointer" onClick={handleAddSectionClick}>
            <Plus className="mr-2 h-4 w-4" />
            Thêm Phần
          </Button>
          <Button
            variant="destructive"
            className="cursor-pointer"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Xóa
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {curriculum.sections && curriculum.sections.length > 0 && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={curriculum.sections.map((s) => s.sectionId)}
              strategy={verticalListSortingStrategy}
            >
              {curriculum.sections.map((section) => (
                <SortableSection
                  key={section.sectionId}
                  section={section}
                  expandedSections={expandedSections}
                  toggleSection={toggleSection}
                  handleEditSectionClick={handleEditSectionClick}
                  handleDeleteSection={handleDeleteSection}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}

        {(!curriculum.sections || curriculum.sections.length === 0) && (
          <div className="text-center py-12 border-2 border-dashed border-[#e8e2dc] rounded-2xl text-muted-foreground">
            Chưa có phần nội dung nào.
          </div>
        )}
      </div>

      {/* Edit Curriculum Dialog */}
      <Dialog
        open={isEditCurriculumOpen}
        onOpenChange={setIsEditCurriculumOpen}
      >
        <DialogContent className="rounded-2xl border-[#e8e2dc] sm:max-w-[825px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa thông tin</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin chi tiết cho khung chương trình này.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-nameVi">
                  Tên chương trình (Tiếng Việt)
                </Label>
                <Input
                  id="edit-nameVi"
                  value={editCurriculumForm.nameVi || ""}
                  onChange={(e) =>
                    setEditCurriculumForm({
                      ...editCurriculumForm,
                      nameVi: e.target.value,
                      slugVi: slugify(e.target.value),
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="edit-nameEn">
                    Tên chương trình (Tiếng Anh)
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs border cursor-pointer"
                    disabled={isTranslating["nameEn"]}
                    onClick={() => handleTranslate("nameVi", "nameEn")}
                  >
                    {isTranslating["nameEn"] ? (
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                    ) : (
                      <Languages className="mr-1 h-3 w-3" />
                    )}
                    Dịch bằng AI
                  </Button>
                </div>
                <Input
                  id="edit-nameEn"
                  value={editCurriculumForm.nameEn || ""}
                  onChange={(e) =>
                    setEditCurriculumForm({
                      ...editCurriculumForm,
                      nameEn: e.target.value,
                      slugEn: slugify(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-year">Năm học</Label>
              <Input
                id="edit-year"
                type="number"
                value={editCurriculumForm.year || ""}
                onChange={(e) =>
                  setEditCurriculumForm({
                    ...editCurriculumForm,
                    year: parseInt(e.target.value),
                  })
                }
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-durationYears">
                  Thời gian đào tạo (Năm)
                </Label>
                <Input
                  id="edit-durationYears"
                  type="number"
                  step="0.5"
                  value={editCurriculumForm.durationYears || ""}
                  onChange={(e) =>
                    setEditCurriculumForm({
                      ...editCurriculumForm,
                      durationYears: parseFloat(e.target.value),
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-totalSemesters">Tổng số học kỳ</Label>
                <Input
                  id="edit-totalSemesters"
                  type="number"
                  value={editCurriculumForm.totalSemesters || ""}
                  onChange={(e) =>
                    setEditCurriculumForm({
                      ...editCurriculumForm,
                      totalSemesters: parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-totalCredits">Tổng số tín chỉ</Label>
                <Input
                  id="edit-totalCredits"
                  type="number"
                  value={editCurriculumForm.totalCredits || ""}
                  onChange={(e) =>
                    setEditCurriculumForm({
                      ...editCurriculumForm,
                      totalCredits: parseInt(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-educationType">Loại hình đào tạo</Label>
                <Input
                  id="edit-educationType"
                  value={editCurriculumForm.educationType || ""}
                  onChange={(e) =>
                    setEditCurriculumForm({
                      ...editCurriculumForm,
                      educationType: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-language">Ngôn ngữ giảng dạy</Label>
                <Input
                  id="edit-language"
                  value={editCurriculumForm.language || ""}
                  onChange={(e) =>
                    setEditCurriculumForm({
                      ...editCurriculumForm,
                      language: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-degreeAwarded">Bằng cấp trao tặng</Label>
                <Input
                  id="edit-degreeAwarded"
                  value={editCurriculumForm.degreeAwarded || ""}
                  onChange={(e) =>
                    setEditCurriculumForm({
                      ...editCurriculumForm,
                      degreeAwarded: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label>Mô tả (Tiếng Việt)</Label>
                <RichTextEditor
                  value={editCurriculumForm.descriptionVi || ""}
                  onChange={handleDescriptionViChange}
                  placeholder="Mô tả chi tiết về khung chương trình (Tiếng Việt)..."
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label>Mô tả (Tiếng Anh)</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs border cursor-pointer"
                    disabled={isTranslating["descriptionEn"]}
                    onClick={() =>
                      handleTranslate("descriptionVi", "descriptionEn")
                    }
                  >
                    {isTranslating["descriptionEn"] ? (
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                    ) : (
                      <Languages className="mr-1 h-3 w-3" />
                    )}
                    Dịch bằng AI
                  </Button>
                </div>
                <RichTextEditor
                  value={editCurriculumForm.descriptionEn || ""}
                  onChange={handleDescriptionEnChange}
                  placeholder="Description in English..."
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label className="text-base">Áp dụng hiện tại</Label>
              </div>
              <Switch
                checked={editCurriculumForm.isCurrent}
                onCheckedChange={(checked) =>
                  setEditCurriculumForm({
                    ...editCurriculumForm,
                    isCurrent: checked,
                  })
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-banner">Ảnh Banner</Label>
              <div className="space-y-4">
                <Input
                  id="edit-banner"
                  type="file"
                  accept="image/*"
                  disabled={bannerUpload.isUploading}
                  onChange={bannerUpload.handleFileChange}
                />
                {bannerUpload.preview && (
                  <div className="relative mt-2 aspect-video w-full max-w-md overflow-hidden rounded-lg border">
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute right-2 top-2 z-10"
                      disabled={bannerUpload.isUploading}
                      onClick={() => {
                        bannerUpload.reset();
                        setEditCurriculumForm((prev) => ({
                          ...prev,
                          banner: "",
                        }));
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <img
                      src={bannerUpload.preview}
                      alt="Banner preview"
                      className="h-full w-full object-cover"
                    />
                    <ImageUploadOverlay show={bannerUpload.isUploading} />
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditCurriculumOpen(false)}
            >
              Hủy
            </Button>
            <Button
              type="button"
              onClick={handleUpdateCurriculum}
              disabled={isUpdatingCurriculum}
            >
              {isUpdatingCurriculum && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit/Add Section Dialog */}
      <Dialog open={isEditSectionOpen} onOpenChange={setIsEditSectionOpen}>
        <DialogContent
          showCloseButton={false}
          className="fixed top-0 left-0 z-50 w-screen h-screen max-w-none sm:max-w-none translate-x-0 translate-y-0 rounded-none border-0 bg-background p-0 shadow-none flex flex-col gap-0"
        >
          <div className="flex items-center gap-2 border-b p-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditSectionOpen(false)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <DialogHeader className="sm:text-left">
              <DialogTitle>
                {editingSectionId ? "Chỉnh sửa phần" : "Thêm phần mới"}
              </DialogTitle>
            </DialogHeader>
          </div>
          <div className="grid gap-4 py-4 px-6 overflow-y-auto flex-1">
            <div className="grid gap-2">
              <Label htmlFor="section-title">Tiêu đề</Label>
              <Input
                id="section-title"
                value={sectionForm.title || ""}
                onChange={(e) =>
                  setSectionForm({ ...sectionForm, title: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="section-key">Loại nội dung</Label>
              <Select
                value={sectionForm.sectionKey}
                onValueChange={(value) =>
                  setSectionForm({ ...sectionForm, sectionKey: value as any })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại" />
                </SelectTrigger>
                <SelectContent>
                  {SECTION_KEYS.map((key) => (
                    <SelectItem key={key.value} value={key.value}>
                      {key.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="section-content">Nội dung</Label>
              <RichTextEditor
                key={editingSectionId || "new-section"}
                placeholder="Nội dung chi tiết..."
                className="min-h-[300px]"
                value={sectionForm.content || ""}
                onChange={handleSectionContentChange}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="section-order">Thứ tự</Label>
                <Input
                  id="section-order"
                  type="number"
                  value={sectionForm.displayOrder || 0}
                  onChange={(e) =>
                    setSectionForm({
                      ...sectionForm,
                      displayOrder: parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Hiển thị</Label>
                <div className="flex h-10 items-center justify-between rounded-md border px-3">
                  <span className="text-sm text-muted-foreground">
                    Hiện phần này
                  </span>
                  <Switch
                    checked={sectionForm.isVisible}
                    onCheckedChange={(checked) =>
                      setSectionForm({ ...sectionForm, isVisible: checked })
                    }
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="p-4 border-t mt-auto">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditSectionOpen(false)}
            >
              Hủy
            </Button>
            <Button
              type="button"
              onClick={handleSaveSection}
              disabled={isUpdatingSection}
            >
              {isUpdatingSection && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {editingSectionId ? "Cập nhật" : "Thêm mới"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Curriculum Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent className="rounded-2xl border-[#e8e2dc]">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Xác nhận xóa khung chương trình
            </AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa khung chương trình &quot;
              {curriculum.nameVi}&quot;? Tất cả các phần nội dung liên quan cũng
              sẽ bị xóa. Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting} className="cursor-pointer">
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCurriculum}
              disabled={isDeleting}
              className="cursor-pointer bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xóa...
                </>
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
