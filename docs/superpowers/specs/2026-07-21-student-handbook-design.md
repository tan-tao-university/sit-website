# Sổ tay sinh viên — thiết kế

## Bối cảnh

Trang Sổ tay sinh viên (`/vi/sinh-vien/so-tay`, `/en/students/handbook`) hiện đang
**hardcode nội dung** trong `app/src/components/StudentHandbookPageContent.tsx`.
Cần: admin ở dashboard **upload 1 file PDF**, hệ thống **trích nội dung** và hiển thị
dạng text theo design (không phải PDF preview). Mỗi năm đổi file khác.

Ràng buộc quan trọng: **file mỗi năm có thể khác cấu trúc hoàn toàn** → không map vào
template cố định, mà trích chính outline tự nhiên của PDF rồi render bằng typography nhất quán.

Backend deploy trên Vercel (serverless, filesystem read-only) → parse PDF phải chạy được serverless.

## Quyết định đã chốt

1. **Xử lý nội dung**: trích tự động → admin xem/sửa trong editor → publish (an toàn cho tài liệu chính thức).
2. **Song ngữ**: upload PDF riêng cho mỗi ngôn ngữ (EN tùy chọn, để trống được).
3. **PDF gốc**: lưu lên R2, app hiện nút "Tải bản PDF gốc".
4. **Lịch sử**: lưu nhiều bản theo năm học, xem lại được.

## Biểu diễn nội dung

Dùng **Yoopta JSON** (giống module `news`): dashboard sửa bằng Yoopta editor có sẵn,
app render bằng `YooptaRenderer` có sẵn. Luồng: PDF → HTML (backend) → Yoopta value
(deserialize HTML ở client bằng `@yoopta/exports`) → admin sửa → lưu JSON.

## Data model — bảng `handbook` (mỗi năm học 1 dòng)

```
handbook
  id           uuid pk
  schoolYear   varchar unique   -- "2023-2024" (nhãn + slug archive)
  status       varchar          -- 'draft' | 'published'
  contentVi    jsonb null       -- Yoopta value
  contentEn    jsonb null
  pdfUrlVi     text null
  pdfUrlEn     text null
  createdAt / updatedAt
```

2 cột vi/en thay bảng translation riêng (chỉ 2 ngôn ngữ cố định, ít dòng).
Bản hiện hành = `status='published'` có `schoolYear` lớn nhất (sort desc, không cần cờ isCurrent).

## Backend — module `handbook` (mirror `news`)

- `GET /handbook/current?lang=vi` — edition hiện hành (public)
- `GET /handbook` — list (public: chỉ published; admin: all qua query) — cho archive
- `GET /handbook/:schoolYear` — 1 edition (public)
- `POST /handbook`, `PUT /handbook/:id`, `DELETE /handbook/:id` — admin (JwtAuthGuard + RolesGuard admin)
- `POST /handbook/extract?lang=vi` — admin: nhận PDF (multipart) → lưu R2 (UploadService) →
  trích HTML → trả `{ html, pdfUrl }`.

Util `handbook-extract`: PDF buffer → HTML bằng `unpdf` (serverless-safe) + heuristic
đánh số (`I.` `1.` `1.1` `A.` `a)`) để dựng heading/list. Không cần hoàn hảo (admin sửa).
Kèm self-check assert.

## Dashboard

- `/(dashboard)/handbook/page.tsx` — list edition
- `/(dashboard)/handbook/create/page.tsx` — tạo: nhập năm học, upload PDF VN → editor, PDF EN → editor, lưu
- `/(dashboard)/handbook/[id]/page.tsx` — sửa
- Thêm `api.handbook.*` + `api.handbook.extract()` vào `lib/api.ts`
- Thêm dep `@yoopta/exports` (deserialize HTML → Yoopta)
- Thêm link nav sidebar

## App

- `StudentHandbookPageContent` → server component: fetch edition hiện hành, render `contentVi/En`
  bằng `YooptaRenderer`, nhãn năm học, nút tải PDF, danh sách "Các năm trước".
- Route động `/vi/sinh-vien/so-tay/[schoolYear]` + `/en/students/handbook/[schoolYear]` xem năm cũ.
- Thêm `api.handbook.*` vào `app/src/lib/api.ts`.
- EN trống → fallback nội dung VN.

## Tái sử dụng vs mới

Tái dùng: `UploadService` (R2), `YooptaRenderer`, Yoopta editor, pattern `news`, pattern drizzle,
`fetchWithAuth`. Mới: bảng + migration `handbook`, module `handbook` (6 route + extract util),
trang dashboard (list/create/edit), route archive app, sửa `StudentHandbookPageContent`.

## Bỏ qua có chủ đích (YAGNI)

- `contentText` cho search (news có, handbook chưa cần) — thêm khi muốn search handbook.
- Cờ `isCurrent` — dùng "published + schoolYear lớn nhất".
- Bảng version riêng — mỗi năm là 1 dòng, đủ.
