import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  callBackend,
  clearSessionCookies,
} from "@/lib/server/backend";

export async function DELETE() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refresh_token")?.value;

  if (refreshToken) {
    await callBackend("auth/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    }).catch(() => undefined);
  }

  const response = NextResponse.json({ success: true });
  clearSessionCookies(response);
  return response;
}
