import { NextRequest, NextResponse } from "next/server";

const DASHBOARD_API =
  "https://838tku002k.execute-api.ap-south-1.amazonaws.com/dev/my";

function getTokenFromCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const m = cookieHeader.match(/\bsession_token=([^;]*)/);
  if (!m) return null;
  try {
    return decodeURIComponent(m[1].trim());
  } catch {
    return m[1].trim();
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    let query = searchParams.get("query") || "dashboard";

    // ✅ Added support for query=me
    if (query === "me") {
      query = "me";
    }

    const authHeader = request.headers.get("authorization");
    const match = authHeader?.match(/^Bearer\s+(.+)$/i);
    let token: string | null = match?.[1]?.trim() || null;
    if (token) {
      try {
        token = decodeURIComponent(token);
      } catch {
        // ignore
      }
    }

    // Fallback: use session_token from Cookie (browser sends it for same-origin /api)
    if (!token) {
      token = getTokenFromCookie(request.headers.get("cookie"));
    }

    // Debug (remove in production)
    console.log(
      "[api/my] Authorization header:",
      authHeader == null
        ? "MISSING"
        : `present, prefix: ${authHeader!.substring(0, 25)}...`,
    );
    console.log(
      "[api/my] token:",
      token
        ? `yes, length=${token.length}, from: ${match ? "Authorization" : "Cookie"}`
        : "NO",
    );
    console.log("[api/my] query:", query);

    if (!token) {
      console.log("[api/my] returning 401: no token");
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const url = `${DASHBOARD_API}?query=${encodeURIComponent(
      query,
    )}&authToken=${encodeURIComponent(token)}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (response.ok) {
      return NextResponse.json(data);
    }
    console.log(
      "[api/my] backend error:",
      response.status,
      data?.message || data,
    );
    return NextResponse.json(
      { success: false, message: data.message || "Failed to fetch dashboard" },
      { status: response.status },
    );
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      { success: false, message: "Network error. Please try again." },
      { status: 500 },
    );
  }
}
