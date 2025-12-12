import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();

    // CHANGE THIS to your actual cookie name
    const token = cookieStore.get("gh_token")?.value;

    if (!token) {
      return Response.json({ authenticated: false }, { status: 200 });
    }

    // Optional: lightweight GitHub validation
    const res = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "jon-gracias-portfolio",
      },
      // Important: avoid caching auth state
      cache: "no-store",
    });

    if (!res.ok) {
      return Response.json({ authenticated: false }, { status: 200 });
    }

    const user = await res.json();

    return Response.json(
      {
        authenticated: true,
        username: user.login,
      },
      { status: 200 }
    );
  } catch {
    // Fail closed
    return Response.json({ authenticated: false }, { status: 200 });
  }
}
