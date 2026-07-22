import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";

const DEFAULT_IMAGE = "/assets/banner-KT2.png";
const R2_HOST = "pub-58c2a2ce2005492b99460695ee3e5c25.r2.dev";

const clean = (value: string | null, maxLength: number) =>
  (value || "").replace(/\s+/g, " ").trim().slice(0, maxLength);

function safeImageUrl(value: string | null, request: NextRequest) {
  const fallback = new URL(DEFAULT_IMAGE, request.nextUrl.origin).toString();
  if (!value) return fallback;

  try {
    const url = new URL(value, request.nextUrl.origin);
    const isSiteImage = url.origin === request.nextUrl.origin;
    const isR2Image = url.protocol === "https:" && url.hostname === R2_HOST;
    const isBackendUpload =
      url.protocol === "http:" &&
      url.hostname === "localhost" &&
      url.port === "8080" &&
      url.pathname.startsWith("/uploads/");

    return isSiteImage || isR2Image || isBackendUpload
      ? url.toString()
      : fallback;
  } catch {
    return fallback;
  }
}

export async function GET(request: NextRequest) {
  const locale = request.nextUrl.searchParams.get("locale") === "en" ? "en" : "vi";
  const rawTitle =
    clean(request.nextUrl.searchParams.get("title"), 140) ||
    (locale === "vi"
      ? "Khoa Công nghệ Thông tin - Đại học Tân Tạo"
      : "School of Information Technology - Tan Tao University");
  const title = rawTitle.replace(/\s+\|\s+SIT(?:\s+-.*)?$/i, "").trim();
  const description = clean(
    request.nextUrl.searchParams.get("description"),
    125,
  );
  const label =
    clean(request.nextUrl.searchParams.get("label"), 60) ||
    (locale === "vi" ? "KHOA CÔNG NGHỆ THÔNG TIN" : "SCHOOL OF INFORMATION TECHNOLOGY");
  const image = safeImageUrl(request.nextUrl.searchParams.get("image"), request);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#f5f1ea",
          color: "#151823",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            width: "68%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "60px 56px 48px 64px",
            borderTop: "16px solid #ba4811",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                color: "#ba4811",
                fontSize: 23,
                fontWeight: 700,
                letterSpacing: "0.09em",
              }}
            >
              {label}
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 32,
                fontSize: title.length > 82 ? 46 : title.length > 55 ? 54 : 62,
                fontWeight: 800,
                lineHeight: 1.08,
                letterSpacing: "-0.035em",
              }}
            >
              {title}
            </div>
            {description ? (
              <div
                style={{
                  display: "flex",
                  marginTop: 26,
                  color: "#555a64",
                  fontSize: 25,
                  lineHeight: 1.35,
                }}
              >
                {description}
              </div>
            ) : null}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              color: "#343842",
              fontSize: 23,
              fontWeight: 700,
            }}
          >
            sit.ttu.edu.vn <span style={{ marginLeft: 12, color: "#ba4811" }}>→</span>
          </div>
        </div>
        <div
          style={{
            position: "relative",
            width: "32%",
            height: "100%",
            display: "flex",
            overflow: "hidden",
            background: "#ba4811",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt=""
            width={420}
            height={630}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              background: "linear-gradient(90deg, rgba(186,72,17,.18), transparent 55%)",
            }}
          />
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      },
    },
  );
}
