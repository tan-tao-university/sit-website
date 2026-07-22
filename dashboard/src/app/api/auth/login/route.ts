import { NextResponse } from "next/server";
import {
  BackendSession,
  callBackend,
  setSessionCookies,
  toNextResponse,
} from "@/lib/server/backend";

export async function POST(request: Request) {
  const body = await request.text();
  const backendResponse = await callBackend("auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });

  if (!backendResponse.ok) return toNextResponse(backendResponse);

  const session = (await backendResponse.json()) as BackendSession;
  const response = NextResponse.json({ user: session.user });
  setSessionCookies(response, session);
  return response;
}
