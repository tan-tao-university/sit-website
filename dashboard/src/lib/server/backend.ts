import "server-only";
import { NextResponse } from "next/server";

export interface BackendSession {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: unknown;
}

export function getBackendConfig() {
  const baseUrl =
    process.env.INTERNAL_API_URL || "http://localhost:8080/api/v1";
  const apiKey = process.env.API_ACCESS_KEY;
  if (!apiKey) throw new Error("API_ACCESS_KEY is required");
  return { baseUrl: baseUrl.replace(/\/$/, ""), apiKey };
}

export function setSessionCookies(
  response: NextResponse,
  session: BackendSession,
) {
  const secure = process.env.NODE_ENV === "production";
  response.cookies.set("access_token", session.accessToken, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: session.expiresIn,
  });
  response.cookies.set("refresh_token", session.refreshToken, {
    httpOnly: true,
    secure,
    sameSite: "strict",
    path: "/",
    maxAge: 30 * 24 * 60 * 60,
  });
}

export function clearSessionCookies(response: NextResponse) {
  response.cookies.delete("access_token");
  response.cookies.delete("refresh_token");
}

export async function callBackend(
  path: string,
  init: RequestInit = {},
  accessToken?: string,
) {
  const { baseUrl, apiKey } = getBackendConfig();
  const headers = new Headers(init.headers);
  headers.set("X-API-Key", apiKey);
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

  return fetch(`${baseUrl}/${path.replace(/^\//, "")}`, {
    ...init,
    headers,
    cache: "no-store",
  });
}

export async function toNextResponse(response: Response) {
  const headers = new Headers(response.headers);
  headers.delete("content-encoding");
  headers.delete("content-length");
  headers.delete("transfer-encoding");
  headers.delete("set-cookie");

  return new NextResponse(await response.arrayBuffer(), {
    status: response.status,
    headers,
  });
}
