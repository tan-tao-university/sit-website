import { NextRequest, NextResponse } from "next/server";

type RouteContext = { params: Promise<{ path: string[] }> };

const PUBLIC_RESOURCES = new Set([
  "programs",
  "curriculums",
  "sections",
  "courses",
  "search",
  "news",
  "events",
  "career-opportunities",
  "popup-banners",
  "research",
  "achievements",
  "alumni",
  "alumni-sections",
  "faculty",
]);

export async function GET(request: NextRequest, context: RouteContext) {
  const baseUrl = (
    process.env.INTERNAL_API_URL || "http://localhost:8080/api/v1"
  ).replace(/\/$/, "");
  const apiKey = process.env.API_ACCESS_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { message: "API proxy is not configured" },
      { status: 503 },
    );
  }

  const { path } = await context.params;
  if (!path[0] || !PUBLIC_RESOURCES.has(path[0])) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }
  const backendResponse = await fetch(
    `${baseUrl}/${path.join("/")}${request.nextUrl.search}`,
    {
      headers: { "X-API-Key": apiKey },
      cache: "no-store",
    },
  );
  const headers = new Headers(backendResponse.headers);
  headers.delete("content-encoding");
  headers.delete("content-length");
  headers.delete("transfer-encoding");

  return new NextResponse(await backendResponse.arrayBuffer(), {
    status: backendResponse.status,
    headers,
  });
}
