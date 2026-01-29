import { NextRequest, NextResponse } from "next/server";

const TRIGGER_NOTIFICATION_API =
  "https://ntqffznzmh.execute-api.ap-south-1.amazonaws.com/dev/trigger_notification";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer '

    // Call the backend trigger notification API
    const response = await fetch(TRIGGER_NOTIFICATION_API, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (response.ok) {
      return NextResponse.json(data);
    } else {
      return NextResponse.json(
        {
          success: false,
          message: data.message || "Failed to trigger notifications",
        },
        { status: response.status },
      );
    }
  } catch (error) {
    console.error("Trigger notification API error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Network error. Please try again.",
      },
      { status: 500 },
    );
  }
}

