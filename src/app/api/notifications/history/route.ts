import { NextRequest, NextResponse } from "next/server";

const NOTIFICATION_HISTORY_API = "https://ntqffznzmh.execute-api.ap-south-1.amazonaws.com/dev/get_notification_history";

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

function normalizeToken(raw: string | null): string | null {
  if (!raw) return null;
  const t = raw.trim();
  if (!t) return null;
  try {
    return decodeURIComponent(t);
  } catch {
    return t;
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const match = authHeader?.match(/^Bearer\s+(.+)$/i);
    let token = normalizeToken(match?.[1] || null);

    if (!token) {
      token = getTokenFromCookie(request.headers.get("cookie"));
    }

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const readmore = searchParams.get("readmore");

    // Build URL with query parameters
    let apiUrl = NOTIFICATION_HISTORY_API;
    if (readmore) {
      apiUrl += `?readmore=${encodeURIComponent(readmore)}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        {
          success: false,
          message: `Backend API error (${response.status}): ${errorText}`,
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Return the response as-is from the backend API
    return NextResponse.json({
      success: true,
      data: data,
    });

  } catch (error) {
    console.error("Notification history API error:", error);

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        return NextResponse.json(
          { success: false, message: "Request timeout. Please try again." },
          { status: 408 }
        );
      }

      if (error.message.includes("Failed to fetch")) {
        return NextResponse.json(
          {
            success: false,
            message: "Network error. Unable to connect to notification service. Please check your connection and try again.",
          },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      { success: false, message: "An unexpected error occurred. Please try again later." },
      { status: 500 }
    );
  }
}
