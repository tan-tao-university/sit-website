"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Loader2, Save, Upload } from "lucide-react";
import type { YooptaContentValue } from "@yoopta/editor";

import { api, type Handbook } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { YooptaEditorComponent } from "@/components/ui/yoopta-editor";

type Lang = "vi" | "en";

// Per-language content: editor value, original PDF url, and a transient HTML
// string used once to import extracted PDF content into the editor.
type LangState = {
  content?: YooptaContentValue;
  pdfUrl?: string;
  seedHtml?: string;
  uploading: boolean;
};

function emptyLang(handbook?: Handbook, lang?: Lang): LangState {
  return {
    content: handbook?.[lang === "en" ? "contentEn" : "contentVi"],
    pdfUrl: handbook?.[lang === "en" ? "pdfUrlEn" : "pdfUrlVi"],
    uploading: false,
  };
}

export function HandbookForm({ handbook }: { handbook?: Handbook }) {
  const router = useRouter();
  const { toast } = useToast();

  const [schoolYear, setSchoolYear] = useState(handbook?.schoolYear ?? "");
  const [status, setStatus] = useState<"draft" | "published">(
    (handbook?.status as "draft" | "published") ?? "draft",
  );
  const [vi, setVi] = useState<LangState>(emptyLang(handbook, "vi"));
  const [en, setEn] = useState<LangState>(emptyLang(handbook, "en"));
  const [saving, setSaving] = useState(false);

  const setLang = (lang: Lang) => (lang === "vi" ? setVi : setEn);

  async function handleUpload(lang: Lang, file: File) {
    if (file.type !== "application/pdf") {
      toast({ variant: "destructive", title: "Vui lòng chọn file PDF" });
      return;
    }
    setLang(lang)((s) => ({ ...s, uploading: true }));
    try {
      const { pdfUrl, html } = await api.handbook.extract(file, lang);
      setLang(lang)((s) => ({ ...s, pdfUrl, seedHtml: html, uploading: false }));
      toast({
        title: "Đã trích nội dung từ PDF",
        description: "Kiểm tra và chỉnh sửa lại nội dung trước khi lưu.",
      });
    } catch (error) {
      console.error(error);
      setLang(lang)((s) => ({ ...s, uploading: false }));
      toast({
        variant: "destructive",
        title: "Không thể trích xuất PDF",
        description: error instanceof Error ? error.message : undefined,
      });
    }
  }

  async function handleSave() {
    if (!/^\d{4}-\d{4}$/.test(schoolYear)) {
      toast({
        variant: "destructive",
        title: "Năm học không hợp lệ",
        description: "Định dạng: YYYY-YYYY, ví dụ 2023-2024.",
      });
      return;
    }
    setSaving(true);
    const payload = {
      schoolYear,
      status,
      contentVi: vi.content,
      contentEn: en.content,
      pdfUrlVi: vi.pdfUrl,
      pdfUrlEn: en.pdfUrl,
    };
    try {
      if (handbook) {
        await api.handbook.update(handbook.id, payload);
      } else {
        await api.handbook.create(payload);
      }
      toast({ title: handbook ? "Đã cập nhật" : "Đã tạo sổ tay" });
      router.push("/handbook");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Không thể lưu",
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">
          {handbook ? "Sửa sổ tay sinh viên" : "Tạo sổ tay sinh viên"}
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/handbook")}>
            Hủy
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Lưu
          </Button>
        </div>
      </div>

      <Card className="border shadow-none">
        <CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="schoolYear">Năm học</Label>
            <Input
              id="schoolYear"
              placeholder="2023-2024"
              value={schoolYear}
              onChange={(e) => setSchoolYear(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Trạng thái</Label>
            <Select
              value={status}
              onValueChange={(v) => setStatus(v as "draft" | "published")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Bản nháp</SelectItem>
                <SelectItem value="published">Đã xuất bản</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <LangEditor
        title="Nội dung tiếng Việt"
        lang="vi"
        state={vi}
        onUpload={handleUpload}
        onChange={(content) => setVi((s) => ({ ...s, content }))}
      />
      <LangEditor
        title="Nội dung tiếng Anh (tùy chọn)"
        lang="en"
        state={en}
        onUpload={handleUpload}
        onChange={(content) => setEn((s) => ({ ...s, content }))}
      />
    </div>
  );
}

function LangEditor({
  title,
  lang,
  state,
  onUpload,
  onChange,
}: {
  title: string;
  lang: Lang;
  state: LangState;
  onUpload: (lang: Lang, file: File) => void;
  onChange: (content: YooptaContentValue) => void;
}) {
  const inputId = `pdf-${lang}`;
  return (
    <Card className="border shadow-none">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-lg">{title}</CardTitle>
        <div className="flex items-center gap-3">
          {state.pdfUrl && (
            <a
              href={state.pdfUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-sm text-primary underline underline-offset-4"
            >
              <FileText className="h-4 w-4" /> PDF gốc
            </a>
          )}
          <input
            id={inputId}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onUpload(lang, file);
              e.target.value = "";
            }}
          />
          <Button
            type="button"
            variant="outline"
            disabled={state.uploading}
            onClick={() => document.getElementById(inputId)?.click()}
          >
            {state.uploading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            Upload PDF
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <p className="mb-3 text-sm text-muted-foreground">
          Upload PDF để trích nội dung tự động, sau đó chỉnh sửa lại bên dưới
          trước khi lưu.
        </p>
        <div className="rounded-md border p-2">
          <YooptaEditorComponent
            value={state.content}
            seedHtml={state.seedHtml}
            onChange={onChange}
          />
        </div>
      </CardContent>
    </Card>
  );
}
