import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ ok: true });

  // Ensure delete matches how the cookie was set (path is the common culprit)
  res.cookies.set("gh_token", "", {
    path: "/",
    maxAge: 0,
  });

  // Extra: prevent caching
  res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.headers.set("Pragma", "no-cache");
  res.headers.set("Expires", "0");

  return res;
}
