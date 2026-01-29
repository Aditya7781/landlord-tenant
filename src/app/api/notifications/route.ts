import { NextRequest, NextResponse } from "next/server";



/* ------------------ BACKEND APIS ------------------ */



const SEND_NOTIFICATION_API =

  "https://ntqffznzmh.execute-api.ap-south-1.amazonaws.com/dev/send_notification_to_single_user";



const FETCH_NOTIFICATION_API =

  "https://838tku002k.execute-api.ap-south-1.amazonaws.com/dev/fetch_notifications";



/* ------------------ TOKEN HELPERS ------------------ */
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

/* ------------------ FETCH NOTIFICATIONS ------------------ */
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

    const response = await fetch(FETCH_NOTIFICATION_API, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data?.message || "Failed to fetch notifications" },
        { status: response.status }
      );
    }

    // normalize response so frontend always gets consistent shape
    return NextResponse.json({
      success: true,
      notifications: data.notifications || data,
    });
  } catch (error) {
    console.error("Fetch notification API error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

/* ------------------ SEND NOTIFICATION ------------------ */
export async function POST(request: NextRequest) {
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

    const { toEmail, title, message } = await request.json();
    if (!toEmail || !title || !message) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const response = await fetch(SEND_NOTIFICATION_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ toEmail, title, message }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data?.message || "Failed to send notification" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Send notification API error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
