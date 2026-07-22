import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import {
  BackendSession,
  callBackend,
  clearSessionCookies,
  setSessionCookies,
  toNextResponse,
} from "@/lib/server/backend";

type RouteContext = { params: Promise<{ path: string[] }> };

async function proxy(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  const search = request.nextUrl.search;
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;
  const refreshToken = cookieStore.get("refresh_token")?.value;
  const body = ["GET", "HEAD"].includes(request.method)
    ? undefined
    : await request.arrayBuffer();
  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  if (contentType) headers.set("Content-Type", contentType);

  const execute = (token?: string) =>
    callBackend(`${path.join("/")}${search}`, {
      method: request.method,
      headers,
      body,
    }, token);

  let backendResponse = await execute(accessToken);
  let rotatedSession: BackendSession | undefined;

  if (backendResponse.status === 401 && refreshToken) {
    const refreshResponse = await callBackend("auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (refreshResponse.ok) {
      rotatedSession = (await refreshResponse.json()) as BackendSession;
      backendResponse = await execute(rotatedSession.accessToken);
    }
  }

  const response = await toNextResponse(backendResponse);
  if (rotatedSession) setSessionCookies(response, rotatedSession);
  else if (backendResponse.status === 401) clearSessionCookies(response);
  return response;
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
